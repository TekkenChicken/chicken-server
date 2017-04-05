# chicken-server
Back-end database and API for the use of Tekken Chicken.


### Running the server
```
node server/database/init.js
npm start
```

### NOTE: This server uses the following environment variables to connect to your PG database:
```
PG_USER
PG_PASS
PG_DB(Optional, defaults to "tekken-chicken")
PG_HOST(Optional, defaults to "localhost")
PG_PORT(Optional, defaults to "5432")
```
