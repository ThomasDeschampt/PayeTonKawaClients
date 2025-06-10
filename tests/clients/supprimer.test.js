const clientController = require("../../controllers/clientsController");

jest.mock("../../services/clientsService", () => ({
  getClientById: jest.fn(),
  deleteClient: jest.fn(),
}));

const clientsService = require("../../services/clientsService");

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
    clientsService.getClientById.mockResolvedValue({ id: req.params.uuid });
    clientsService.deleteClient.mockResolvedValue({}); // simulé comme réussi

    await clientController.supprimer(req, res);

    expect(clientsService.getClientById).toHaveBeenCalledWith("uuid-123");
    expect(clientsService.deleteClient).toHaveBeenCalledWith("uuid-123");

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Client et données liées supprimés avec succès",
    });

    expect(res.status).not.toHaveBeenCalled();
  });

  it("devrait retourner 404 si client non trouvé", async () => {
    clientsService.getClientById.mockResolvedValue(null); // simulate client not found

    await clientController.supprimer(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Client non trouvé",
    });
  });

  it("devrait gérer une erreur serveur", async () => {
    clientsService.getClientById.mockResolvedValue({ id: req.params.uuid });
    clientsService.deleteClient.mockRejectedValue(new Error("Erreur DB")); // simulate failure

    await clientController.supprimer(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Erreur serveur",
    });
  });
});
