CREATE TABLE Attacks_TC (
    character_id INT(3),
    notation VARCHAR(100) NOT NULL,
    hit_level VARCHAR(50),
    damage VARCHAR(50),
    speed VARCHAR(40), 
    on_block VARCHAR(40),
    on_hit VARCHAR(40),
    on_ch VARCHAR(40),
    notes TEXT,
    FOREIGN KEY (character_id) REFERENCES Characters_TC(id)
) CHARACTER SET utf8mb4;