const _CharactersTable  = 'Characters_TC'

class MetadataController {
    constructor(pool) {
        this.pool = pool
    }

    getMetadata() {
        const query = `SELECT * FROM ${_CharactersTable}`

        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if(err) {
                    reject(err)
                    return;
                }

                connection.query(query, (err, results) => {
                    if(err) {
                        reject(rer)
                        return;
                    }

                    resolve(this._format(results))
                    return;
                })
            })
        })
    }

    _format(data) {
        let formatted = data.reduce((acc, row) => {
            acc[row.label] = row
            return acc
        }, {})

        return formatted
    }
}

module.exports = MetadataController