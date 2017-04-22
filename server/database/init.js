//Node Modules
const fs        = require('fs')
const path      = require('path')
const mysql     = require('mysql')

//Database table names
const _CharactersTable  = 'Characters_TC'
const _AttacksTable     = 'Attacks_TC'

//Database set up
const _USER     = process.env.DB_USER
const _PASS     = process.env.DB_PASS
const _DB       = process.env.DB_NAME || 'tekkenchicken'
const _HOST     = process.env.DB_HOST || 'localhost'
const _PORT     = process.env.DB_PORT || 3306

let pool = mysql.createPool({
    user: _USER,
    password: _PASS,
    database: _DB,
    host: _HOST,
    port: _PORT,
    connectionLimit: 50, 
    connectTimeout: 30000
})


const initTimestamp = Math.floor(Date.now() / 1000)

//Build schema
console.log('Structuring database.')

const characterSchema = fs.readFileSync(path.join(__dirname, 'schema/characters.sql'), {encoding: 'utf-8'})
const attacksSchema = fs.readFileSync(path.join(__dirname, 'schema/attacks.sql'), {encoding: 'utf-8'})

pool.getConnection((err, connection) => {
    if(err) {
        console.log(err)
        process.exit(-1)
    }

    connection.query(characterSchema, (err) => {
        if(err) {
            if(err.code == 'ER_TABLE_EXISTS_ERROR') {
                console.log(`ERROR: Table already exists: ${_CharactersTable}. Cannot initialize.`)
                process.exit(-1)
            } else {
                console.log(err)
                process.exit(-1)
            }
        }

        connection.query(attacksSchema, (err) => {
            if(err) {
                if(err.code == 'ER_TABLE_EXISTS_ERROR') {
                    console.log(`ERROR: Table already exists: ${_AttacksTable}. Cannot initialize.`)
                    process.exit(-1)
                } else {
                    console.log(err)
                    process.exit(-1)
                }
            }

            console.log('Schema created')
            connection.release()

            //Insert character data into fresh database
            insertData()
        })


    })
})


//Insert Character Data
function insertData() { 
    const characters = require('./json/framedata.js')
    var completedCharacters = 0;

    for(character of characters) {
        const name = character.metadata.name
        const label = character.metadata.character
        const game = character.metadata.game
        const data = character.moves


        const characterQuery = buildInsertQuery(_CharactersTable, {name: name, label: label, game: game, last_updated: initTimestamp})

        pool.getConnection((err, connection) => {
            connection.query(characterQuery, (err, results) => {
                if(err) {
                    console.log(`Error creating character ${name}.\nError: ${err.message}`)
                    process.exit(-1)
                }
                //Character created
                //Insert move data
                console.log(`Inserting move data for ${name}`)

                let id = (results.insertId)
                for(let i = 0; i < data.length; i++) {
                    let move = data[i]
                    move.character_id = id

                    const moveQuery = buildInsertQuery(_AttacksTable, move)
                    let query = connection.query(moveQuery, (err) => {
                        if(err) {
                            console.log(`Error inserting move. Query: ${moveQuery}\nError: ${err.message}`)
                            process.exit(-1)
                        }

                        //Let go of connection after final query
                        if(i == data.length - 1) {
                            completedCharacters++
                            console.log(`${name} completed. ${completedCharacters}/${characters.length}`)
                            connection.release()

                            if(completedCharacters == characters.length) {
                                pool.end()
                            }
                        }
                    })

                }
            })
        })
    }
}

function buildInsertQuery(table, options) {
    let keys = Object.keys(options);

    let columns = `(${keys[0]}`
    let data = `('${options[keys[0]]}'`

    for(let i = 1; i < keys.length; i++) {
        columns = columns.concat(`,${keys[i]}`)
        data = data.concat(`,'${options[keys[i]]}'`)
    }

    columns = columns.concat(')')
    data = data.concat(')')


    return `INSERT INTO ${table} ${columns} VALUES ${data};`
}

/*
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
*/
