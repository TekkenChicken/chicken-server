//Node modules
const mysql = require('mysql');
const assert = require('assert');

//Dependencies
const ServerStore = require('../store');
const CharacterModel = require('../server/database/models/character.js');
const AttackModel = require('../server/database/models/attack.js');
//Database Constants
const _USER     = process.env.DB_USER;
const _PASS     = process.env.DB_PASS;
const _DB       = 'tekkenchickentest';
const _HOST     = process.env.DB_HOST || 'localhost';
const _PORT     = process.env.DB_PORT || 3306;

const dbConfig = {
    user: _USER,
    password: _PASS,
    database: _DB,
    host: _HOST,
    port: _PORT,
    connectionLimit: 50, 
    connectTimeout: 30000,
    multipleStatements: true
};

const testPool = mysql.createPool(dbConfig);

function clearDatabase() {
    return new Promise((resolve, reject) => {
        testPool.query('DELETE FROM FramedataMeta_TC; DELETE FROM Attacks_TC; DELETE FROM Characters_TC;', (err) => {
            if(err) throw err;
            resolve();
        });
    })
}

function buildTestAttacks(character_id, numOfAttacks) {
    let attacks = [];
    for(let i = 1; i <= numOfAttacks; i++) {
        let attack = new AttackModel({character_id: character_id, notation: 't+' + i, hit_level: 'H' + i, damage: i * 5, speed: 'S+' + i, on_block: '-' + i, on_hit: '+' + i, on_ch: '+' + i, notes: null, properties: null, attack_num: i});
        attacks.push(attack);
    }

    return attacks;
}


describe('ServerStore', function() {
    const NUM_OF_ATTACKS = 5;
    let testCharacter1 = new CharacterModel({name: 'Test Guy 1', label: 'test-guy1', game: 'T7'});
    let testCharacter2 = new CharacterModel({name: 'Test Guy 2', label: 'test-guy2', game: 'T7'});

    let character1Attacks = [];
    let character2Attacks = [];

    beforeEach('Reload database', function() {
        return clearDatabase().then(() => {
            return new Promise((resolve, reject) => {
                testPool.query(testCharacter1.insertQuery(), (err, results) => {
                    if(err) throw err;
                    testCharacter1.id = results.insertId;

                    testPool.query(testCharacter2.insertQuery(), (err, results) => {
                        if(err) throw err;
                        testCharacter2.id = results.insertId;

                        character1Attacks = buildTestAttacks(testCharacter1.id, NUM_OF_ATTACKS);
                        character2Attacks = buildTestAttacks(testCharacter2.id, NUM_OF_ATTACKS);

                        let attacksToBeInserted = [...character1Attacks, ...character2Attacks];
                        const attackInsertQuery = attacksToBeInserted.reduce((acc, attack) => {
                            acc += attack.insertQuery() + ';';
                            return acc;
                        }, '');

                        testPool.query(attackInsertQuery, (err) => {
                            if(err) throw err;
                            resolve();
                        });
                    });
                }); 
            });
        });
    });

    it('Should load characters on initialization', function(done) {

        testPool.query('SELECT * FROM Characters_TC', function(err, results) {
            if(err) throw err;
            let characters = results.map(result => new CharacterModel(result));
            let store = new ServerStore(dbConfig);
            assert.deepEqual(store._characters, characters, 'We expect the store to load inserted characters from database on instantiatoin.');
        });
        done();
    });

    describe('#getAllFramedata()', function() {

        it('Should return a promise that resolves all attack data keyed by character label', function(done) {

            let testCharacter1Current = testCharacter1;
            let testCharacter2Current = testChracter2;

            testPool.query('SELECT * FROM Attacks_TC', function(err, results) {
                if(err) throw err;

                let framedataActual = results.reduce((acc, data) => {
                    if(acc[data.character_id]) {
                        acc[data.character_id].push(new AttackModel(data));
                    }
                    else {
                        acc[data.character_id] = [new AttackModel(data)];
                    }

                }, {});

                let formattedChar1 = {
                    name: testCharacter1Current.name, 
                    label: testCharacter1Current.label, 
                    data: framedataActual[testCharacter1Current.Id]
                };

                let formattedChar2 = {
                    name: testCharacter2Current.name, 
                    label: testCharacter2Current.label, 
                    data: framedataActual[testCharacter2Current.Id]
                };

                let store = new ServerStore(dbConfig);
                store.getAllFramedata().then((framedataTest) => {
                    assert.deepEqual(framedataTest[testCharacter1Label], formattedChar1, 'We expect the character 1 attacks to be returned.');
                    assert.deepEqual(framedataTest[testCharacter2Label], formattedChar2, 'We expect the character 2 attacks to be returned.');
                    done();   
                });

            });

        });
    });

    describe('#getFramedataByLabel()', function() {

        it('Should return the selected character data', function(done) {
            let testCharacter1Current = testCharacter1;
            let testCharacter2Current = testChracter2;

            testPool.query('SELECT * FROM Attacks_TC', function(err, results) {
                if(err) throw err;

                let framedataActual = results.reduce((acc, data) => {
                    if(acc[data.character_id]) {
                        acc[data.character_id].push(new AttackModel(data));
                    }
                    else {
                        acc[data.character_id] = [new AttackModel(data)];
                    }

                }, {});

                let formattedChar1 = {
                    name: testCharacter1Current.name, 
                    label: testCharacter1Current.label, 
                    data: framedataActual[testCharacter1Current.Id]
                };

                let store = new ServerStore(dbConfig);
                store.getAllFramedata(testCharacter1Current.label).then((framedataTest) => {
                    assert.deepEqual(framedataTest, formattedChar1, 'We expect the test character 1 attacks to be returned.');
                    done();   
                });

            });
        });
    });
});