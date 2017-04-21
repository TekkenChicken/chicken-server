CREATE OR REPLACE FUNCTION create_characters()
  RETURNS void AS 
$func$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_catalog.pg_tables
                WHERE   tablename = 'characters') THEN
            RAISE NOTICE 'Table "characters" already exists.';
    ELSE
        CREATE TABLE characters (
            id SERIAL PRIMARY KEY,
            name VARCHAR(30) NOT NULL,
            label VARCHAR(10) NOT NULL,
            game VARCHAR(4) NOT NULL,
            last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
    END IF;
END

CREATE OR REPLACE FUNCTION create_attacks()
  RETURNS void AS 
$func$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_catalog.pg_tables
                WHERE   tablename = 'attacks') THEN
            RAISE NOTICE 'Table "attacks" already exists.';
    ELSE
        CREATE TABLE CREATE TABLE attacks (
            character_id INTEGER references characters(id),
            notation VARCHAR(100) NOT NULL,
            hit_level VARCHAR(50),
            damage VARCHAR(50),
            speed VARCHAR(40), 
            on_block VARCHAR(40),
            on_hit VARCHAR(40),
            on_ch VARCHAR(40),
            notes TEXT
        );
    END IF;
END
$func$ LANGUAGE plpgsql;

SELECT create_characters();
SELECT create_attacks();