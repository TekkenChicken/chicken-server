//Node Modules
const fs        = require('fs')
const path      = require('path')
const mysql     = require('mysql')

const JSONDIR = path.join(__dirname, 'tekken-frame-data', 't7')
const METADIR = path.join(__dirname, 'json')
const GIFSDIR = path.join(__dirname, 'gifs')


const Schema = {
    FrameData: {
        tables: {Characters: 'Characters_TC', Attacks: 'Attacks_TC'},
        sql: fs.readFileSync(path.join(__dirname, 'schema/framedata.sql'), {encoding: 'utf-8'})
    },
    Users: {
        tables: {Users: 'Users_TC', Permissions: 'Permissions_TC', UserPerms: 'Permissions_Users_TC'},
        sql: fs.readFileSync(path.join(__dirname, 'schema/users.sql'), {encoding: 'utf-8'})
    }
}


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
    connectTimeout: 30000,
    multipleStatements: true
})


const attackFiles = fs.readdirSync(JSONDIR)
const attackData = attackFiles.map((filename) => require(path.join(JSONDIR, filename)))
let attacks = {}

const gifFiles = fs.readdirSync(GIFSDIR)
const gifData = gifFiles.map((filename) => require(path.join(GIFSDIR, filename)))
let gifs = gifData.reduce((acc, value) => {
    acc[value.name] = value.gifs
    return acc
}, {})

console.log("AttackFiles: ", attackFiles)
console.log("gifFiles: ", gifFiles)

for(let data of attackData)
{
    if(data.metadata.type == 'normal') {
        let charGifs = gifs[data.metadata.character]
        if(!charGifs) {
            console.log("No gif data for " + data.metadata.character)
        }
        
        attacks[data.metadata.character] = data.moves.map((move, index) => {

            let gifUrl = null

            if(charGifs && charGifs[move.notation])
                gifUrl = charGifs[move.notation]

            return Object.assign({}, move, {attack_num: index + 1, gif_url: gifUrl})
        })

    }
}

console.log(Object.keys(attacks))

const charactersQuery = `SELECT id, label FROM ${Schema.FrameData.tables.Characters}`
pool.getConnection((err, connection) => {
    if(err) throw err;

    connection.query(charactersQuery, (err, rows) => {
        if(err) throw err;

        let queriesToBeExecuted = '';
        for(let row of rows) {
            if(attacks[row.label]) {
                console.log('Building query for ' + row.label);
                let attackStrings = attacks[row.label].map((attack) => buildStrings(Object.assign({}, attack, {character_id: row.id})))
                let columns = attackStrings[0].columns;
                let values = attackStrings.map((attack) => attack.values).join(',');
                queriesToBeExecuted += mysql.format(`DELETE FROM ${Schema.FrameData.tables.Attacks} WHERE character_id = ?;`, row.id)
                queriesToBeExecuted += `INSERT INTO ${Schema.FrameData.tables.Attacks} ${columns} VALUES ${values};`
            }
        }

        connection.query(queriesToBeExecuted, (err) => {
            connection.release();
            if(err) throw err;

            console.log('We did it!')

        })

    })
})


//Helper Function
function buildStrings(options) {
    let keys = Object.keys(options);

    let columns = `(${keys[0]}`
    let data = `('${options[keys[0]]}'`

    for(let i = 1; i < keys.length; i++) {
        columns = columns.concat(`,${keys[i]}`)
        data = data.concat(`,'${options[keys[i]]}'`)
    }

    columns = columns.concat(')')
    data = data.concat(')')


    return {columns: columns, values: data}

}