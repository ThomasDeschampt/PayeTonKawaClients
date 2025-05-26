const express = require('express');
const router = express.Router();

const authorized = require('../middleware/auth');

//controllers de clients
const afficherAll = require('../controllers/clients/afficherAll');

router.get('/afficherAll', authorized, afficherAll);

module.exports = router;