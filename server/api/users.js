//Node modules
const bcrypt    = require('bcrypt')
const uuid      = require('uuid/v4')
const express   = require('express')
const mysql     = require('mysql')
const router    = express.Router()

//Database Tables
const _USERTABLE = 'Users_TC'
const _USERPERMTABLE = 'Permissions_Users_TC'

//Sessions
const _SESSIONTIME = 86400  //1 day represented in seconds
var sessions = new Map()


module.exports = function(pool) {

    router.get('/', (req, res) => {
        const accountName   = req.query.accountName;
        const displayName   = req.query.displayName;
        const email         = req.query.email;
        const password      = req.query.password;

        if(!accountName || !displayName || !email || !password) {
            res.status(400).send('Missing parameters');
            console.log('###accountName: ' + accountName)
            console.log('###displayName: ' + displayName)
            console.log('###email: ' + email)
            console.log('###password: ' + password)
            return;
        }

        createUser(accountName, password, email, displayName, (err, results) => {
            if(err) {
                res.status(err.httpCode).send(err.message)
                return;
            }

            res.send('User successfully created.')
        }) 

    })

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

    function createUser(aName, pass, userEmail, display, cb) {
    const SALT          = 10

    const accountName   = mysql.format(aName)
    const email         = mysql.format(userEmail)
    const displayName   = mysql.format(display)

    const existingUserCheck = `SELECT (accountName, email, displayName) ` +
                                `FROM ${_USERTABLE} ` + 
                                `WHERE (accountName = ${accountName} OR email = ${email} OR displayName = ${displayName}`


    pool.getConnection((err, connection) => {
        if(err) {
            let error = new Error('Error querying database.')
            error.httpCode = 500
            error.code = err.code
            cb(err, null)
            return;
        }

        connection.query(existingUserCheck, (err, results) => {
            //If this query returned results then there is a user with a matching field
            if(results) {
                connection.release()

                let user = resutls[0]
                let sharedField = ''

                if(user.accountName == accountName) {
                    sharedField == 'account name'
                } 
                else if(user.email == email) {
                    sharedField == 'email address'
                } 
                else if(user.displayName == displayName) {
                    sharedField == 'display name'
                }

                let error = new Error('An account already exists using this ${sharedField}.')
                error.httpCode = 400
                error.sharedField = sharedField
                cb(err, null)
                return;
            }

            //Hash password and create user
            bcrypt.hash(pass, SALT, (err, hashedPass) => {
                if(err) {
                    connection.release()

                    err.httpCode = 500
                    cb(err, null)
                    return;
                }

                const insertQuery = `INSERT INTO ${_USERTABLE} ` + 
                                    `(\`accountName\`, \`hashedPass\`, \`email\`, \`displayName\`) ` +
                                    `VALUES ('${accountName}', '${hashedPass}', '${email}', '${displayName}')`
                console.log(insertQuery)
                connection.query(insertQuery, (err, results) => {
                    connection.release()

                    if(err) {
                        err.httpCode = 500
                        cb(err, null)
                        return;
                    }

                    //TODO: Build session and pass to callback
                    cb(null, {status: 'Success'})
                    return;
                })
            })
        })
    })
}

    return router
}



function authenticate(accountName, plainTextPass, cb) {
    let query = `SELECT Users.hashedPass, Perms.
    FROM ${_USERTABLE} AS USERS
    INNER JOIN 
    WHERE accoutName={$accountName}`

    pool.getConnection((err, connection) => {
        if(err) {
            let error = new Error('Error connecting to database.')
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