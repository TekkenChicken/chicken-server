const mysql     = require('mysql');
const router    = require('express').Router();

let $store = require('../store');

const Framedata = require('./framedata')($store);
const Users     = require('./users')($store);
const Metadata  = require('./metadata')($store);

router.use('/framedata', Framedata);
router.use('/metadata', Metadata);
router.use('/user', Users);

module.exports = router;