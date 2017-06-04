const Model = require('./model.js');

const TABLE_NAME = 'Attacks_TC';
const FIELD_NAMES = [ 'id', 'character_id', 'notation', 'hit_level', 'damage', 'speed', 'on_block', 'on_hit', 'on_ch', 'notes', 'properties', 'attack_num' ];

class Attack extends Model {
    constructor(data) {
        super(TABLE_NAME, FIELD_NAMES, data);
    }
}

module.exports = Attack;