const clientsService = require("../services/clientsService");
const rabbitmq = require("../services/rabbitmqService");
const jwt = require('jsonwebtoken');
const { messagesSent, messagesReceived } = require('../metrics');

exports.afficher = async (req, res) => {
  try {
    const client = await clientsService.getClientById(req.params.uuid);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client non trouvé",
      });
    }
    res.json({ success: true, data: client });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

exports.afficherAll = async (req, res) => {
  try {
    const clients = await clientsService.getAllClients();

    res.json({
      success: true,
      data: clients,
      count: clients.length,
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

exports.ajouter = async (req, res) => {
  try {
    const { pseudo, motDePasse, personne, entreprise, addresses } = req.body;

    if (!pseudo || !motDePasse) {
      return res.status(400).json({
        success: false,
        message: "pseudo, motDePasse sont requis",
      });
    }

    const roleIdDefaut = 1;

    const nouveauClient = await clientsService.createClient({
      pseudo,
      motDePasse,
      roleIdDefaut,
      personne,
      entreprise,
      addresses,
    });

    await rabbitmq.publishClientCreated(nouveauClient);
    messagesSent.inc({ queue: 'client.created' });

    res.status(201).json({
      success: true,
      data: nouveauClient,
      message: "Client créé avec succès",
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

exports.modifier = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { pseudo, motDePasse, personne, entreprise, addresses } = req.body;

    const clientExistant = await clientsService.getClientById(uuid);

    if (!clientExistant) {
      return res.status(404).json({
        success: false,
        message: "Client non trouvé",
      });
    }

    const clientMisAJour = await clientsService.updateClient(uuid, {
      pseudo,
      motDePasse,
      personne,
      entreprise,
      addresses
    });

    await rabbitmq.publishClientUpdated(clientMisAJour);
    messagesSent.inc({ queue: 'client.updated' });

    res.json({
      success: true,
      message: "Client mis à jour avec succès",
      data: clientMisAJour,
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

exports.supprimer = async (req, res) => {
  try {
    const { uuid } = req.params;

    const clientExistant = await clientsService.getClientById(uuid);
    if (!clientExistant) {
      return res.status(404).json({
        success: false,
        message: "Client non trouvé",
      });
    }

    await clientsService.deleteClient(uuid);

    await rabbitmq.publishClientDeleted(uuid);
    messagesSent.inc({ queue: 'client.deleted' });

    res.json({
      success: true,
      message: "Client et données liées supprimés avec succès",
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

exports.verifierMotDePasse = async (req, res) => {
  try {
    const { pseudo, motDePasse } = req.body;

    if (!pseudo || !motDePasse) {
      return res.status(400).json({
        success: false,
        message: "pseudo et motDePasse sont requis",
      });
    }

    const resultat = await clientsService.verifierMotDePasse(pseudo, motDePasse);

    if (!resultat.success) {
      return res.status(401).json({
        success: false,
        message: resultat.message,
      });
    }

    const { client } = resultat;

    const payload = {
          id: client.id,
          pseudo: client.pseudo,
          role: client.role.name,
        };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1h' 
    });

    return res.json({
      success: true,
      message: "Authentification réussie",
      token,
      data: resultat.client,
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

