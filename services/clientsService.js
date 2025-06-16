const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

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

exports.createClient = async ({ pseudo, motDePasse, roleIdDefaut, personne, entreprise, addresses }) => {

  return await prisma.client.create({
    data: {
      pseudo,
      motDePasse: motDePasse,
      role: { connect: { id: roleIdDefaut } },
      personne: personne ? { create: personne } : undefined,
      entreprise: entreprise ? { create: entreprise } : undefined,
      addresses: addresses ? { create: addresses } : undefined,
    },
    include: {
      personne: true,
      entreprise: true,
      addresses: true,
      role: true,
    },
  });
};

exports.updateClient = async (id, { pseudo, motDePasse, roleId }) => {
  const dataToUpdate = {};

  if (pseudo !== undefined && pseudo !== "") {
    dataToUpdate.pseudo = pseudo;
  }

  if (motDePasse !== undefined && motDePasse !== "") {
    dataToUpdate.motDePasse = motDePasse;
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

  if (client.motDePasse !== motDePasse) {
    return { success: false, message: "Mot de passe incorrect" };
  }

  return {
    success: true,
    client
  };
};

exports.deleteClient = async (id) => {
  return await prisma.client.delete({
    where: { id },
  });
};