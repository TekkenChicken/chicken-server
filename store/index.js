const mysql = require('mysql');

const CHAR_TABLE_NAME = 'Characters_TC';
const CharacterModel = require('../database/models/character.js');

class ServerStore {
    constructor(dbConfig) {
        this.pool = mysql.createPool(dbConfig);
        this._characters = [];

        this.loadAllCharacters();
    }

    loadAllCharacters() {
        return new Promise((resolve, reject) => {
            this.pool.query(`SELECT * FROM ${CHAR_TABLE_NAME}`, (err, results) => {
                if(err) {
                    console.log('Error loading characters: ' + err);
                }
                else {
                    for(let i = 0; i < results.length; i++) {
                        this._characters.push(new CharacterModel(results[i]));  
                    }
                }
            });  
        })
    }

    //Method should return a Promise passing framedata blob object
    getAllFramedata() {

    }

    //Method should return framedata for the specified character
    getAllFramedataByLabel(label) {

    }

}

module.exports = ServerStore;