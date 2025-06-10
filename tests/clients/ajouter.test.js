const clientController = require("../../controllers/clientsController");
const clientsService = require("../../services/clientsService");

jest.mock("../../services/clientsService", () => ({
  createClient: jest.fn(),
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

  it("devrait retourner 400 si pseudo, motDePasse ou roleId manquent", async () => {
    req.body = { pseudo: "test" }; // motDePasse et roleId manquants

    await clientController.ajouter(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "pseudo, motDePasse et roleId sont requis",
    });
    expect(clientsService.createClient).not.toHaveBeenCalled();
  });

  it("devrait appeler createClient et retourner le client créé", async () => {
    req.body = {
      pseudo: "client1",
      motDePasse: "password123",
      roleId: "2",
      personne: { nom: "Dupont", prenom: "Jean" },
      entreprise: { nom: "EntrepriseX" },
      addresses: [{ rue: "1 rue A", ville: "Paris" }],
    };

    const createdClient = {
      id: "uuid-1",
      pseudo: "client1",
      motDePasse: "hashedpassword",
      roleId: 2,
      personne: req.body.personne,
      entreprise: req.body.entreprise,
      addresses: req.body.addresses,
    };

    clientsService.createClient.mockResolvedValue(createdClient);

    await clientController.ajouter(req, res);

    expect(clientsService.createClient).toHaveBeenCalledWith(req.body);
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
      roleId: "2",
    };

    clientsService.createClient.mockRejectedValue(new Error("Erreur DB"));

    await clientController.ajouter(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Erreur serveur",
    });
  });
});
