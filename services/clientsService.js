const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

exports.getClientById = async (id) => {
  return await prisma.client.findUnique({
    where: { id },
    include: {
      role: true,
      addresses: true,
      entreprise: true,
      personne: true,
    },
  });
};

exports.getAllClients = async () => {
  return await prisma.client.findMany({
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
};

exports.createClient = async ({ pseudo, motDePasse, roleId, personne, entreprise, addresses }) => {
  const hashedPassword = await bcrypt.hash(motDePasse, 10);

  return await prisma.client.create({
    data: {
      pseudo,
      motDePasse: hashedPassword,
      roleId: parseInt(roleId),
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
};

exports.updateClient = async (id, { pseudo, motDePasse, roleId }) => {
  const dataToUpdate = {};

  if (pseudo !== undefined && pseudo !== "") {
    dataToUpdate.pseudo = pseudo;
  }

  if (motDePasse !== undefined && motDePasse !== "") {
    dataToUpdate.motDePasse = await bcrypt.hash(motDePasse, 10);
  }

  if (roleId !== undefined && roleId !== "") {
    const roleIdParsed = parseInt(roleId);
    if (!isNaN(roleIdParsed)) {
      dataToUpdate.roleId = roleIdParsed;
    }
  }

  return await prisma.client.update({
    where: { id },
    data: dataToUpdate,
  });
};

exports.verifierMotDePasse = async (pseudo, motDePasse) => {
  const client = await prisma.client.findUnique({
    where: { pseudo },
    include: {
      role: true,
    },
  });

  if (!client) {
    return { success: false, message: "Pseudo incorrect" };
  }

  const isPasswordValid = await bcrypt.compare(motDePasse, client.motDePasse);

  if (!isPasswordValid) {
    return { success: false, message: "Mot de passe incorrect" };
  }

  return {
    success: true,
    client
  };
};
