module.exports = {
    server: {
        port: process.env.PORT || 3003,
        env: process.env.NODE_ENV || 'development'
    },
    rateLimit: {
        windowMs: 15 * 60 * 1000, 
        max: 100 
    },
    rabbitmq: {
        url: process.env.RABBITMQ_URL || 'amqp://localhost',
        queues: {
            clientCreated: 'client.created',
            clientUpdated: 'client.updated',
            clientDeleted: 'client.deleted',
            produitCreated: 'produit.created',
            produitUpdated: 'produit.updated',
            produitDeleted: 'produit.deleted',
            commandeCreated: 'commande.created',
            commandeUpdated: 'commande.updated',
            commandeDeleted: 'commande.deleted'
        }
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'votre_secret_jwt',
        expiresIn: '1h'
    }
}; 