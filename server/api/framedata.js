const knex = require('knex')({client: 'pg'})
const express = require('express')
const router = express.Router()

module.exports = function(pool) {

    //Base route provides info on the characters
    router.get('/', (req, res) => {
        const query = knex.from('characters').toString();

        pool.connect().then(client => {
            client.query(query, null, (err, data) => {
                client.release()

                if(err) {
                    res.status(500).send(err.text)
                    return;
                } else {
                    let formatted = data.rows.reduce((acc, row) => {
                        acc[row.label] = row
                        return acc
                    }, {})

                    res.json(formatted)
                    return;
                }

            })
        }).catch(err => {
            res.status(500).send(err)
        })
    })

    //Fetch all frame data in the database
    router.get('/all', (req, res) => {
        const query = knex('characters')
        .select('characters.label', 'characters.name', 'attacks.notation', 'attacks.damage', 'attacks.speed',
                'attacks.hit_level', 'attacks.on_block', 'attacks.on_hit', 'attacks.on_ch', 'attacks.notes')
        .innerJoin('attacks', 'characters.id', 'attacks.character_id')
        .toString()

        pool.connect().then(client => {
            client.query(query, null, (err, data) => {
                client.release()

                if(err) {
                    res.status(500).send(err)
                    return;
                }

                //Response returns hash full of character objects indexed by character label
                //Character objects contain character names, label, and data

                let formatted = data.rows.reduce((acc, row) => {
                    if(!acc[row.label]) {
                        acc[row.label] = { name: row.name, label: row.label, data: [] }
                    }

                    //TODO: SORT THE FRAME DATA JESUS CHRIST
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

    //Fetch frame data by character label
    router.get('/:label', (req, res, next) => {
        const query = knex('characters')
        .where({label: req.params.label})
        .select('attacks.notation', 'attacks.hit_level', 'attacks.damage', 'attacks.speed',
                'attacks.on_block', 'attacks.on_hit', 'attacks.on_ch', 'attacks.notes')
        .innerJoin('attacks', 'characters.id', 'attacks.character_id')
        .toString()

        pool.connect().then(client => {
            client.query(query, null, (err, data) => {
                client.release()

                if(err) {
                    res.status(500).send(err)
                    return;
                } else {
                    //TODO: SORT. IT.
                    res.json(data.rows)
                    return;
                }
            })
        })

    })

    return router
}