const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const { encrypt, decrypt } = require('../middleware/crypt');

function decryptClientData(client) {
  if (!client) return null;

  const decryptedClient = { ...client };

  if (client.personne) {
    decryptedClient.personne = {
      ...client.personne,
      nom: decrypt(client.personne.nom),
      prenom: decrypt(client.personne.prenom),
      mail: decrypt(client.personne.mail),
      telephone: decrypt(client.personne.telephone),
    };
  }

  if (client.entreprise) {
    decryptedClient.entreprise = {
      ...client.entreprise,
      nomEntreprise: decrypt(client.entreprise.nomEntreprise),
      siret: decrypt(client.entreprise.siret),
    };
  }

  if (client.addresses && client.addresses.length > 0) {
    decryptedClient.addresses = client.addresses.map(addr => ({
      ...addr,
      adresse: decrypt(addr.adresse),
      complement: addr.complement ? decrypt(addr.complement) : null,
    }));
  }

  return decryptedClient;
}


exports.getClientById = async (id) => {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      role: true,
      addresses: true,
      entreprise: true,
      personne: true,
    },
  });

  return decryptClientData(client);
};

exports.getAllClients = async () => {
  const clients = await prisma.client.findMany({
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

  return clients.map(decryptClientData);
};

exports.createClient = async ({ pseudo, motDePasse, roleIdDefaut, personne, entreprise, addresses }) => {
   const hashedPassword = await bcrypt.hash(motDePasse, 10);

  const encryptedPersonne = personne
    ? {
        ...personne,
        nom: encrypt(personne.nom),
        prenom: encrypt(personne.prenom),
        mail: encrypt(personne.mail),
        telephone: encrypt(personne.telephone),
      }
    : undefined;

  const encryptedEntreprise = entreprise
    ? {
        ...entreprise,
        nomEntreprise: encrypt(entreprise.nomEntreprise),
        siret: encrypt(entreprise.siret),
      }
    : undefined;
  
  const encryptedAddresses = addresses
    ? addresses.map(addr => ({
        ...addr,
        adresse: encrypt(addr.adresse),
        complement: addr.complement ? encrypt(addr.complement) : null,
      }))
    : undefined;

  return await prisma.client.create({
    data: {
      pseudo,
      motDePasse: hashedPassword,
      role: { connect: { id: roleIdDefaut } },
      personne: encryptedPersonne  ? { create: encryptedPersonne  } : undefined,
      entreprise: encryptedEntreprise  ? { create: encryptedEntreprise   } : undefined,
      addresses: encryptedAddresses ? { create: encryptedAddresses } : undefined,
    },
    include: {
      personne: true,
      entreprise: true,
      addresses: true,
      role: true,
    },
  });
};

exports.updateClient = async (id, { pseudo, motDePasse, personne, entreprise, addresses }) => {
  const dataToUpdate = {};

  if (pseudo) {
    dataToUpdate.pseudo = pseudo;
  }

  if (motDePasse) {
    dataToUpdate.motDePasse = await bcrypt.hash(motDePasse, 10);
  }

  const updatedClient = await prisma.client.update({
    where: { id },
    data: dataToUpdate,
    include: {
      personne: true,
      entreprise: true,
      addresses: true,
      role: true,
    },
  });

  if (personne) {
    const data = {
      nom: encrypt(personne.nom),
      prenom: encrypt(personne.prenom),
      mail: encrypt(personne.mail),
      telephone: encrypt(personne.telephone),
      dateNaissance: new Date(personne.dateNaissance),
    };

    if (updatedClient.personne) {
      await prisma.personneDetails.update({
        where: { id: updatedClient.personne.id },
        data,
      });
    } else {
      await prisma.personneDetails.create({
        data: {
          ...data,
          client: { connect: { id } },
        },
      });
    }
  }

  if (entreprise) {
    const data = {
      nomEntreprise: encrypt(entreprise.nomEntreprise),
      siret: encrypt(entreprise.siret),
    };

    if (updatedClient.entreprise) {
      await prisma.entrepriseDetails.update({
        where: { id: updatedClient.entreprise.id },
        data,
      });
    } else {
      await prisma.entrepriseDetails.create({
        data: {
          ...data,
          client: { connect: { id } },
        },
      });
    }
  }

  if (addresses && Array.isArray(addresses)) {
    await prisma.address.deleteMany({
      where: { clientId: id },
    });

    for (const addr of addresses) {
      await prisma.address.create({
        data: {
          adresse: encrypt(addr.adresse),
          codePostal: addr.codePostal,
          complement: addr.complement ? encrypt(addr.complement) : null,
          client: { connect: { id } },
        },
      });
    }
  }

  return await prisma.client.findUnique({
    where: { id },
    include: {
      personne: true,
      entreprise: true,
      addresses: true,
      role: true,
    },
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

exports.deleteClient = async (id) => {
  return await prisma.client.delete({
    where: { id },
  });
};