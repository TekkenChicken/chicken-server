const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const bodyParser = require('body-parser')
const api = require('./api')


app.use(bodyParser.json())
app.use('/api', api)

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})