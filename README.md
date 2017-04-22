# chicken-server
Back-end database and API for the use of Tekken Chicken.


### Running the server
```
node server/database/init.js
npm start
```

### NOTE: This server uses the following environment variables to connect to your MySQL database:
```
DB_USER
DB_PASS
DB_NAME(Optional, defaults to "tekkenchicken")
DB_HOST(Optional, defaults to "localhost")
DB_PORT(Optional, defaults to "3306")
```
