CREATE TABLE Characters_TC (
    id INT(3) NOT NULL AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    label VARCHAR(10) NOT NULL,
    game VARCHAR(4) NOT NULL,
    last_updated INT(11) NOT NULL,
    PRIMARY KEY(id)
) CHARACTER SET utf8;

CREATE TABLE Attacks_TC (
    character_id INT(3) NOT NULL,
    notation VARCHAR(100) NOT NULL,
    hit_level VARCHAR(50),
    damage VARCHAR(50),
    speed VARCHAR(40), 
    on_block VARCHAR(40),
    on_hit VARCHAR(40),
    on_ch VARCHAR(40),
    notes TEXT,
    properties TEXT,
    attack_num INT(5) NOT NULL,
    PRIMARY KEY (character_id, attack_num),
    FOREIGN KEY (character_id) REFERENCES Characters_TC(id)
) CHARACTER SET utf8;