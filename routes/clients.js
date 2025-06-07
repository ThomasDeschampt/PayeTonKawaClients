const express = require("express");
const router = express.Router();

const authorized = require("../middleware/auth");

//controllers de clients
const ajouter = require("../controllers/clients/ajouter");
const afficher = require("../controllers/clients/afficher.js");
const afficherAll = require("../controllers/clients/afficherAll");

router.post("/ajouter", authorized, ajouter);
router.get("/afficher/:uuid", authorized, afficher);
router.get("/afficherAll", authorized, afficherAll);

module.exports = router;
