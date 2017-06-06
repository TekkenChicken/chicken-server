//Node Modules
const fs        = require('fs')
const path      = require('path')
const mysql     = require('mysql')

//Database Models
const AttackModel = require('../models/attack.js');
const CharacterModel = require('../models/character.js');

const JSON_DIR = path.join(__dirname, 'json');

const FramedataSchema = {
    TableNames: {CHARACTERS: 'Characters_TC', ATTACKS: 'Attacks_TC', META: 'FramedataMeta_TC'},
    SQL: fs.readFileSync(path.join(__dirname, 'schema/framedata.sql'), {encoding: 'utf-8'})
}

//Database set up
const _USER     = process.env.DB_USER
const _PASS     = process.env.DB_PASS
const _DB       = process.env.DB_NAME || 'tekkenchicken'
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
});


//Build framedata
pool.getConnection((err, connection) => {
    if(err) {
        console.log(err);
        return;
    }

    connection.query(FramedataSchema.SQL, (err, results) => {
        if(err) {
            console.log(err);
            connection.release();
            return;
        }

        console.log('Framedata schema created.\nPreparing to insert character data.');

        const allCharacterData = fs.readdirSync(JSON_DIR).map(filename => require(path.join(JSON_DIR, filename)));

        let completedCharacters = 0;

        for(let characterData of allCharacterData) {
            const name = characterData.metadata.name;
            const label = characterData.metadata.character;
            const game = characterData.metadata.game;
            const moves = characterData.moves;

            let character = new CharacterModel({name: name, label: label, game: game});

            connection.query(character.insertQuery(), (err, results) => {
                if(err) {
                    console.log(`Error on insert: ${character.insertQuery()}`);
                    console.log(err);
                    return;
                }

                character.id = results.insertId;

                for(let i = 0; i < moves.length; i++) {
                    let attack = new AttackModel(moves[i]);
                    attack.data.attack_num = i;
                    attack.data.character_id = character.id;

                    connection.query(attack.insertQuery(), (err, results) => {
                        if(err) {
                            console.log(err);
                            return;
                        }

                        if(!results.insertId) {
                            console.log(`Attack not inserted: ${name}'s ${attack.notation}`);
                            return;
                        }

                        if(i == moves.length - 1) {
                            completedCharacters++;
                            console.log(`${character.data.name} completed (${completedCharacters}/${allCharacterData.length})`)

                            if(completedCharacters == allCharacterData.length) {
                                console.log('Framedata initialization completed.');
                                connection.release();
                            }
                        }
                    });
                }

                if(!(moves.length > 1)) {
                    completedCharacters++;
                }
            });
        }
    });
});