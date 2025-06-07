const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const afficherAll = async (req, res) => {
  console.log("Afficher tous les clients avec jointures", req);
  try {
    const clients = await prisma.client.findMany({
      include: {
        addresses: true,
        entreprise: true,
        personne: true,
        role: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

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

module.exports = afficherAll;
