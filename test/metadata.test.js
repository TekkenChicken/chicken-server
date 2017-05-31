const assert = require('assert')
const mysql = require('mysql')

const MetadataController = require('../server/api/metadata/controller.js')

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

describe('Metadata API Controller', function() {

    //Test Setup
    const testLastUpdated = Math.floor(Date.now() / 1000)
    const testCharacter = {
        name: 'Test McGee',
        label: 'test',
        last_updated: testLastUpdated,
        game: 'T7'
    }


    beforeEach('Insert test meta data', function(done) {

        pool.getConnection((err, connection) => {
            if(err) throw err;
            connection.query(`INSERT INTO ${CHARACTERS_TABLE} SET ?`, testCharacter, (err, result) => {
                if(err) throw err;
                testCharacter.id = result.insertId
                done()
            })
        })
    })

    afterEach('Delete test meta data', function(done) {
        pool.getConnection((err, connection) => {
          if(err) throw err;
            connection.query(`DELETE FROM ${CHARACTERS_TABLE} WHERE id = ?`, [testCharacter.id], (err) => {
                if(err) throw err;
                  connection.release()
                  done()
            })
        })
    })


    const testStore = require('./teststore.js')
    const testSession = testStore.newSession('Test Session')
    //Actual testing
    let controller = new MetadataController(testStore)

    describe('#getMetaData()', function() {
        it('returns the latest updated timestamp at the top level as last_updated', function() {
            return controller.getMetadata().then((data) => {
                let expectedLastUpdated = testLastUpdated;

                assert.deepEqual(data.last_updated, expectedLastUpdated, 'We expect the timestamp of the test character to be returned.')
                return;
            })
        })
    })
})
