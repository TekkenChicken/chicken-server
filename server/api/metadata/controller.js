const CHAR_TABLE  = 'Characters_TC'

class MetadataController {
    constructor(store) {
        this.$store = store
    }

    getMetadata() {
        const query = `SELECT * FROM ${CHAR_TABLE}`

        return new Promise((resolve, reject) => {
            this.$store.getDatabaseConnection().then((connection) => {
                connection.query(query, (err, results) => {
                    if(err) {
                        reject(rer)
                        return;
                    }

                    resolve(this._format(results))
                    return;
                })
            }, err => reject(err))
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