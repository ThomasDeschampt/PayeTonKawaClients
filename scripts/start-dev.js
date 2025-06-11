const { execSync } = require('child_process');

function stopDockerServices() {
    console.log("Arrêt des services Docker...");
    try {
        execSync("docker compose down", { stdio: "inherit" });
        console.log("Services Docker arrêtés avec succès");
    } catch (error) {
        console.error("Erreur lors de l'arrêt des services Docker:", error.message);
    }
}

function startDockerServices() {
    console.log("Démarrage des services Docker...");
    try {
        execSync("docker compose up -d", { stdio: "inherit" });
        console.log("Services Docker démarrés avec succès");
    } catch (error) {
        console.error("Erreur lors du démarrage des services Docker:", error.message);
        process.exit(1);
    }
}

// Arrêter puis redémarrer les services
stopDockerServices();
startDockerServices(); 