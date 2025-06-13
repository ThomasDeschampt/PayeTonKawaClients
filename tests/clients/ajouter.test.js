const clientController = require("../../controllers/clientsController");
const clientsService = require("../../services/clientsService");
const rabbitmqService = require("../../services/rabbitmqService");

jest.mock("../../services/clientsService", () => ({
  createClient: jest.fn(),
}));

jest.mock("../../services/rabbitmqService", () => ({
  publishClientCreated: jest.fn().mockResolvedValue(undefined),
}));

describe("ajouter client", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it("devrait retourner 400 si pseudo ou motDePasse manquent", async () => {
    req.body = { pseudo: "test" }; // motDePasse manquant

    await clientController.ajouter(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "pseudo, motDePasse sont requis",
    });
    expect(clientsService.createClient).not.toHaveBeenCalled();
    expect(rabbitmqService.publishClientCreated).not.toHaveBeenCalled();
  });

  it("devrait appeler createClient et retourner le client créé", async () => {
    req.body = {
      pseudo: "client1",
      motDePasse: "password123",
      personne: { nom: "Dupont", prenom: "Jean" },
      entreprise: { nom: "EntrepriseX" },
      addresses: [{ rue: "1 rue A", ville: "Paris" }],
    };

    const createdClient = {
      id: "uuid-1",
      pseudo: "client1",
      motDePasse: "hashedpassword",
      roleId: 1, // car le contrôleur force roleIdDefaut = 1
      personne: req.body.personne,
      entreprise: req.body.entreprise,
      addresses: req.body.addresses,
    };

    clientsService.createClient.mockResolvedValue(createdClient);

    await clientController.ajouter(req, res);

    expect(clientsService.createClient).toHaveBeenCalledWith({
      pseudo: req.body.pseudo,
      motDePasse: req.body.motDePasse,
      roleIdDefaut: 1,
      personne: req.body.personne,
      entreprise: req.body.entreprise,
      addresses: req.body.addresses,
    });

    expect(rabbitmqService.publishClientCreated).toHaveBeenCalledWith(createdClient);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: createdClient,
      message: "Client créé avec succès",
    });
  });

  it("devrait gérer une erreur serveur", async () => {
    req.body = {
      pseudo: "client1",
      motDePasse: "password123",
    };

    clientsService.createClient.mockRejectedValue(new Error("Erreur DB"));

    await clientController.ajouter(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Erreur serveur",
    });
    expect(rabbitmqService.publishClientCreated).not.toHaveBeenCalled();
  });
});
