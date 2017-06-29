const CharacterModel = require('../models/character.js');

const CHAR_TABLE_NAME = 'Characters_TC';
const ATTK_TABLE_NAME = 'Attacks_TC';

function($GlobalStore) {

    function getAllCharacterMetadata() {
        const getAllQuery = `SELECT * FROM ${CHAR_TABLE_NAME}`;
        return $GlobalStore.getDatabaseConnection()
        .then((connection) => {
            return new Promise((resolve, reject) => {
                connection.query(getAllQuery, (err, rows) => {
                    connection.release();
                    if(err) throw err;
                    const characters = rows.map(row => new Character(row));
                    resolve(characters);
                });
            });
        });
    }

    function getAllCharacterData() {
        const getAllDataQuery;
    }

    function getCharacterDataByDataLabel(label) {

    }

    function getCharacterDataById(id) {

    }
}