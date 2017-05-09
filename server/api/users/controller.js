//Node modules
const bcrypt    = require('bcrypt')
const uuid      = require('uuid/v4')
const mysql     = require('mysql')

//Database Tables
const _USERTABLE = 'Users_TC'
const _USERPERMTABLE = 'Permissions_Users_TC'

//Sessions
const _SESSIONTIME = 86400  //1 day represented in seconds

//Bcrypt salt roundserr
const _SALT = 10

class UsersController {
    constructor(pool) {
        this.pool = pool;
        this.sessions = new Map()
    }

    createUser(options) {
        const accountName   = mysql.format(options.accountName)
        const email         = mysql.format(options.email)
        const displayName   = mysql.format(options.displayName)

        const existingUserCheck = `SELECT accountName, email, displayName ` +
                                    `FROM ${_USERTABLE} ` + 
                                    `WHERE (accountName = '${accountName}' OR email ='${email}' OR displayName = '${displayName}')`

        return new Promise((resolve, reject) => {           
            this.pool.getConnection((err, connection) => {
                if(err) {
                    reject(err)
                    return
                }

                connection.query(existingUserCheck, (err, results) => {
                    //If this query returned results then there is a user with a matching field
                    if(results) {
                        connection.release()

                        let user = results[0]
                        let sharedField = ''

                        if(mysql.format(user.accountName) == accountName) {
                            sharedField = 'account name'
                        } 
                        else if(mysql.format(user.email) == email) {
                            sharedField = 'email address'
                        } 
                        else if(mysql.format(user.displayName) == displayName) {
                            sharedField = 'display name'
                        }

                        reject({message: `A user already exists with this ${sharedField}.`})
                        return;
                    }


                    bcrypt.hash(options.password, _SALT, (err, hashedPass) => {
                        if(err) {
                            connection.release()
                            reject(err)
                            return;
                        }

                        hashedPass = mysql.format(hashedPass)
                        const insertQuery = `INSERT INTO ${_USERTABLE} ` + 
                                        `(\`accountName\`, \`hashedPass\`, \`email\`, \`displayName\`) ` +
                                        `VALUES ('${accountName}', '${hashedPass}', '${email}', '${displayName}')`

                        connection.query(insertQuery, (err) => {
                            connection.release()
                            if(err) {
                                reject(err)
                                return;  
                            }

                            //Build new session
                            let session = this._buildSession(accountName)
                            resolve(session)
                            return;
                        })
                    })
                })
            })
        })
    }

    authenticate(accountName, plainTextPass) {
        accountName = mysql.format(accountName)

        let query = `SELECT Users.hashedPass ` +
                        `FROM ${_USERTABLE} AS Users ` +
                        `WHERE accountName='${accountName}'`

        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if(err) {
                    reject(err)
                    return;
                }

                connection.query(query, (err, results) => {
                    connection.release()
                    if(err) {
                        reject(err)
                        return;
                    }

                    if(results.length < 1) {
                        reject({message: 'User does not exist.'})
                        return;
                    }

                    let hashedPass = results[0].hashedPass.toString();

                    bcrypt.compare(plainTextPass, hashedPass, (err, isAuthorized) => {
                        if(err) {
                            reject(err)
                            return;
                        }

                        resolve(isAuthorized)
                        return;
                    })
                })
            })          
        })
    }

    login(accountName, plainTextPass) {
        let response = {success: false, session: {}}

        return this.authenticate(accountName, plainTextPass)
        .then((isAuthorized) => {
            if(isAuthorized) {
                let session = this._buildSession(accountName)
                response = {success: true, session: session}
            }

            return response
        }, (err) => {
            console.log('Goodbye?')
            return err.message
        })
    }

    isSessionActive(sessionToken) {
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

    _buildSession(accountName){
        let accessToken;
        do {
            accessToken = uuid()
        } while (this.sessions.has(accessToken))

        //Expiration time
        let expirationTime = Date.now() + (_SESSIONTIME * 1000)

        let session = {
            accountName: accountName,
            expirationTime: expirationTime,
            token: accessToken
        }

        this.sessions.set(accessToken, session)
        return session;
    }
}

module.exports = UsersController