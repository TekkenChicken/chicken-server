# chicken-server
Back-end database and API for the use of Tekken Chicken.


### Setup
This server uses the following environment variables to connect to your Postgres database:
```
PG_USER
PG_PASS
PG_DB(Optional, defaults to "tekken-chicken")
PG_HOST(Optional, defaults to "localhost")
PG_PORT(Optional, defaults to "5432")
```
Set these and run `node server/database/init.js` to initialize the database for the API.

Keep in mind the variables are also necessary when you run `npm start`
