const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

// Ajouter un client avec ses relations
const ajouter = async (req, res) => {
  console.log("Ajouter un client:", req.body);

  try {
    const { pseudo, motDePasse, roleId, personne, entreprise, addresses } =
      req.body;

    if (!pseudo || !motDePasse || !roleId) {
      return res.status(400).json({
        success: false,
        message: "pseudo, motDePasse et roleId sont requis",
      });
    }

    // Hasher le mot de passe avant de l'enregistrer
    const hashedPassword = await bcrypt.hash(motDePasse, 10); // 10 = salt rounds

    const nouveauClient = await prisma.client.create({
      data: {
        pseudo,
        motDePasse: hashedPassword,
        roleId: parseInt(roleId),
        // Création des relations si elles sont fournies
        personne: personne ? { create: personne } : undefined,
        entreprise: entreprise ? { create: entreprise } : undefined,
        addresses: addresses ? { create: addresses } : undefined,
      },
      include: {
        personne: true,
        entreprise: true,
        addresses: true,
      },
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

module.exports = ajouter;
