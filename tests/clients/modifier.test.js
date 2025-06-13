const clientController = require("../../controllers/clientsController");
const clientsService = require("../../services/clientsService");
const rabbitmqService = require("../../services/rabbitmqService");

// Mock du service
jest.mock("../../services/clientsService", () => ({
  getClientById: jest.fn(),
  updateClient: jest.fn(),
}));

jest.mock("../../services/rabbitmqService", () => ({
  publishClientUpdated: jest.fn().mockResolvedValue(undefined),
}));

describe("modifier client", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { uuid: "uuid-123" },
      body: {
        pseudo: "nouveauPseudo",
        motDePasse: "newpassword",
        roleId: "3",
      },
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  it("devrait modifier un client avec succès", async () => {
    clientsService.getClientById.mockResolvedValue({ id: req.params.uuid });

    const updatedClient = {
      id: req.params.uuid,
      pseudo: "nouveauPseudo",
      motDePasse: "hashedPassword", // on fait comme si le hash est fait dans le service
      roleId: 3,
    };

    clientsService.updateClient.mockResolvedValue(updatedClient);

    await clientController.modifier(req, res);

    expect(clientsService.getClientById).toHaveBeenCalledWith("uuid-123");

    expect(clientsService.updateClient).toHaveBeenCalledWith("uuid-123", {
      pseudo: "nouveauPseudo",
      motDePasse: "newpassword",
      roleId: "3",
    });

    expect(rabbitmqService.publishClientUpdated).toHaveBeenCalledWith(updatedClient);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Client mis à jour avec succès",
      data: updatedClient,
    });

    expect(res.status).not.toHaveBeenCalled(); // réponse OK = 200 par défaut
  });

  it("devrait retourner 404 si client non trouvé", async () => {
    clientsService.getClientById.mockResolvedValue(null);

    await clientController.modifier(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Client non trouvé",
    });
  });

  it("devrait gérer une erreur serveur lors de la récupération du client", async () => {
    clientsService.getClientById.mockRejectedValue(new Error("Erreur DB"));

    await clientController.modifier(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Erreur serveur",
    });
    expect(clientsService.updateClient).not.toHaveBeenCalled();
    expect(rabbitmqService.publishClientUpdated).not.toHaveBeenCalled();
  });

  it("devrait gérer une erreur serveur lors de la mise à jour", async () => {
    clientsService.getClientById.mockResolvedValue({ id: req.params.uuid });
    clientsService.updateClient.mockRejectedValue(new Error("Erreur DB"));

    await clientController.modifier(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Erreur serveur",
    });
    expect(rabbitmqService.publishClientUpdated).not.toHaveBeenCalled();
  });
});
