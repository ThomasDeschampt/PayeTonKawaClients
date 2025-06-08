const supprimer = require("../../controllers/clients/supprimer");
const { PrismaClient } = require("@prisma/client");

// Mock PrismaClient
jest.mock("@prisma/client", () => {
  const mockPrisma = {
    client: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    address: {
      deleteMany: jest.fn(),
    },
    entrepriseDetails: {
      deleteMany: jest.fn(),
    },
    personneDetails: {
      deleteMany: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

const prisma = new PrismaClient();

describe("supprimer client", () => {
  let req, res;

  beforeEach(() => {
    req = { params: { uuid: "uuid-123" } };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  it("devrait supprimer un client et ses données liées avec succès", async () => {
    // Client trouvé
    prisma.client.findUnique.mockResolvedValue({ id: req.params.uuid });

    // Suppressions liées réussies
    prisma.address.deleteMany.mockResolvedValue({});
    prisma.entrepriseDetails.deleteMany.mockResolvedValue({});
    prisma.personneDetails.deleteMany.mockResolvedValue({});
    prisma.client.delete.mockResolvedValue({ id: req.params.uuid });

    await supprimer(req, res);

    expect(prisma.client.findUnique).toHaveBeenCalledWith({
      where: { id: req.params.uuid },
    });

    expect(prisma.address.deleteMany).toHaveBeenCalledWith({
      where: { clientId: req.params.uuid },
    });
    expect(prisma.entrepriseDetails.deleteMany).toHaveBeenCalledWith({
      where: { clientId: req.params.uuid },
    });
    expect(prisma.personneDetails.deleteMany).toHaveBeenCalledWith({
      where: { clientId: req.params.uuid },
    });
    expect(prisma.client.delete).toHaveBeenCalledWith({
      where: { id: req.params.uuid },
    });

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Client et données liées supprimés avec succès",
    });

    expect(res.status).not.toHaveBeenCalled();
  });

  it("devrait retourner 404 si client non trouvé", async () => {
    prisma.client.findUnique.mockResolvedValue(null);

    await supprimer(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Client non trouvé",
    });
  });

  it("devrait gérer une erreur serveur", async () => {
    prisma.client.findUnique.mockResolvedValue({ id: req.params.uuid });
    // Simuler une erreur lors de la suppression d’adresses
    const error = new Error("Erreur DB");
    prisma.address.deleteMany.mockRejectedValue(error);

    await supprimer(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Erreur serveur",
    });
  });
});
