const clientController = require("../../controllers/clientsController");
const clientsService = require("../../services/clientsService");
const rabbitmqService = require("../../services/rabbitmqService");

jest.mock("../../services/clientsService", () => ({
  getClientById: jest.fn(),
  deleteClient: jest.fn(),
}));

jest.mock("../../services/rabbitmqService", () => ({
  publishClientDeleted: jest.fn().mockResolvedValue(undefined),
}));

describe("supprimer client", () => {
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

  it("devrait supprimer un client et ses données liées avec succès", async () => {
    clientsService.getClientById.mockResolvedValue({ id: req.params.uuid });
    clientsService.deleteClient.mockResolvedValue(true);

    await clientController.supprimer(req, res);

    expect(clientsService.getClientById).toHaveBeenCalledWith("uuid-123");
    expect(clientsService.deleteClient).toHaveBeenCalledWith("uuid-123");
    expect(rabbitmqService.publishClientDeleted).toHaveBeenCalledWith("uuid-123");

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Client et données liées supprimés avec succès",
    });
  });

  it("devrait retourner 404 si client non trouvé", async () => {
    clientsService.getClientById.mockResolvedValue(null);

    await clientController.supprimer(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Client non trouvé",
    });
    expect(clientsService.deleteClient).not.toHaveBeenCalled();
    expect(rabbitmqService.publishClientDeleted).not.toHaveBeenCalled();
  });

  it("devrait gérer une erreur serveur lors de la récupération du client", async () => {
    clientsService.getClientById.mockRejectedValue(new Error("Erreur DB"));

    await clientController.supprimer(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Erreur serveur",
    });
    expect(clientsService.deleteClient).not.toHaveBeenCalled();
    expect(rabbitmqService.publishClientDeleted).not.toHaveBeenCalled();
  });

  it("devrait gérer une erreur serveur lors de la suppression", async () => {
    clientsService.getClientById.mockResolvedValue({ id: req.params.uuid });
    clientsService.deleteClient.mockRejectedValue(new Error("Erreur DB"));

    await clientController.supprimer(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Erreur serveur",
    });
    expect(rabbitmqService.publishClientDeleted).not.toHaveBeenCalled();
  });
});
