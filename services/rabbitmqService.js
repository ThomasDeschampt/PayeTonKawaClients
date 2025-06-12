const amqp = require('amqplib');

class RabbitMQService {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.queues = {
            clientCreated: 'client.created',
            clientUpdated: 'client.updated',
            clientDeleted: 'client.deleted'
        };
    }

    async connect() {
        try {
            this.connection = await amqp.connect(process.env.RABBITMQ_URL);
            this.channel = await this.connection.createChannel();
            
            await this.channel.assertQueue(this.queues.clientCreated, { durable: true });
            await this.channel.assertQueue(this.queues.clientUpdated, { durable: true });
            await this.channel.assertQueue(this.queues.clientDeleted, { durable: true });

            console.log('Connected to RabbitMQ');
        } catch (error) {
            console.error('Error connecting to RabbitMQ:', error);
            throw error;
        }
    }

    async publishClientCreated(clientData) {
        try {
            await this.channel.sendToQueue(
                this.queues.clientCreated,
                Buffer.from(JSON.stringify(clientData)),
                { persistent: true }
            );
            console.log('Published client created event');
        } catch (error) {
            console.error('Error publishing client created event:', error);
            throw error;
        }
    }

    async publishClientUpdated(clientData) {
        try {
            await this.channel.sendToQueue(
                this.queues.clientUpdated,
                Buffer.from(JSON.stringify(clientData)),
                { persistent: true }
            );
            console.log('Published client updated event');
        } catch (error) {
            console.error('Error publishing client updated event:', error);
            throw error;
        }
    }

    async publishClientDeleted(clientId) {
        try {
            await this.channel.sendToQueue(
                this.queues.clientDeleted,
                Buffer.from(JSON.stringify({ clientId })),
                { persistent: true }
            );
            console.log('Published client deleted event');
        } catch (error) {
            console.error('Error publishing client deleted event:', error);
            throw error;
        }
    }

    async close() {
        try {
            await this.channel.close();
            await this.connection.close();
            console.log('RabbitMQ connection closed');
        } catch (error) {
            console.error('Error closing RabbitMQ connection:', error);
            throw error;
        }
    }
}

module.exports = new RabbitMQService(); 