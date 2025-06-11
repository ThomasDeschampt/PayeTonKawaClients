const amqp = require('amqplib');
const config = require('../config');
require('dotenv').config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:4003';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const EXCHANGES = {
    COMMAND: 'command.exchange',
    PRODUCT: 'product.exchange',
    CLIENT: 'client.exchange'
};

const QUEUES = {
    // Queues pour les produits
    PRODUCT_CREATED: 'product.created',
    PRODUCT_UPDATED: 'product.updated',
    PRODUCT_DELETED: 'product.deleted',
    
    // Queues pour les commandes
    ORDER_CREATED: 'order.created',
    ORDER_UPDATED: 'order.updated',
    ORDER_DELETED: 'order.deleted',
    
    // Queues pour les clients
    CLIENT_CREATED: 'client.created',
    CLIENT_UPDATED: 'client.updated',
    CLIENT_DELETED: 'client.deleted'
};

class RabbitMQService {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.queues = {
            produits: 'queue_produits',
            commandes: 'queue_commandes',
            main: 'queue_main'
        };
        this.isConnecting = false;
        console.log('Service RabbitMQ initialisé avec URL:', RABBITMQ_URL);
    }

    async connect() {
        try {
            console.log('Tentative de connexion à RabbitMQ avec URL:', RABBITMQ_URL);
            this.connection = await amqp.connect(RABBITMQ_URL);
            this.channel = await this.connection.createChannel();
            console.log('Connecté à RabbitMQ');
            return true;
        } catch (error) {
            console.error('Erreur de connexion à RabbitMQ:', error);
            return false;
        }
    }

    async publishMessage(queue, message) {
        if (!this.channel) {
            throw new Error('Channel RabbitMQ non initialisé');
        }
        try {
            await this.channel.assertQueue(queue, { durable: true });
            this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
            console.log(`Message publié dans la queue ${queue}:`, message);
        } catch (error) {
            console.error('Erreur lors de la publication du message:', error);
            throw error;
        }
    }

    async listenToQueue(queue, callback) {
        if (!this.channel) {
            throw new Error('Channel RabbitMQ non initialisé');
        }
        try {
            await this.channel.assertQueue(queue, { durable: true });
            this.channel.consume(queue, (msg) => {
                if (msg !== null) {
                    const content = JSON.parse(msg.content.toString());
                    console.log(`Message reçu de la queue ${queue}:`, content);
                    callback(content);
                    this.channel.ack(msg);
                }
            });
            console.log(`Écoute de la queue ${queue} démarrée`);
        } catch (error) {
            console.error('Erreur lors de l\'écoute de la queue:', error);
            throw error;
        }
    }

    async close() {
        try {
            if (this.channel) {
                await this.channel.close();
            }
            if (this.connection) {
                await this.connection.close();
            }
            console.log('Connexion RabbitMQ fermée');
        } catch (error) {
            console.error('Erreur lors de la fermeture de la connexion RabbitMQ:', error);
            throw error;
        }
    }
}

const rabbitmq = new RabbitMQService();

async function initializeRabbitMQ() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        // Déclaration des échanges
        await channel.assertExchange(EXCHANGES.COMMAND, 'topic', { durable: true });
        await channel.assertExchange(EXCHANGES.PRODUCT, 'topic', { durable: true });
        await channel.assertExchange(EXCHANGES.CLIENT, 'topic', { durable: true });

        // Déclaration des queues
        for (const queue of Object.values(QUEUES)) {
            await channel.assertQueue(queue, { durable: true });
        }

        // Binding des queues aux échanges
        // Produits
        await channel.bindQueue(QUEUES.PRODUCT_CREATED, EXCHANGES.PRODUCT, 'product.created');
        await channel.bindQueue(QUEUES.PRODUCT_UPDATED, EXCHANGES.PRODUCT, 'product.updated');
        await channel.bindQueue(QUEUES.PRODUCT_DELETED, EXCHANGES.PRODUCT, 'product.deleted');

        // Commandes
        await channel.bindQueue(QUEUES.ORDER_CREATED, EXCHANGES.COMMAND, 'order.created');
        await channel.bindQueue(QUEUES.ORDER_UPDATED, EXCHANGES.COMMAND, 'order.updated');
        await channel.bindQueue(QUEUES.ORDER_DELETED, EXCHANGES.COMMAND, 'order.deleted');

        // Clients
        await channel.bindQueue(QUEUES.CLIENT_CREATED, EXCHANGES.CLIENT, 'client.created');
        await channel.bindQueue(QUEUES.CLIENT_UPDATED, EXCHANGES.CLIENT, 'client.updated');
        await channel.bindQueue(QUEUES.CLIENT_DELETED, EXCHANGES.CLIENT, 'client.deleted');

        return { connection, channel };
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de RabbitMQ:', error);
        throw error;
    }
}

// Fonction pour publier un message
async function publishMessage(channel, exchange, routingKey, message) {
    try {
        await channel.publish(
            exchange,
            routingKey,
            Buffer.from(JSON.stringify(message)),
            { persistent: true }
        );
    } catch (error) {
        console.error('Erreur lors de la publication du message:', error);
        throw error;
    }
}

// Fonction pour consommer des messages
async function consumeMessages(channel, queue, callback) {
    try {
        await channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());
                await callback(content);
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error('Erreur lors de la consommation des messages:', error);
        throw error;
    }
}

module.exports = {
    initializeRabbitMQ,
    publishMessage,
    consumeMessages,
    EXCHANGES,
    QUEUES
}; 