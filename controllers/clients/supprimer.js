const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Supprimer un client avec suppression des données liées
const supprimer = async (req, res) => {

  try {
    const { uuid } = req.params;

    // Vérifier que le client existe
    const clientExistant = await prisma.client.findUnique({
      where: { id: uuid },
    });

    if (!clientExistant) {
      return res.status(404).json({
        success: false,
        message: "Client non trouvé",
      });
    }

    // Supprimer les addresses liées
    await prisma.address.deleteMany({
      where: { clientId: uuid },
    });

    // Supprimer les détails entreprise liés
    await prisma.entrepriseDetails.deleteMany({
      where: { clientId: uuid },
    });

    // Supprimer les détails personne liés
    await prisma.personneDetails.deleteMany({
      where: { clientId: uuid },
    });

    // Supprimer le client
    await prisma.client.delete({
      where: { id: uuid },
    });

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

module.exports = supprimer;
