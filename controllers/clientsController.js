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

