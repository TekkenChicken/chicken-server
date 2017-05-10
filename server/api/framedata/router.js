//Node Modules
const express   = require('express')
const router    = express.Router()

const FramedataController = require('./controller.js')

module.exports = function($store) {
    let controller = new FramedataController($store)

    router.get('/', (req, res) => {
        controller.getAllData()
        .then( data => res.json(data) )
        .catch( err => res.status(500).send(err) )
    })

    router.get('/:id', (req, res) => {
        controller.getCharacterData(req.params.id)
        .then( data => res.json(data) )
        .catch( err => res.status(500).send(err) )
    })

    return router
}