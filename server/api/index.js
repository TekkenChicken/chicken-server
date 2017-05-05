const mysql     = require('mysql')
const router    = require('express').Router()

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

const Framedata = require('./framedata/router.js')(pool)
const MetaData  = require('./metadata.js')(pool)
const Users     = require('./users.js')(pool)

router.use('/framedata', Framedata)
router.use('/metadata', MetaData)
router.use('/user', Users)

module.exports = router