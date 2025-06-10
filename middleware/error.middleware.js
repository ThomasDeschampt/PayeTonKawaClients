const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    if (err.code === 'P2002') {
        return res.status(409).json({
            success: false,
            message: 'Un conflit est survenu avec une ressource existante'
        });
    }

    if (err.code === 'P2025') {
        return res.status(404).json({
            success: false,
            message: 'La ressource demandée n\'existe pas'
        });
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Données invalides',
            errors: err.errors
        });
    }

    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Token invalide'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expiré'
        });
    }

    res.status(500).json({
        success: false,
        message: 'Une erreur est survenue sur le serveur'
    });
};

module.exports = errorHandler; 