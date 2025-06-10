const clientController = require("../../controllers/clientsController");
const clientsService = require("../../services/clientsService");

jest.mock("../../services/clientsService", () => ({
  getClientById: jest.fn(),
}));

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
    clientsService.getClientById.mockResolvedValue(fakeClient);

    await clientController.afficher(req, res);

    expect(clientsService.getClientById).toHaveBeenCalledWith(fakeClient.id);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: fakeClient,
    });
  });

  it("devrait retourner 404 si client non trouvé", async () => {
    req.params.uuid = "123e4567-e89b-12d3-a456-426614174000";
    clientsService.getClientById.mockResolvedValue(null);

    await clientController.afficher(req, res);

    expect(clientsService.getClientById).toHaveBeenCalledWith(req.params.uuid);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Client non trouvé",
    });
  });

  it("devrait retourner 500 si erreur serveur", async () => {
    req.params.uuid = "123e4567-e89b-12d3-a456-426614174000";
    clientsService.getClientById.mockRejectedValue(new Error("DB fail"));

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    await clientController.afficher(req, res);

    expect(clientsService.getClientById).toHaveBeenCalledWith(req.params.uuid);
    expect(consoleSpy).toHaveBeenCalledWith("Erreur:", expect.any(Error));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Erreur serveur",
    });

    consoleSpy.mockRestore();
  });
});
