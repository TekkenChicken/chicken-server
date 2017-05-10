//Node Modules
const express   = require('express')
const router    = express.Router()

const MetadataController = require('./controller.js')

module.exports = function(pool) {
    let controller = new MetadataController(pool)

    router.get('/', (req, res) => {
        controller.getMetadata().then(data => {
            res.json(data)
        }, err => {
            res.send(err)
        })
    })

    return router
}