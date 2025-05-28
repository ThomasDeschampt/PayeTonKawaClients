const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Afficher tous les clients avec leurs adresses et entreprises
const afficherAll = async (req, res) => {
  console.log("Afficher tous les clients avec jointures", req);
  try {
    const clients = await prisma.clients.findMany({
      include: {
        addresses: true,      // Inclut toutes les adresses du client
        entreprises: true     // Inclut toutes les entreprises du client
      },
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