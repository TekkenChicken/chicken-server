//Node Modules
const express   = require('express')
const router    = express.Router()

//Database Table Names
const _CharactersTable  = 'Characters_TC'
const _AttacksTable     = 'Attacks_TC'

//API Function
module.exports = function(pool) {

    router.get('/', (req, res) => {
    //Returns all metadata
    const query = `SELECT * FROM ${_CharactersTable}`

    pool.getConnection((err, connection) => {
        if(err) {
            console.log(err.code)
            res.status(500).send(err)
            return;
        }

        connection.query(query, (err, results, fields) => {
            connection.release()
            if(err) {
                console.log(err.code)
                res.status(500).send(err)
                return;
            }

            //Response returns hash full of character objects indexed by character label
            let formatted = results.reduce((acc, row) => {
                acc[row.label] = row
                return acc
            }, {})

            res.json(formatted)
            return;
        })
    })

    })

    return router
}