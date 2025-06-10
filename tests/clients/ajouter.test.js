const clientController = require("../../controllers/clientsController");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

// Mock Prisma Client
jest.mock("@prisma/client", () => {
  const mockPrisma = {
    client: {
      create: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

// Mock bcrypt.hash
jest.mock("bcrypt", () => ({
  hash: jest.fn(),
}));

const prisma = new PrismaClient();

describe("ajouter client", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("devrait retourner 400 si pseudo, motDePasse ou roleId manquent", async () => {
    req.body = { pseudo: "test" }; // motDePasse et roleId manquants

    await clientController.ajouter(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "pseudo, motDePasse et roleId sont requis",
    });
    expect(prisma.client.create).not.toHaveBeenCalled();
  });

  it("devrait créer un client avec hash de mot de passe", async () => {
    const fakeHash = "hashedpassword";
    bcrypt.hash.mockResolvedValue(fakeHash);

    req.body = {
      pseudo: "client1",
      motDePasse: "password123",
      roleId: "2",
      personne: { nom: "Dupont", prenom: "Jean" },
      entreprise: { nom: "EntrepriseX" },
      addresses: [{ rue: "1 rue A", ville: "Paris" }],
    };

    const createdClient = {
      id: "uuid-1",
      pseudo: "client1",
      motDePasse: fakeHash,
      roleId: 2,
      personne: req.body.personne,
      entreprise: req.body.entreprise,
      addresses: req.body.addresses,
    };

    prisma.client.create.mockResolvedValue(createdClient);

    await clientController.ajouter(req, res);

    // Vérifier que bcrypt.hash a été appelé avec le mot de passe et salt rounds 10
    expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);

    // Vérifier l'appel à prisma.client.create avec les bonnes données
    expect(prisma.client.create).toHaveBeenCalledWith({
      data: {
        pseudo: "client1",
        motDePasse: fakeHash,
        roleId: 2,
        personne: { create: req.body.personne },
        entreprise: { create: req.body.entreprise },
        addresses: { create: req.body.addresses },
      },
      include: {
        personne: true,
        entreprise: true,
        addresses: true,
      },
    });

    // Vérifier la réponse
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: createdClient,
      message: "Client créé avec succès",
    });
  });

  it("devrait gérer une erreur serveur", async () => {
    req.body = {
      pseudo: "client1",
      motDePasse: "password123",
      roleId: "2",
    };

    bcrypt.hash.mockResolvedValue("hash");
    const error = new Error("Erreur DB");
    prisma.client.create.mockRejectedValue(error);

    await clientController.ajouter(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Erreur serveur",
    });
  });
});
