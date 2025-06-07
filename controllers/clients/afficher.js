const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Afficher un client par ID (UUID)
const afficher = async (req, res) => {
  try {
    const { uuid } = req.params;
    console.log("UUID du client à afficher:", uuid);

    // Validation UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(uuid)) {
      return res.status(400).json({
        success: false,
        message: "UUID invalide",
      });
    }

    const client = await prisma.client.findUnique({
      where: { id: uuid },
      include: {
        role: true,
        addresses: true,
        entreprise: true,
        personne: true,
      },
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client non trouvé",
      });
    }

    res.json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
};

module.exports = afficher;
