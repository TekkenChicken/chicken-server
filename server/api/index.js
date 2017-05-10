const mysql     = require('mysql')
const router    = require('express').Router()

let $store = require('../store.js')

const Framedata = require('./framedata/router.js')($store)
const Users     = require('./users/router.js')($store)
const Metadata  = require('./metadata/router.js')($store)

router.use('/framedata', Framedata)
router.use('/metadata', Metadata)
router.use('/user', Users)

module.exports = router