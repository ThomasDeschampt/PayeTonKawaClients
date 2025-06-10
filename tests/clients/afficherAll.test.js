const clientController = require("../../controllers/clientsController");
const { PrismaClient } = require("@prisma/client");

// Mock de Prisma Client
jest.mock("@prisma/client", () => {
  const mockPrisma = {
    client: {
      findMany: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

const prisma = new PrismaClient();

describe("afficherAll clients", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe("Cas de succès", () => {
    it("devrait retourner tous les clients avec succès", async () => {
      const mockClients = [
        {
          id: "uuid-1",
          pseudo: "Client1",
          createdAt: new Date("2024-01-02"),
        },
        {
          id: "uuid-2",
          pseudo: "Client2",
          createdAt: new Date("2024-01-01"),
        },
      ];

      prisma.client.findMany.mockResolvedValue(mockClients);

      await clientController.afficherAll(req, res);

      expect(prisma.client.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          personne: true,
          entreprise: true,
          addresses: true,
          role: true,
        },
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockClients,
        count: mockClients.length,
      });

      expect(res.status).not.toHaveBeenCalled();
    });

    it("devrait retourner un tableau vide si aucun client", async () => {
      prisma.client.findMany.mockResolvedValue([]);

      await clientController.afficherAll(req, res);

      expect(prisma.client.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          personne: true,
          entreprise: true,
          addresses: true,
          role: true,
        },
      });

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [],
        count: 0,
      });
    });
  });

  describe("Cas d'erreur", () => {
    it("devrait gérer une erreur DB générique", async () => {
      const error = new Error("Erreur DB");
      prisma.client.findMany.mockRejectedValue(error);

      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await clientController.afficherAll(req, res);

      expect(consoleSpy).toHaveBeenCalledWith("Erreur:", error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Erreur serveur",
      });

      consoleSpy.mockRestore();
    });
  });

  describe("Vérifications supplémentaires", () => {
    it("devrait appeler findMany une seule fois", async () => {
      prisma.client.findMany.mockResolvedValue([]);
      await clientController.afficherAll(req, res);
      expect(prisma.client.findMany).toHaveBeenCalledTimes(1);
    });

    it("ne devrait pas appeler res.status si tout se passe bien", async () => {
      prisma.client.findMany.mockResolvedValue([]);
      await clientController.afficherAll(req, res);
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
