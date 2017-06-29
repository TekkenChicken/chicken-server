const express   = require('express');
const router    = express.Router();


module.exports = function($store) {
    let controller = new FramedataController($store);

    router.get('/', (req, res) => {

    });

    router.get('/:labelOrId', (req, res) => {

    });

    return router;
}
