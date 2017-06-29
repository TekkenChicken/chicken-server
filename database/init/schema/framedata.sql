CREATE TABLE Characters_TC (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    label VARCHAR(20) NOT NULL,
    game VARCHAR(4) NOT NULL,
    PRIMARY KEY(id)
) CHARACTER SET utf8;

CREATE TABLE Attacks_TC (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    character_id INT(10) UNSIGNED NOT NULL,
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
    PRIMARY KEY (id),
    FOREIGN KEY (character_id) REFERENCES Characters_TC(id)
) CHARACTER SET utf8;

CREATE TABLE FramedataMeta_TC (
    id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(20) NOT NULL,
    value VARCHAR(120) NOT NULL,
    PRIMARY KEY(id)
) CHARACTER SET utf8;