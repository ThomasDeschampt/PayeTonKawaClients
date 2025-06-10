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
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  it("devrait retourner tous les clients avec succès", async () => {
    const mockClients = [
      { id: "uuid-1", pseudo: "Client1", createdAt: new Date("2024-01-02") },
      { id: "uuid-2", pseudo: "Client2", createdAt: new Date("2024-01-01") },
    ];

    clientsService.getAllClients.mockResolvedValue(mockClients);

    await clientController.afficherAll(req, res);

    expect(clientsService.getAllClients).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockClients,
      count: mockClients.length,
    });
    expect(res.status).not.toHaveBeenCalled();
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
    const error = new Error("Erreur DB");
    clientsService.getAllClients.mockRejectedValue(error);

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
