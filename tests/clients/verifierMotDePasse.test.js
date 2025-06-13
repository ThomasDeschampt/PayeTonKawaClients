const clientController = require("../../controllers/clientsController");
const clientsService = require("../../services/clientsService");
const jwt = require('jsonwebtoken');

jest.mock("../../services/clientsService", () => ({
  verifierMotDePasse: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

describe("verifierMotDePasse", () => {
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
    process.env.JWT_SECRET = 'test-secret';
  });

  it("devrait retourner 400 si pseudo ou motDePasse manquent", async () => {
    req.body = { pseudo: "test" }; // motDePasse manquant

    await clientController.verifierMotDePasse(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "pseudo et motDePasse sont requis",
    });
    expect(clientsService.verifierMotDePasse).not.toHaveBeenCalled();
  });

  it("devrait retourner 401 si les identifiants sont incorrects", async () => {
    req.body = {
      pseudo: "client1",
      motDePasse: "wrongpassword",
    };

    clientsService.verifierMotDePasse.mockResolvedValue({
      success: false,
      message: "Identifiants incorrects",
    });

    await clientController.verifierMotDePasse(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Identifiants incorrects",
    });
  });

  it("devrait retourner un token JWT et les données du client si l'authentification réussit", async () => {
    const mockClient = {
      id: "uuid-1",
      pseudo: "client1",
      role: {
        name: "client",
      },
    };

    req.body = {
      pseudo: "client1",
      motDePasse: "correctpassword",
    };

    clientsService.verifierMotDePasse.mockResolvedValue({
      success: true,
      client: mockClient,
    });

    const mockToken = "mock.jwt.token";
    jwt.sign.mockReturnValue(mockToken);

    await clientController.verifierMotDePasse(req, res);

    expect(clientsService.verifierMotDePasse).toHaveBeenCalledWith(
      "client1",
      "correctpassword"
    );

    expect(jwt.sign).toHaveBeenCalledWith(
      {
        id: mockClient.id,
        pseudo: mockClient.pseudo,
        role: mockClient.role.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Authentification réussie",
      token: mockToken,
      data: mockClient,
    });
  });

  it("devrait gérer une erreur serveur", async () => {
    req.body = {
      pseudo: "client1",
      motDePasse: "password123",
    };

    clientsService.verifierMotDePasse.mockRejectedValue(new Error("Erreur DB"));

    await clientController.verifierMotDePasse(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Erreur serveur",
    });
  });
}); 