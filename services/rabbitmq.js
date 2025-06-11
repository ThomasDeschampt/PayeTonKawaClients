const amqp = require('amqplib');
const config = require('../config');
require('dotenv').config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:4003';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

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
module.exports = rabbitmq; 