//Node modules
const bcrypt    = require('bcrypt')
const uuid      = require('uuid/v4')
const express   = require('express')
const router    = express.Router()

//Database Tables
const _USERTABLE = 'Users_TC'
const _USERPERMTABLE = 'Permissions_Users_TC'

//Sessions
const _SESSIONTIME = 86400  //1 day represented in seconds
var sessions = new Map()


module.exports = function(pool) {

    router.post('/authenticate', (req, res) => {
        if(!req.params.username || !req.params.password) {
            res.status(500).send('Missing parameters')
            return;
        }

        authenticate(req,params.username, req.params.password, (err, session) => {
            if(err) {
                if(err.httpCode == 404) {
                    res.status(204).send(err.message)
                    return;
                }

                res.status(err.httpCode).send(err.message)
                return;
            }

            res.json(session)
            return;

        })
    })

    return router
}

function authenticate(accountName, plainTextPass, cb) {
    let query = `SELECT Users.hashedPass, Perms.
    FROM ${_USERTABLE} AS USERS
    INNER JOIN 
    WHERE accoutName={$accountName}`

    pool.getConnection((err, connection) => {
        if(err) {
            let error = new Error('Error connecting to database.');
            error.httpCode = 500
            error.code = err.code
            cb(error, null)
            return;
        }

        connection.query(query, (err, results) => {
            if(err) {
                let error = new Error('Error querying database.')
                error.httpCode = 500
                error.code = err.code
                cb(errr, null)
                return;
            }

            if(results.length == 0) {
                let error = new Error('Account not found.')
                error.httpCode = 404
                cb(err, null)
                return;
            }

            let hashedPass = results[0].hashedPass;
            bcrypt.compare(plainTextPass, hashedPass, (err, isAuthorized) => {
                if(err) {
                    err.httpCode = 500
                    cb(err, null)
                    return;
                }

                if(hashedPass) {
                    //Generate authorization token and store and return session
                    let accessToken;
                    do {
                        accessToken = uuid()
                    } while (sessions.has(accessToken))

                    //Expiration time
                    let expirationTime = Date.now() + (_SESSIONTIME * 1000)

                    let session = {
                        accountName: accountName,
                        expirationTime: expirationTime,
                        token: accessToken
                    }

                    sessions.set(accessToken, session)
                    cb(null, session)
                    return;
                } else {
                    let error = new Error('Invalid password.')
                    error.httpCode = 401
                    cb(err, null)
                    return;
                }
            })
        })
    })
}

function isSessionLive(sessionToken) {
    let session = sessions.get(sessionToken)
    if(!session) {
        return false
    }

    let isExpired = (Date.now() > session.expirationTime)

    if(isExpired) {
        sessions.delete(sessionToken)
        return false
    }

    return true
}

function getPermissions(accountName) {
    let query = 'SELECT Perms.'
}