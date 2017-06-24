//Node modules
const mysql = require('mysql');

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
                    testCharacter1.data.id = results.insertId;

                    testPool.query(testCharacter2.insertQuery(), (err, results) => {
                        if(err) throw err;
                        testCharacter2.data.id = results.insertId;

                        character1Attacks = buildTestAttacks(testCharacter1.data.id, NUM_OF_ATTACKS);
                        character2Attacks = buildTestAttacks(testCharacter2.data.id, NUM_OF_ATTACKS);

                        let attacksToBeInserted = [...character1Attacks, ...character2Attacks];
                        console.log(attacksToBeInserted);
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
        let store = new ServerStore(dbConfig);
        assert.deepEqual(store._characters, [testCharacter1, testCharacter2], 'We expect the store to load inserted characters from database on instantiatoin.');
        done();
    });

    describe('#getAllFramedata()', function() {

        it('Should return all attack data keyed by character label', function(done) {
            let store = new ServerStore(dbConfig);
            let framedata = store.getAllFramedata();

            assert.deepEqual(framedata[testCharacter1.getData().label], character1Attacks, 'We expect the character 1 attacks to be returned.');
            assert.deepEqual(framedata[testCharacter2.getData().label], character2Attacks, 'We expect the character 2 attacks to be returned.');
            done();
        });
    });

    describe('#getFramedataByLabel()', function() {

        it('Should return the selected character data', function(done) {
            let store = new ServerStore(dbConfig);
            let framedata = store.getFramedataByLabel(testCharacter1.getData().label);

            assert.deepEqual(framedata, character1Attacks, 'We expect the attacks returned to match character 1');
            done();
        });
    });
});