const express = require("express");
const router = express.Router();

const authorized = require("../middleware/auth");
const validateUUID = require('../middleware/uuidValidation.js');

const clientsController = require("../controllers/clientsController");

router.get("/afficher/:uuid", authorized, validateUUID, clientsController.afficher);

module.exports = router;
