//Node modules
const mysql = require('mysql')
const uuid = require('uuid/v4')
//Constants
const _SESSIONTIME = 86400

//Database Constants
const _USER     = process.env.DB_USER
const _PASS     = process.env.DB_PASS
const _DB       = process.env.DB_NAME || 'tekkenchicken'
const _HOST     = process.env.DB_HOST || 'localhost'
const _PORT     = process.env.DB_PORT || 3306

let ServerStore = (function(){

    const constants = {
        CHARACTERS_TABLE: 'Characters_TC',
        ATTACKS_TABLE: 'Attacks_TC',
        PROPERTIES_TABLE: 'Properties_TC',
        ATTACK_PROPERTIES_TABLE: 'Attack_Properties_TC',
        USERS_TABLE: 'Users_TC',
        PERMISSIONS_TABLE: 'Permissions_TC',
        USER_PERMISSIONS_TABLE: 'Permissions_Users_TC'
    }

    let pool = mysql.createPool({
        user: _USER,
        password: _PASS,
        database: _DB,
        host: _HOST,
        port: _PORT,
        connectionLimit: 50, 
        connectTimeout: 30000
    })

    let sessions = new Map()

    let store = {
        getDatabaseConnection: function() {
            return new Promise((resolve, reject) => {
                pool.getConnection((err, connection) => {
                    if(err) reject(err)
                    else resolve(connection)
                })
            })
        },

        newSession: function(accountName) {
            const accessToken = uuid()
            const expirationTime = Date.now() + (_SESSIONTIME * 1000)

            let session = {
                accountName: accountName,
                expirationTime: expirationTime,
                token: accessToken
            }

            sessions.set(accountName, session)
            return session;
        },

        isValidSession(accountName, accessToken) {
            let session = sessions.get(accountName)
            if(!session) {
                return false
            }

            if(session.accessToken != accessToken) {
                return false
            }

            let isExpired = (Date.now() > session.expirationTime)

            if(isExpired) {
                sessions.delete(accountName)
                return false
            }

            return true
        }

    }

    store.constants = constants
    return store
})()

module.exports = ServerStore