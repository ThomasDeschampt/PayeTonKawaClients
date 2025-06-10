const clientsService = require("../services/clientsService");

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
    const { pseudo, motDePasse, roleId, personne, entreprise, addresses } = req.body;

    if (!pseudo || !motDePasse || !roleId) {
      return res.status(400).json({
        success: false,
        message: "pseudo, motDePasse et roleId sont requis",
      });
    }

    const nouveauClient = await clientsService.createClient({
      pseudo,
      motDePasse,
      roleId,
      personne,
      entreprise,
      addresses,
    });

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
    const { pseudo, motDePasse, roleId } = req.body;

    // Vérifier que le client existe avant update
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
      roleId,
    });

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


