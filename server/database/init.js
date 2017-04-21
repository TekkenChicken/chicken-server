const fs = require('fs')
const path = require('path')
const { Pool, Query } = require('pg')

//Database set up
const _USER = process.env.PG_USER
const _PASS = process.env.PG_PASS
const _DB = process.env.PG_DB || 'tekken-chicken'
const _HOST = process.env.PG_HOST || 'localhost'
const _PORT = process.env.PG_PORT || 5432

let pool = new Pool({
    user: _USER,
    password: _PASS,
    database: _DB,
    host: _HOST,
    port: _PORT,
    max: 50, 
    idleTimeoutMillis: 30000
})

const initTimestamp = Math.floor(Date.now() / 1000)


const schema = new Query(fs.readFileSync(path.join(__dirname, 'schema.sql'), {encoding: 'utf8'}))

function buildSchema() {
    console.log('Structuring database.')

    return pool.connect().then(client => {
        return client.query(schema).then(() => client.release(), err => {
            client.release
        })
    }, err => {
        console.log(err)
        process.exit(0)
    })
}


function insertData() {
    const characters = require('./json/framedata.js')

    for(character of characters) {
        const name = character.metadata.name
        const label = character.metadata.character
        const game = character.metadata.game
        const data = character.moves


        const characterQuery = buildInsertQuery('characters', {name: name, label: label, game: game})
        pool.connect().then(client => {
            client.query(characterQuery).then(() => {
                return getCharacterId(name)
            })
            .then(id => {
                console.log(`Inserting move data for ${name}`)
                for(let i = 0; i < data.length; i++) {
                    let move = data[i]
                    move.character_id = id

                    const moveQuery = buildInsertQuery('attacks', move)
                    let query = client.query(moveQuery).catch( (err) => {
                        console.log(`${err}\n${moveQuery}`)
                        process.exit(0)
                    })

                    if(i == data.length - 1)
                        query.then(() => client.release())
                }
            })
        })
    }
}

function getCharacterId(name) {
    //const query = knex('characters').select('id').where({name: name}).toString();
    const query = `SELECT id FROM characters WHERE name=${name}`

    return pool.connect().then(client => {
        return client.query(query).then(res => {
            client.release()
            return res.rows[0].id
        }, err => {
            console.log(err)
            process.exit(0)
        })
    }, err => {
        console.log(err)
        process.exit(0)
    })
}

function buildInsertQuery(table, options) {
    let keys = options.keys;

    let columns = `(${keys[0]}`
    let data = '(${options[keys[0]]}'

    for(let i = 1; i < keys.length; i++) {
        columns = columns.concat(`,${keys[i]}`)
        data = data.concat(`,${options[keys[i]]}`)
    }

    columns = columns.concat(')')
    data = data.concat(')')

    return `INSERT INTO ${table} ${columns} VALUES ${data};`
}

buildSchema().then(() => {
    insertData()
})