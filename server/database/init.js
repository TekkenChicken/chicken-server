//Node Modules
const fs        = require('fs')
const path      = require('path')
const mysql     = require('mysql')

/*
//Database Schema
const Schema = {
    Characters : fs.readFileSync(path.join(__dirname, 'schema/characters.sql'), {encoding: 'utf-8'}),
    Attacks : fs.readFileSync(path.join(__dirname, 'schema/attacks.sql'), {encoding: 'utf-8'}),
    Users : fs.readFileSync(path.join(__dirname, 'schema/users.sql'), {encoding: 'utf-8'})
}
//Database table names
const Tables = {
    Characters : 'Characters_TC',
    Attacks : 'Attacks_TC',
    Users : 'Users_TC'
}

*/
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


//Helper Function
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

//Insert Character Data
function insertData() { 
    const characters = require('./json/framedata.js')
    var completedCharacters = 0;

    for(character of characters) {
        const name = character.metadata.name
        const label = character.metadata.character
        const game = character.metadata.game
        const data = character.moves


        const characterQuery = buildInsertQuery(Schema.FrameData.tables.Characters, {name: name, label: label, game: game, last_updated: initTimestamp})

        pool.getConnection((err, connection) => {
            connection.query(characterQuery, (err, results) => {
                if(err) {
                    console.log(`Error creating character ${name}.\nError: ${err.message}`)
                    
                    connection.release()
                    return;
                }
                //Character created
                //Insert move data
                console.log(`Inserting move data for ${name}`)

                let id = (results.insertId)
                for(let i = 0; i < data.length; i++) {
                    let move = data[i]
                    move.character_id = id

                    const moveQuery = buildInsertQuery(Schema.FrameData.tables.Attacks, move)
                    let query = connection.query(moveQuery, (err) => {
                        if(err) {
                            console.log(`Error inserting move. Query: ${moveQuery}\nError: ${err.message}`)
                            connection.release()
                            return;
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


const initTimestamp = Math.floor(Date.now() / 1000)

console.log('Structuring database.')


//Build Framedata Schema
pool.getConnection((err, connection) => {
    if(err) {
        console.log(`Error connecting to DB: ${err.code}`)
        process.exit(-1)
    }

    connection.query(Schema.FrameData.sql, (err) => {
        connection.release()
        if(err) {
            if(err.code == 'ER_TABLE_EXISTS_ERROR') {
                console.log(`ERROR: Table already exists: ${Schema.FrameData.tables.Characters}. Cannot initialize Framedata schema.`)
            } else {
                console.log(err)
            }
            connection.release()
            return;
        }

        console.log('Framedata Schema created')

        //Insert character data into fresh database
        insertData()


    })
})

pool.getConnection((err, connection) => {
    if(err) {
        console.log(`Error connecting to DB: ${err.code}`)
        process.exit(-1)
    }

    connection.query(Schema.Users, (err) => {
        if(err) {
            if(err.code == 'ER_TABLE_EXISTS_ERROR') {
                console.log(`ERROR: Table already exists: ${Schema.Users.table.Users}`)

                connection.release()
                return;
            }

            console.log(`Error: ${err.code}`)
            connection.release()
            return;
        }

        console.log('Success.')
        connection.release()
    })
})