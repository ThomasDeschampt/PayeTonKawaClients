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
