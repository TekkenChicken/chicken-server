# chicken-server

## Requests

### Framedata Request
```
http://tc.tekkengamer.com/api/framedata/
```
This is your primary giant blob request. It returns an object full of all characters' framedata indexed by the characters' labels.

**Sample Response**
```
GET http://tc.tekkengamer.com/api/framedata/

{
  "alisa": {
    "name":"Alisa Bosconovich",
    "label":"alisa",
    "data":[
      {
        "notation" : "1",
        "hitLevel" : "h",
        "damage" : "9",
        "speed" : "10",
        "on_block" : "+1",
        "on_hit" : "+8",
        "on_ch" : "+8",
        "notes" : "null"
      },
      ...
    ]
  }
```
**Single Character**
```
GET http://tc.tekkengamer.com/api/framedata/{id|label}
```
You can request frame data for individual characters using their id or label

**Sample Response**
```
{
  "name" : "Bryan Fury",
  "label" : "bryan",
  "data":[
    {
      "notation":"d/f+1+2 or ?d/f+1+2","hitLevel":"m",
      "damage":"null",
      "speed":"null",
      "on_block":"–",
      "on_hit":"KND",
      "on_ch":"KND",
      "notes":"Rage art"
    },
    ...
  ]
}
```

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
