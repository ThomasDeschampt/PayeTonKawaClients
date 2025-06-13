const clientController = require("../../controllers/clientsController");
const clientsService = require("../../services/clientsService");

jest.mock("../../services/clientsService", () => ({
  getAllClients: jest.fn(),
}));

describe("afficherAll clients", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("devrait retourner tous les clients avec succès", async () => {
    const mockClients = [
      {
        id: "uuid-1",
        pseudo: "client1",
        roleId: 1,
      },
      {
        id: "uuid-2",
        pseudo: "client2",
        roleId: 1,
      },
    ];

    clientsService.getAllClients.mockResolvedValue(mockClients);

    await clientController.afficherAll(req, res);

    expect(clientsService.getAllClients).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockClients,
      count: mockClients.length,
    });
  });

  it("devrait retourner un tableau vide si aucun client", async () => {
    clientsService.getAllClients.mockResolvedValue([]);

    await clientController.afficherAll(req, res);

    expect(clientsService.getAllClients).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [],
      count: 0,
    });
  });

  it("devrait gérer une erreur serveur", async () => {
    clientsService.getAllClients.mockRejectedValue(new Error("Erreur DB"));

    await clientController.afficherAll(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Erreur serveur",
    });
  });
});
