const mysql = require('mysql');

const CHARACTERS_TABLE_NAME = 'Characters_TC';
const ATTACKS_TABLE_NAME = 'Attacks_TC';

class Attack {
    constructor(data) {
        this.character_id   = data.character_id;
        this.notation   = data.notation;
        this.hit_level  = data.hit_level;
        this.damage = data.damage;
        this.speed  = data.speed;
        this.on_block   = data.on_block;
        this.on_hit = data.on_hit;
        this.on_ch  = data.on_ch;
        this.notes  = data.notes;
        this.properties = data.properties;
        this.attack_num = data.attack_num;
    }

    getSQLFormattedValues() {
        return mysql.format('(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [this.character_id, this.notation, this.hit_level, this.damage, this.speed, this.on_block, this.on_hit, this.on_ch, this.notes, this.properties, this.attack_num]);
    }

    toJSON() {
        return {
            character_id: this.character_id,
            notation: this.notation,
            hit_level: this.hit_level,
            damage: this.damage,
            speed: this.speed,
            on_block: this.on_block,
            on_hit: this.on_hit,
            on_ch: this.on_ch,
            notes: this.notes,
            properties: this.properties,
            attack_num: this.attack_num,
        }
    }
}

class Character {
    constructor(options) {
        this.metadata = options.metadata ? options.metadata : {};
        this.moves = options.moves ? options.moves.map(move => new Attack(move)) : [];
    }

    toJSON() {
        return {
            metadata: this.metadata,
            moves: this.moves
        }
    }

    buildInsertQuery() {
        return new Promise((resolve, reject) => {
            if(this.metadata.id) {
                throw new Error('You really trying to insert a character with an ID');
            }

            let currentUnixEpoch = Math.floor(Date.now() / 1000);
            let query = mysql.format(`INSERT INTO ${CHARACTERS_TABLE_NAME} (name, label, game, last_updated) VALUES (?, ?, ?, ?)`, [this.metadata.name, this.metadata.character, this.metadata.game, currentUnixEpoch]);
            resolve(query);
        })
    }

    buildInsertQueryForAttacks() {
        return new Promise((resolve, reject) => {
            let attackValues = '';
            for(let i = 0; i < this.moves.length(); i++) {
                let attack = this.moves[i];
                let attack_num = i + 1;
                attack.attack_num = attack_num;

                let value = attack.getSQLFormattedValues();
                attackValues += value;
                if(i < this.moves.length() - 1) {
                    attackValues += ',';
                }
            }
            
            let query = mysql.format(`INSERT INTO ${ATTACKS_TABLE_NAME} (character_id, notation, hit_level, damage, speed, on_block, on_hit, on_ch, notes, properties, attack_num) VALUES ${attackValues};`);
            resolve(query);
        })
    }


}

module.exports = Character;