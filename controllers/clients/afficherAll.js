const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Afficher tout les clients
const afficherAll = async (req, res) => {
    console.log("Afficher tout les clients", req);


  try {
    const clients = await prisma.clients.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });
    res.json({
      success: true,
      data: clients,
      count: clients.length
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

module.exports = afficherAll;