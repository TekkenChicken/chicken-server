//Node Modules
const express   = require('express')
const router    = express.Router()

const MetadataController = require('./controller.js')

module.exports = function($store) {
    let controller = new MetadataController($store)

    router.get('/', (req, res) => {
        controller.getMetadata()
        .then( res.setHeader("Cache-Control", "public, max-age=600") ) // Cache endpoint via nginx for 10 minutes
        .then(data => {
            res.json(data)
        }, err => {
            res.send(err)
        })
    })

    return router
}
