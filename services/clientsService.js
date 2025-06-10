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

const bcrypt = require("bcrypt");

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

