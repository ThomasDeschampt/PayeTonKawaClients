const modifier = require("../../controllers/clients/modifier");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

// Mock PrismaClient
jest.mock("@prisma/client", () => {
  const mockPrisma = {
    client: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

// Mock bcrypt
jest.mock("bcrypt");

const prisma = new PrismaClient();

describe("modifier client", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { uuid: "uuid-123" },
      body: {},
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  it("devrait modifier un client avec succès", async () => {
    req.body = {
      pseudo: "nouveauPseudo",
      motDePasse: "newpassword",
      roleId: "3",
    };

    // Simuler client existant
    prisma.client.findUnique.mockResolvedValue({ id: req.params.uuid });

    // Simuler hash du mot de passe
    bcrypt.hash.mockResolvedValue("hashedPassword");

    // Simuler update client
    prisma.client.update.mockResolvedValue({
      id: req.params.uuid,
      pseudo: req.body.pseudo,
      motDePasse: "hashedPassword",
      roleId: 3,
    });

    await modifier(req, res);

    expect(prisma.client.findUnique).toHaveBeenCalledWith({
      where: { id: req.params.uuid },
    });

    expect(bcrypt.hash).toHaveBeenCalledWith(req.body.motDePasse, 10);

    expect(prisma.client.update).toHaveBeenCalledWith({
      where: { id: req.params.uuid },
      data: {
        pseudo: "nouveauPseudo",
        motDePasse: "hashedPassword",
        roleId: 3,
      },
    });

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Client mis à jour avec succès",
      data: {
        id: req.params.uuid,
        pseudo: req.body.pseudo,
        motDePasse: "hashedPassword",
        roleId: 3,
      },
    });
    expect(res.status).not.toHaveBeenCalled();
  });

  it("devrait retourner 404 si client non trouvé", async () => {
    prisma.client.findUnique.mockResolvedValue(null); // pas trouvé

    await modifier(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Client non trouvé",
    });
  });

  it("devrait gérer une erreur serveur", async () => {
    req.body = {
      pseudo: "nouveauPseudo",
      motDePasse: "newpassword",
      roleId: "3",
    };

    prisma.client.findUnique.mockResolvedValue({ id: req.params.uuid });
    bcrypt.hash.mockResolvedValue("hashedPassword");

    const error = new Error("Erreur DB");
    prisma.client.update.mockRejectedValue(error);

    await modifier(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Erreur serveur",
    });
  });
});
