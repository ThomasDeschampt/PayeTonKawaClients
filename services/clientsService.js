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


