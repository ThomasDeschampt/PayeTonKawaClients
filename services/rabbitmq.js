const amqp = require('amqplib');
require('dotenv').config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';
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
        if (this.isConnecting) {
            console.log('Connexion déjà en cours...');
            return;
        }

        this.isConnecting = true;
        let retries = 0;

        while (retries < MAX_RETRIES) {
            try {
                console.log(`Tentative de connexion à RabbitMQ (${retries + 1}/${MAX_RETRIES})...`);
                this.connection = await amqp.connect(RABBITMQ_URL);
                this.channel = await this.connection.createChannel();

                // Déclaration des queues
                await this.channel.assertQueue(this.queues.produits, { durable: true });
                await this.channel.assertQueue(this.queues.commandes, { durable: true });
                await this.channel.assertQueue(this.queues.main, { durable: true });

                console.log('Connecté à RabbitMQ avec succès');
                this.isConnecting = false;
                return;
            } catch (error) {
                retries++;
                console.error(`Échec de la connexion (tentative ${retries}/${MAX_RETRIES}):`, error.message);
                
                if (retries === MAX_RETRIES) {
                    console.error('Impossible de se connecter à RabbitMQ après plusieurs tentatives');
                    this.isConnecting = false;
                    throw error;
                }
                
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            }
        }
    }

    async listenToProduits(callback) {
        try {
            await this.channel.consume(this.queues.produits, (msg) => {
                if (msg !== null) {
                    const content = JSON.parse(msg.content.toString());
                    console.log('Message reçu du service Produits:', content);
                    callback(content);
                    this.channel.ack(msg);
                }
            });
            console.log('Écoute du service Produits activée');
        } catch (error) {
            console.error('Erreur lors de l\'écoute du service Produits:', error);
            throw error;
        }
    }

    async listenToCommandes(callback) {
        try {
            await this.channel.consume(this.queues.commandes, (msg) => {
                if (msg !== null) {
                    const content = JSON.parse(msg.content.toString());
                    console.log('Message reçu du service Commandes:', content);
                    callback(content);
                    this.channel.ack(msg);
                }
            });
            console.log('Écoute du service Commandes activée');
        } catch (error) {
            console.error('Erreur lors de l\'écoute du service Commandes:', error);
            throw error;
        }
    }

    async listenToMain(callback) {
        try {
            await this.channel.consume(this.queues.main, (msg) => {
                if (msg !== null) {
                    const content = JSON.parse(msg.content.toString());
                    console.log('Message reçu du service Principal:', content);
                    callback(content);
                    this.channel.ack(msg);
                }
            });
            console.log('Écoute du service Principal activée');
        } catch (error) {
            console.error('Erreur lors de l\'écoute du service Principal:', error);
            throw error;
        }
    }

    async publishToQueue(queueName, message) {
        try {
            const queue = this.queues[queueName];
            if (!queue) {
                throw new Error(`Queue ${queueName} non trouvée`);
            }
            await this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
            console.log(`Message publié dans la queue ${queueName}:`, message);
        } catch (error) {
            console.error(`Erreur lors de la publication dans la queue ${queueName}:`, error);
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

module.exports = new RabbitMQService(); 