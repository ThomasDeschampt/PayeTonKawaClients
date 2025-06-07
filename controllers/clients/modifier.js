const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

// Modifier un client
const modifier = async (req, res) => {
  console.log("Modifier un client ", req.body);

  try {
    const { uuid } = req.params;
    const { pseudo, motDePasse, roleId } = req.body;

    // Vérifier si le client existe
    const clientExistant = await prisma.client.findUnique({
      where: { id: uuid },
    });

    if (!clientExistant) {
      return res.status(404).json({
        success: false,
        message: "Client non trouvé",
      });
    }

    // Hasher le mot de passe avant de l'enregistrer
    const hashedPassword = await bcrypt.hash(motDePasse, 10); // 10 = salt rounds

    // Construire l'objet de mise à jour
    const dataToUpdate = {};
    if (pseudo !== undefined && pseudo !== "") dataToUpdate.pseudo = pseudo;
    if (motDePasse !== undefined && motDePasse !== "")
      dataToUpdate.motDePasse = hashedPassword;
    if (roleId !== undefined && roleId !== "") {
      const roleIdParsed = parseInt(roleId);
      if (!isNaN(roleIdParsed)) dataToUpdate.roleId = roleIdParsed;
    }

    const clientMisAJour = await prisma.client.update({
      where: { id: uuid },
      data: dataToUpdate,
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

module.exports = modifier;
