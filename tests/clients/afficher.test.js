const clientController = require("../../controllers/clientsController");
const clientsService = require("../../services/clientsService");

jest.mock("../../services/clientsService", () => ({
  getClientById: jest.fn(),
}));

describe("afficher client", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { uuid: "uuid-123" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("devrait retourner un client si trouvé", async () => {
    const mockClient = {
      id: "uuid-123",
      pseudo: "client1",
      roleId: 1,
    };

    clientsService.getClientById.mockResolvedValue(mockClient);

    await clientController.afficher(req, res);

    expect(clientsService.getClientById).toHaveBeenCalledWith("uuid-123");
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockClient,
    });
  });

  it("devrait retourner 404 si client non trouvé", async () => {
    clientsService.getClientById.mockResolvedValue(null);

    await clientController.afficher(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Client non trouvé",
    });
  });

  it("devrait retourner 500 si erreur serveur", async () => {
    clientsService.getClientById.mockRejectedValue(new Error("Erreur DB"));

    await clientController.afficher(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Erreur serveur",
    });
  });
});
