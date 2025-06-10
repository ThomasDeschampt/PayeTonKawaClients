const express = require("express");
const cors = require("cors");
const rateLimit = require('express-rate-limit');
const setupSwagger = require("./swagger");
const { PrismaClient } = require("@prisma/client");
const rabbitmq = require('./services/rabbitmq');
const { metricsMiddleware, metricsRoute } = require('./middleware/metrics');
const errorHandler = require('./middleware/error.middleware');
const config = require('./config');
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();

console.log('Configuration RabbitMQ:', config.rabbitmq.url);

const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
        success: false,
        message: 'Trop de requêtes depuis cette IP, réessayez dans 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(metricsMiddleware);
app.use(limiter);
app.use(cors());
app.use(express.json());
app.use("/api/clients", require("./routes/clients"));

app.get('/metrics', metricsRoute);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

setupSwagger(app);

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route non trouvée'
    });
});

app.use(errorHandler);

async function initializeRabbitMQ() {
    try {
        console.log('Tentative de connexion à RabbitMQ avec URL:', config.rabbitmq.url);
        const connected = await rabbitmq.connect();
        if (!connected) {
            console.error('Impossible de se connecter à RabbitMQ');
            return;
        }

        await rabbitmq.listenToQueue(config.rabbitmq.queues.produitCreated, (message) => {
            console.log('Nouveau produit créé:', message);
        });

        await rabbitmq.listenToQueue(config.rabbitmq.queues.produitUpdated, (message) => {
            console.log('Produit mis à jour:', message);
        });

        await rabbitmq.listenToQueue(config.rabbitmq.queues.produitDeleted, (message) => {
            console.log('Produit supprimé:', message);
        });

        await rabbitmq.listenToQueue(config.rabbitmq.queues.commandeCreated, (message) => {
            console.log('Nouvelle commande créée:', message);
        });

        await rabbitmq.listenToQueue(config.rabbitmq.queues.commandeUpdated, (message) => {
            console.log('Commande mise à jour:', message);
        });

        await rabbitmq.listenToQueue(config.rabbitmq.queues.commandeDeleted, (message) => {
            console.log('Commande supprimée:', message);
        });

        console.log('RabbitMQ initialisé avec succès');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de RabbitMQ:', error);
    }
}

const server = app.listen(config.server.port, async () => {
    console.log(`Serveur démarré sur le port ${config.server.port}`);
    console.log(`API disponible sur http://localhost:${config.server.port}/api`);
    console.log('Protection DDoS activée (100 req/15min par IP)');
    console.log('Métriques Prometheus disponibles sur /metrics');

    await initializeRabbitMQ();
});

process.on('SIGTERM', async () => {
    console.log('Arrêt du serveur...');
    server.close(async () => {
        await prisma.$disconnect();
        await rabbitmq.close();
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('Arrêt du serveur...');
    server.close(async () => {
        await prisma.$disconnect();
        await rabbitmq.close();
        process.exit(0);
    });
});
