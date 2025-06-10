const express = require("express");
const router = express.Router();

const authorized = require("../middleware/auth");
const validateUUID = require('../middleware/uuidValidation.js');

const clientsController = require("../controllers/clientsController");

/**
 * @swagger
 * components:
 *   schemas:
 *     Client:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: UUID du client
 *         pseudo:
 *           type: string
 *           description: Pseudo du client
 *         roleId:
 *           type: integer
 *           description: ID du rôle du client
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date de mise à jour
 *         role:
 *           type: object
 *           description: Informations du rôle
 *         addresses:
 *           type: array
 *           items:
 *             type: object
 *           description: Adresses du client
 *         entreprise:
 *           type: object
 *           description: Détails de l'entreprise
 *         personne:
 *           type: object
 *           description: Détails de la personne
 *     ClientInput:
 *       type: object
 *       required:
 *         - pseudo
 *         - motDePasse
 *         - roleId
 *       properties:
 *         pseudo:
 *           type: string
 *           description: Pseudo du client
 *         motDePasse:
 *           type: string
 *           description: Mot de passe du client
 *         roleId:
 *           type: integer
 *           description: ID du rôle du client
 *         personne:
 *           type: object
 *           description: Détails de la personne (optionnel)
 *         entreprise:
 *           type: object
 *           description: Détails de l'entreprise (optionnel)
 *         addresses:
 *           type: array
 *           items:
 *             type: object
 *           description: Adresses du client (optionnel)
 *     ClientUpdate:
 *       type: object
 *       properties:
 *         pseudo:
 *           type: string
 *           description: Nouveau pseudo du client
 *         motDePasse:
 *           type: string
 *           description: Nouveau mot de passe du client
 *         roleId:
 *           type: integer
 *           description: Nouvel ID du rôle du client
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indique si la requête a réussi
 *         message:
 *           type: string
 *           description: Message de réponse
 *         data:
 *           description: Données de réponse
 *         count:
 *           type: integer
 *           description: Nombre d'éléments (pour les listes)
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/clients/afficher/{uuid}:
 *   get:
 *     summary: Afficher un client par UUID
 *     description: Récupère les détails d'un client spécifique en utilisant son identifiant UUID
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID du client à récupérer
 *     responses:
 *       200:
 *         description: Client récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Client'
 *             example:
 *               success: true
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 pseudo: "john_doe"
 *                 roleId: 1
 *                 role: {}
 *                 addresses: []
 *                 entreprise: null
 *                 personne: {}
 *       404:
 *         description: Client non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "Client non trouvé"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "Erreur serveur"
 */
router.get("/afficher/:uuid", authorized, validateUUID, clientsController.afficher);

/**
 * @swagger
 * /api/clients/afficherAll:
 *   get:
 *     summary: Afficher tous les clients
 *     description: Récupère la liste de tous les clients avec leurs détails associés
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des clients récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Client'
 *                     count:
 *                       type: integer
 *             example:
 *               success: true
 *               data: []
 *               count: 0
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "Erreur serveur"
 */
router.get("/afficherAll", authorized, clientsController.afficherAll);

/**
 * @swagger
 * /api/clients/ajouter:
 *   post:
 *     summary: Ajouter un nouveau client
 *     description: Crée un nouveau client avec les informations fournies
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientInput'
 *           example:
 *             pseudo: "john_doe"
 *             motDePasse: "motdepasse123"
 *             roleId: 1
 *             personne:
 *               nom: "Doe"
 *               prenom: "John"
 *             addresses:
 *               - rue: "123 Main St"
 *                 ville: "Paris"
 *                 codePostal: "75001"
 *     responses:
 *       201:
 *         description: Client créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Client'
 *             example:
 *               success: true
 *               message: "Client créé avec succès"
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 pseudo: "john_doe"
 *                 roleId: 1
 *       400:
 *         description: Données manquantes ou invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "pseudo, motDePasse et roleId sont requis"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "Erreur serveur"
 */
router.post("/ajouter", authorized, clientsController.ajouter);

/**
 * @swagger
 * /api/clients/modifier/{uuid}:
 *   put:
 *     summary: Modifier un client
 *     description: Met à jour les informations d'un client existant
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID du client à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientUpdate'
 *           example:
 *             pseudo: "nouveau_pseudo"
 *             motDePasse: "nouveaumotdepasse123"
 *             roleId: 2
 *     responses:
 *       200:
 *         description: Client mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Client'
 *             example:
 *               success: true
 *               message: "Client mis à jour avec succès"
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 pseudo: "nouveau_pseudo"
 *                 roleId: 2
 *       404:
 *         description: Client non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "Client non trouvé"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "Erreur serveur"
 */
router.put("/modifier/:uuid", authorized, validateUUID, clientsController.modifier);

/**
 * @swagger
 * /api/clients/supprimer/{uuid}:
 *   delete:
 *     summary: Supprimer un client
 *     description: Supprime un client et toutes ses données associées
 *     tags:
 *       - Clients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID du client à supprimer
 *     responses:
 *       200:
 *         description: Client supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Client et données liées supprimés avec succès"
 *       404:
 *         description: Client non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "Client non trouvé"
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "Erreur serveur"
 */
router.delete("/supprimer/:uuid", authorized, validateUUID, clientsController.supprimer);

module.exports = router;