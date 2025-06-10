const express = require("express");
const router = express.Router();

const authorized = require("../middleware/auth");
const validateUUID = require('../middleware/uuidValidation.js');

//controllers de clients
const afficher = require("../controllers/clients/afficher.js");
const afficherAll = require("../controllers/clients/afficherAll");
const ajouter = require("../controllers/clients/ajouter");
const modifier = require("../controllers/clients/modifier");
const supprimer = require("../controllers/clients/supprimer");

router.get("/afficher/:uuid", authorized, validateUUID, afficher);
router.get("/afficherAll", authorized, afficherAll);
router.post("/ajouter", authorized, ajouter);
router.put("/modifier/:uuid", authorized, validateUUID, modifier);
router.delete("/supprimer/:uuid", authorized, supprimer);

module.exports = router;
