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

        isValidSession(options) {
            const accountName = options.accountName
            const accessToken = options.accessToken
            
            if(sessions.has(accountName)) {
                let session = sessions.get(accountName)
                if(accessToken == session.accessToken) {
                    let isExpired = Date.now() > session.expirationTime
                    if(!isExpired) {
                        return true
                    }
                }
            }

            return false
        }

    }

    return store
})()

module.exports = ServerStore