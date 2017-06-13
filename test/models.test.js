let Character = require('../server/classes/character.js');

describe('Character Model', function() {
    let testData = {
        "metadata": {
            "ver": "0.4",
            "game": "t7",
            "character": "akuma",
            "name": "Akuma",
            "type": "normal"
        },
        "moves": [{
            "notation": "SS+4",
            "hit_level": "h",
            "damage": "12",
            "speed": "14(15~)",
            "on_block": "-13",
            "on_hit": "+2",
            "on_ch": "+2",
            "notes": null
        }]
    }

    let testCharacter = new Character(testData);

    describe('#buildInsertQuery()', function() {
        it('should return formatted MySQL query based on object data', function() {
            let expectedQuery = new RegExp(`INSERT INTO ${CHARACTERS_TABLE_NAME} \\(name, label, game, last_updated\\) VALUES \\(\\'${testData.metadata.name}\\', \\'${testData.metadata.character}\\', \\'${testData.metadata.game}\\', [0-9]+\\)`);
            return testCharacter.buildInsertQuery().then((query) => {
                assert( query.match(expectedQuery), 'We expect the returned query to match our format.');
            });
        });
    });

    describe('#buildInsertQueryForAttacks()', function() {
        //Character needs an ID for these
        let attacksTestData = {
            "metadata": {
                "ver": "0.4",
                "game": "t7",
                "character": "akuma",
                "name": "Akuma",
                "type": "normal",
                "id": 1
            },
            "moves": [{
                "notation": "SS+4",
                "hit_level": "h",
                "damage": "12",
                "speed": "14(15~)",
                "on_block": "-13",
                "on_hit": "+2",
                "on_ch": "+2",
                "notes": null
            }]
        }
        let attacksTestCharacter = new Character(attacksTestData);

        it('should return formatted MySQL query based on data in moves array', function() {
            let attack = attacksTestData.moves[0];
            let expectedQuery = mysql.format(`INSERT INTO ${ATTACKS_TABLE_NAME} (character_id, notation, hit_level, damage, speed, on_block, on_hit, on_ch, notes, properties, attack_num) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [attacksTestData.metadata.id, attack.notation, attack.hit_level, attack.damage, attack.speed, attack.on_block, attack.on_hit, attack.on_ch, attack.notes, '', 1]);
            return attacksTestCharacter.buildInsertQueryForAttacks().then((query) => {
                assert.equal(query, expectedQuery, 'We expect the returned query to match.' );
            });
        });
    });

    describe('#toJSON()', function() {
        it('should return character in JSON form', function() {
            return testCharacter.toJSON().then((json) => {
                //Clone hack
                let expectedFormat = JSON.parse( JSON.stringify(testData) );
                expectedFormat.moves[0] = Object.assign(expectedFormat.moves[0], {properties: [], attack_num: null, character_id: null});
                assert.deepEqual(json, expectedFormat, 'We expect the returned JSON data to match our format.');
            });
        });
    });
});