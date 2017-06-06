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
        + "attacks.hit_level, attacks.on_block, attacks.on_hit, attacks.on_ch, attacks.notes, attacks.attack_num, attacks.properties "
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
                    connection.release();
                    if(err) {
                        reject(err)
                        return;
                    }
                    if(results[0]) {
                        let name = results[0].name
                        let label = results[0].label
                        

                        let data = results.reduce((acc, row) => {
                            let properties = []
                            if(row.properties) {
                                properties = row.properties.split('|').map(prop => decodeURI(prop))
                            }

                            acc.push({
                                notation: row.notation,
                                hit_level: row.hit_level,
                                damage: row.damage,
                                speed: row.speed,
                                on_block: row.on_block,
                                on_hit: row.on_hit,
                                on_ch: row.on_ch,
                                notes: row.notes,
                                attack_num: row.attack_num,
                                properties: properties
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
        + "attacks.hit_level, attacks.on_block, attacks.on_hit, attacks.on_ch, attacks.notes, attacks.properties "
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

                        let properties = []
                        if(row.properties) {
                            properties = row.properties.split('|').map(prop => decodeURI(prop))
                        }

                        acc[row.label].data.push({
                            notation: row.notation,
                            hit_level: row.hit_level,
                            damage: row.damage,
                            speed: row.speed,
                            on_block: row.on_block,
                            on_hit: row.on_hit,
                            on_ch: row.on_ch,
                            properties: properties,
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
                
                updateQuery += query
            }

            if(this.$store.isValidSession(session)) {
                this.$store.getDatabaseConnection().then((connection) => {
                    connection.query(updateQuery, (err) => {
                        connection.release();
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