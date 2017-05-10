//Node modules
const mysql = require('mysql')

//Database Table Names
const _CharactersTable  = 'Characters_TC'
const _AttacksTable     = 'Attacks_TC'

class FramedataController {
    constructor(pool) {
        this.pool = pool
    }

    getCharacterData(identifier) {
        //Fetch frame data by character label
        let query = "SELECT characters.label, characters.name, attacks.notation, attacks.damage, attacks.speed,"
        + "attacks.hit_level, attacks.on_block, attacks.on_hit, attacks.on_ch, attacks.notes "
        + `FROM ${_CharactersTable} AS characters `
        + `INNER JOIN ${_AttacksTable} AS attacks on characters.id=attacks.character_id `


        let id = mysql.escape(identifier)
        let field = '`label`'
        //If user passes in int
        if(parseInt(identifier)) {
            field = '`id`'
            id = parseInt(identifier)
        }

        query += `WHERE ${field} = ${id};`

        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if(err) {
                    reject(err)
                    return;
                }

                connection.query(query, (err, results) => {
                    if(err) {
                        reject(err)
                        return;
                    }

                    if(results[0]) {
                        let name = results[0].name;
                        let label = results[0].label;

                        let data = results.reduce((acc, row) => {
                            acc.push({
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
                        }, [])

                        //Hey sort these bruh
                        resolve({name: name, label: label, data: data})
                        return;
                    }

                resolve({})
                })
            })
        })

    }

    getAllData() {
        const query = "SELECT characters.label, characters.name, attacks.notation, attacks.damage, attacks.speed,"
        + "attacks.hit_level, attacks.on_block, attacks.on_hit, attacks.on_ch, attacks.notes "
        + `FROM ${_CharactersTable} AS characters `
        + `INNER JOIN ${_AttacksTable} AS attacks on characters.id = attacks.character_id`

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

                    resolve(formatted)
                    return;
                })
            })
        })
    }


}

module.exports = FramedataController