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

const CHARACTERS_TABLE = 'Characters_TC'
const ATTACKS_TABLE = 'Attacks_TC'
const USERS_TABLE = 'Users_TC'

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
        notes: 'Boy this shit high crush'
    }

    beforeEach('Insert test data', function(done) {

        pool.getConnection((err, connection) => {
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

    afterEach('Delete test data', function(done) {
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
                let expectedAttackData = Object.assign({}, testAttack)
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
                let expectedAttackData = Object.assign({}, testAttack)
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
                character_id: testAttack.character_id,
                notation: testAttack.notation,
                newMove: newAttack
            }

            return controller.updateData(options).then((success) =>{
                assert(success, 'We expect the Promise to resolve a true boolean value')
                
                return new Promise((resolve, reject) => {
                    pool.getConnection((err, connection) => {
                        if(err) reject(err)

                        connection.query(`SELECT * FROM ${ATTACKS_TABLE} WHERE character_id = ? AND notation = ?`, [newAttack.character_id, newAttack.notation], (err, results) => {
                            if(err) reject(err)

                            console.log(newAttack.character_id)
                            console.log(newAttack.notation)
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
                    character_id: testAttack.character_id,
                    notation: testAttack.notation,
                    newMove: newAttack
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