const assert = require('assert')
const mysql = require('mysql')

const FramedataController = require('../server/api/framedata/controller.js')

//Database set up
const _USER     = process.env.DB_USER
const _PASS     = process.env.DB_PASS
const _DB       = 'tekkenchickentest'
const _HOST     = process.env.DB_HOST || 'localhost'
const _PORT     = process.env.DB_PORT || 3306

let pool = mysql.createPool({
    user: _USER,
    password: _PASS,
    database: _DB,
    host: _HOST,
    port: _PORT,
    connectionLimit: 50,
    connectTimeout: 30000,
    multipleStatements: true
})

const CHARACTERS_TABLE_NAME = 'Characters_TC'
const ATTACKS_TABLE_NAME = 'Attacks_TC'
const USERS_TABLE_NAME = 'Users_TC'

/*
describe('Framedata API Controller', function() {

    //Test Setup
    const testCharacter = {
        name: 'Test McGee',
        label: 'test',
        last_updated: Math.floor(Date.now() / 1000),
        game: 'T7'
    }

    const testAttack = {
        notation: 'd/f+2',
        hit_level: 'M',
        damage: '20',
        speed: '15',
        on_block: '-7',
        on_hit: 'KND',
        on_ch: 'KND',
        notes: 'Boy this shit high crush',
        properties: null,
        attack_num: 1
    }

    beforeEach('Insert test frame data', function(done) {

        pool.getConnection((err, connection) => {
            if(err) throw err;
            connection.query(`INSERT INTO ${CHARACTERS_TABLE} SET ?`, testCharacter, (err, result) => {
                if(err) throw err;
                testCharacter.id = result.insertId
                testAttack.character_id = result.insertId

                connection.query(`INSERT INTO ${ATTACKS_TABLE} SET ?`, testAttack, (err) => {
                    connection.release()
                    if(err) throw err;
                    done()
                })

            })
        })
    })

    afterEach('Delete test frame data', function(done) {
        pool.getConnection((err, connection) => {
            connection.query(`DELETE FROM ${ATTACKS_TABLE} WHERE character_id = ?`, [testAttack.character_id], (err) => {
                if(err) throw err;
                connection.query(`DELETE FROM ${CHARACTERS_TABLE} WHERE id = ${testCharacter.id}`, [testCharacter.id], (err) => {
                    connection.release()
                    if(err) throw err;
                    done()
                })
            })
        })
    })


    const testStore = require('./teststore.js')
    const testSession = testStore.newSession('Test Session')
    //Actual testing
    controller = new FramedataController(testStore)

    describe('#getCharacterData()', function() {
        it('returns data of a single character identifed by id', function() {
            return controller.getCharacterData(testCharacter.id).then((data) => {
                let expectedAttackData = Object.assign({}, testAttack, {properties: []})
                delete expectedAttackData.character_id;

                let expectedFormat = {
                    data: [expectedAttackData], 
                    label: testCharacter.label,
                     name: testCharacter.name
                 }
                assert.deepEqual(data, expectedFormat, 'We expect the data of the test character to be returned.')
                return;
            })
        })

        it('returns data of a single character identifed by label', function() {
            return controller.getCharacterData(testCharacter.label).then((data) => {
                let expectedAttackData = Object.assign({}, testAttack, {properties: []})
                delete expectedAttackData.character_id;

                let expectedFormat = {
                    data: [expectedAttackData], 
                    label: testCharacter.label,
                     name: testCharacter.name
                 }
                assert.deepEqual(data, expectedFormat, 'We expect the data of the test character to be returned.')
                return;
            })
        })


    })
    describe('#updateData()', function() {

        it('should update data when session is active', function() {
            let newAttack = Object.assign({}, testAttack, {speed: '16'})

            let options = {
                session: testSession,
                updates: [
                    {
                        character_id: testAttack.character_id,
                        attack_num: testAttack.attack_num,
                        data: { speed: '16' }
                    }
                ]
            }

            return controller.updateData(options).then((success) =>{
                assert(success, 'We expect the Promise to resolve a true boolean value')
                
                return new Promise((resolve, reject) => {
                    pool.getConnection((err, connection) => {
                        if(err) reject(err)

                        connection.query(`SELECT * FROM ${ATTACKS_TABLE} WHERE character_id = ? AND notation = ?`, [newAttack.character_id, newAttack.notation], (err, results) => {
                            if(err) reject(err)

                            assert.deepEqual(results[0], newAttack, 'We expect the new move returned by the query ')

                            connection.query(`SELECT * FROM ${ATTACKS_TABLE} WHERE character_id = ? AND notation = ?`, [testAttack.character_id, testAttack.notation], (err, results) => {
                                connection.release()
                                if(err) reject(err)

                                assert.notDeepEqual(results[0], testAttack, 'We expect the old attack to no longer be in the database')
                                resolve()

                            })
                        })
                    })
                })
            })
        })

        it('should not update data session is invalid', function() {
                let newAttack = Object.assign({}, testAttack, {speed: '16'})
                let options = {
                    session: {accessToken: 'not a real token', accountName: 'Test Session'},
                    updates: [
                        {
                            character_id: testAttack.character_id,
                            attack_num: testAttack.attack_num,
                            data: { speed: '16' }
                        }
                    ]
                }

            return controller.updateData(options).then((success) => {
                assert(!success, 'We expect the Promise to resolve a false boolean value')

                pool.getConnection((connection) => {
                    connection.query(`SELECT * FROM ${ATTACKS_TABLE} WHERE notation = ? AND character_id = ?`, (err, results) => {
                        if(err) throw err;

                        assert.deepEquals(results[0], testAttack, 'We expect attack to not be updated')
                    })
                })
            })
        })
    })
})
*/

let Character = require('../server/classes/character.js');

describe('Character Class', function() {
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
                assert( query.match(expectedQuery) );
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
            let attacks = attacksTestData.moves[0];
            let expectedQuery = 'INSERT INTO ${ATTACKS_TABLE_NAME} (character_id, notation, hit_level, damage, speed, on_block, on_hit, on_ch, notes, properties, attack_num) VALUES (${attacksTestData.metadata.id}, ${attack.notation,} ${attack.hit_level}, ${attack.damage}, ${attack.speed}, ${attack.on_block}, ${attack.on_hit}, ${attack.on_ch}, ${attack.notes}, ${attack.properties}, ${attack.attack_num})';
        });
    });
});