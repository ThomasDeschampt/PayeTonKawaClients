const express = require("express");
const router = express.Router();

const authorized = require("../middleware/auth");
const validateUUID = require('../middleware/uuidValidation.js');

const clientsController = require("../controllers/clientsController");

router.get("/afficher/:uuid", authorized, validateUUID, clientsController.afficher);
router.get("/afficherAll", authorized, clientsController.afficherAll);
router.post("/ajouter", authorized, clientsController.ajouter);
router.put("/modifier/:uuid", authorized, validateUUID, clientsController.modifier);
router.delete("/supprimer/:uuid", authorized, validateUUID, clientsController.supprimer);

module.exports = router;
