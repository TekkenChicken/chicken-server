const mysql = require('mysql');

class Model {
    constructor(tableName, fieldNames, data) {
        this.data = {};
        for(let fieldName of fieldNames) {
            this.data[fieldName] = data[fieldName] ? data[fieldName] : null;
        }

        this._tableName = tableName;
        this._fieldNames = fieldNames;
    }

    insertQuery() {
        const query = mysql.format(`INSERT INTO ${this._tableName} SET ?`, this.data);
        return query;
    }
}