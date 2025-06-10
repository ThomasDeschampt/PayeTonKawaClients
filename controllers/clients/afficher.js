const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Afficher un client par ID (UUID)
const afficher = async (req, res) => {
  try {
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
