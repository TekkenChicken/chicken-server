const { Pool } = require('pg')
const router = require('express').Router()

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

const FrameData = require('./framedata.js')(pool)
router.use('/framedata', FrameData)

module.exports = router