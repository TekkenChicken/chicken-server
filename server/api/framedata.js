//Node Modules
const mysql     = require('mysql')
const express   = require('express')
const router    = express.Router()

//Database Table Names
const _CharactersTable  = 'Characters_TC'
const _AttacksTable     = 'Attacks_TC'

//API Function
module.exports = function(pool) {


    router.get('/', (req, res) => {
        //Thsi route returns a huge frame data blob

        const query = "SELECT characters.label, characters.name, attacks.notation, attacks.stance, attacks.damage, attacks.speed,"
        + "attacks.hit_level, attacks.on_block, attacks.on_hit, attacks.on_ch, attacks.notes "
        + `FROM ${_CharactersTable} AS characters `
        + `INNER JOIN ${_AttacksTable} AS attacks on characters.id = attacks.character_id`

        pool.getConnection((err, connection) => {
            if(err) {
                console.log(`Error at ${req.route}: ${err.code}`)
                res.status(500).send(err)
                return;
            }

            connection.query(query, (err, results) => {
                connection.release()

                if(err) {
                    console.log(`Error at ${req.route.path}: ${err.code}`)
                    res.status(500).send(err)
                    return;
                }

                //Response returns hash full of character objects indexed by character label
                //Character objects contain character names, label, and data
                let formatted = results.reduce((acc, row) => {
                    if(!acc[row.label]) {
                        acc[row.label] = { name: row.name, label: row.label, data: [] }
                    }

                    //PUT THE FRAME DATA SORT MAGIC HERE
                    acc[row.label].data.push({
                        notation: row.notation,
                        hitLevel: row.hit_level,
                        damage: row.damage,
                        speed: row.speed,
                        on_block: row.on_block,
                        on_hit: row.on_hit,
                        on_ch: row.on_ch,
                        notes: row.notes
                    })

                    return acc

                }, {})

                res.json(formatted)
                return;
            })

        })

    })


    router.get('/:id', (req, res, next) => {
        //Fetch frame data by character label
        const sql = "SELECT characters.label, characters.name, attacks.notation, attacks.stance, attacks.damage, attacks.speed,"
        + "attacks.hit_level, attacks.on_block, attacks.on_hit, attacks.on_ch, attacks.notes "
        + `FROM ${_CharactersTable} AS characters `
        + `INNER JOIN ${_AttacksTable} AS attacks on characters.id=attacks.character_id `
        + "WHERE ?? = ?;"

        let inserts = []

        if(parseInt(req.params.id)) {
            //End user passes in an ID
            inserts = ['id', req.params.id]
        } else {
            //End user passes in a label
            inserts = ['label', req.params.id]
        }

        const query = mysql.format(sql, inserts)
        console.log(query)
        pool.getConnection((err, connection) => {
            if(err) {
                console.log(err.code)
                res.status(500).send(err)
                return;
            }

            connection.query(query, (err, results) => {
                connection.release()
                if(err) {
                    console.log(`Error at ${req.route.path}: ${err.code}`)
                    res.status(500).send(err)
                    return;
                }

                //Hey sort these bruh
                res.json(results[0])
                return;
            })
        })

    })

    return router
}