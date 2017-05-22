//Node modules
const mysql = require('mysql')

//Database Table Names
const CHAR_TABLE  = 'Characters_TC'
const ATTACKS_TABLE     = 'Attacks_TC'

class FramedataController {
    constructor(store) {
        this.$store = store
    }

    getCharacterData(identifier) {
        //Fetch frame data by character label
        let query = "SELECT characters.label, characters.name, attacks.notation, attacks.damage, attacks.speed,"
        + "attacks.hit_level, attacks.on_block, attacks.on_hit, attacks.on_ch, attacks.notes, attacks.attack_num "
        + `FROM ${CHAR_TABLE} AS characters `
        + `INNER JOIN ${ATTACKS_TABLE} AS attacks on characters.id=attacks.character_id `


        let id = mysql.escape(identifier)
        let field = '`label`'
        //If user passes in int
        if(parseInt(identifier)) {
            field = '`id`'
            id = parseInt(identifier)
        }

        query += `WHERE ${field} = ${id};`

        return new Promise((resolve, reject) => {
            this.$store.getDatabaseConnection().then((connection) => {
                connection.query(query, (err, results) => {
                    if(err) {
                        reject(err)
                        return;
                    }

                    if(results[0]) {
                        let name = results[0].name
                        let label = results[0].label

                        let data = results.reduce((acc, row) => {
                            acc.push({
                                notation: row.notation,
                                hit_level: row.hit_level,
                                damage: row.damage,
                                speed: row.speed,
                                on_block: row.on_block,
                                on_hit: row.on_hit,
                                on_ch: row.on_ch,
                                notes: row.notes,
                                attack_num: row.attack_num
                            })

                            return acc
                        }, [])

                        //Hey sort these bruh
                        resolve({name: name, label: label, data: data})
                        return;
                    }

                resolve({})
                })
            }, err => reject(err))
        })

    }

    getAllData() {
        const query = "SELECT characters.label, characters.name, attacks.notation, attacks.damage, attacks.speed,"
        + "attacks.hit_level, attacks.on_block, attacks.on_hit, attacks.on_ch, attacks.notes "
        + `FROM ${CHAR_TABLE} AS characters `
        + `INNER JOIN ${ATTACKS_TABLE} AS attacks on characters.id = attacks.character_id`

        return new Promise((resolve, reject) => {
            this.$store.getDatabaseConnection().then((connection) => {
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
            }, err => reject(err))
        })
    }

    updateData(options) {
        const session = options.session
        const updates = options.updates


        return new Promise((resolve, reject) => {
            //Build update query
            let updateQuery = ''

            for(let update of updates) {
                let query = mysql.format(`UPDATE ${ATTACKS_TABLE} SET ? WHERE character_id = ? AND attack_num = ?`, [update.data, update.character_id, update.attack_num])
                query += ';'
                
                if(update.properties) {
                    for(let addProp of update.properties.add) {
                        query += mysql.format(`INSERT INTO ${PROPERTIES_TABLE} SET attack_num = ?, character_id = ?, property = ?`, [update.attack_num, update.character_id, addProp])
                        query += ';'
                    }

                    for(let delProp of update.properties.del) {
                        query += mysql.format(`DELETE FROM ${ATTACKS_PROPERTIES_TABLE} WHERE attack_num = ?, character_id = ?, property = ?`, [update.attack_num, update.character_id, delProp])
                        query += ';'
                    }
                }
                updateQuery += query
            }

            if(this.$store.isValidSession(session)) {
                this.$store.getDatabaseConnection().then((connection) => {
                    connection.query(updateQuery, (err) => {
                        if(err) throw err

                        resolve(true)
                    })
                })
            }
            else {
                resolve(false)
            }
        })
    }


}

module.exports = FramedataController