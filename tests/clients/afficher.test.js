const clientController = require("../../controllers/clientsController");
const { PrismaClient } = require("@prisma/client");

jest.mock("@prisma/client", () => {
  const mockPrisma = {
    client: {
      findUnique: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

const prisma = new PrismaClient();

describe("afficher client", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  it("devrait retourner un client si trouvé", async () => {
    const fakeClient = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      pseudo: "JeanClient",
      roleId: 1,
    };

    req.params.uuid = fakeClient.id;
    prisma.client.findUnique.mockResolvedValue(fakeClient);

    await clientController.afficher(req, res);

    expect(prisma.client.findUnique).toHaveBeenCalledWith({
      where: { id: fakeClient.id },
      include: {
        personne: true,
        entreprise: true,
        addresses: true,
        role: true,
      },
    });

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: fakeClient,
    });
  });

  it("devrait retourner 404 si client non trouvé", async () => {
    req.params.uuid = "123e4567-e89b-12d3-a456-426614174000";
    prisma.client.findUnique.mockResolvedValue(null);

    await clientController.afficher(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Client non trouvé",
    });
  });

  it("devrait retourner 500 si erreur serveur", async () => {
    req.params.uuid = "123e4567-e89b-12d3-a456-426614174000";
    prisma.client.findUnique.mockRejectedValue(new Error("DB fail"));

    await clientController.afficher(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Erreur serveur",
    });
  });
});
