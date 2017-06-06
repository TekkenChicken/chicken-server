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
                    connection.release();
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
      let lastUpdated = 0

        let formatted = data.reduce((acc, row) => {
            // Keep track of last updates across each character and store the most recent
            if(row.last_updated > lastUpdated) {
              lastUpdated = row.last_updated
            }

            acc[row.label] = row
            return acc
        }, {})

        formatted.last_updated = lastUpdated
        return formatted
    }
}

module.exports = MetadataController
