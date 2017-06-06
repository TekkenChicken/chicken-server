const Model = require('./model.js');

const TABLE_NAME = 'Characters_TC';
const FIELD_NAMES = ['name','label','game'];

class Character extends Model {
    constructor(data) {
        super(TABLE_NAME, FIELD_NAMES, data);
    }
}

module.exports = Character;