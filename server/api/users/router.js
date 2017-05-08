//Node modules
const express   = require('express')
const router    = express.Router()

const UsersController = require('./controller.js')

module.exports = function(pool) {
    let controller = new UsersController(pool)

    router.post('/', (req, res) => {
        const options = {
            accountName: req.params.accountName,
            displayName: req.params.displayName,
            email: req.params.email,
            password: req.params.password
        }

        if(!options.accountName || !options.displayName || !options.email || !options.password) {
            res.status(400).send('Missing parameters');
            console.log(options)
            return;
        }

        controller.createUser(options).then((session) => {
            res.json(Object.assign(session, {success: true}))
        }, err => {
            res.json({success: false, message: err.message})
        })
    })

    router.post('/login', (req, res) => {
        if(req.params.accountName || !req.params.password) {
            res.status(400).send({message: 'Missing Parameters', success: false})
            return;
        }

        controller.login(req.params.accountName, req.params.password)
        .then(results => {
            res.json(results)
        }, err => {
            res.json(err)
        })
    })
}