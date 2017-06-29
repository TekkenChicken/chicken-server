const mysql = require('mysql');

class Model {
    constructor(tableName, fieldNames, data) {
        this.data = {};
        for(let fieldName of fieldNames) {
            this.data[fieldName] = data[fieldName] ? data[fieldName] : null;
        }

        this.id = data.id ? data.id : null;

        this._tableName = tableName;
        this._fieldNames = fieldNames;
    }

    insertQuery() {
        let dataToBeInserted = this.data;
        delete dataToBeInserted.id;

        const query = mysql.format(`INSERT INTO ${this._tableName} SET ?`, dataToBeInserted);
        return query;
    }

    updateQuery() {
        const query = mysql.format(`UPDATE ${this._tableName} WHERE id = ? SET ?`, [this.id, this.data]);
        return query;
    }

    getData() {
        return Object.assign({}, this.data, {id: this.id});
    }
}

module.exports = Model;