const { execSync } = require("child_process");

// Détecte si on est dans un conteneur Docker ou CI
const isCI = process.env.CI === "true";
const isDocker = require("fs").existsSync("/.dockerenv");

function runCommand(command) {
  try {
    console.log(`Exécution de la commande: ${command}`);
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    console.error(`❌ Erreur: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

function stopDockerServices() {
  if (isCI || isDocker) {
    console.log(
      "Environnement CI ou Docker détecté : skip docker compose down"
    );
    return;
  }

  console.log("Zrrêt des services Docker existants...");
  try {
    execSync("docker compose down", { stdio: "inherit" });
  } catch {
    console.log("Aucun service Docker en cours d'exécution");
  }
}

function startDockerServices() {
  if (isCI || isDocker) {
    console.log("Environnement CI ou Docker détecté : skip docker compose up");
    return;
  }

  console.log("Démarrage des services Docker...");
  runCommand("docker compose up -d rabbitmq prometheus grafana");

  console.log("Construction du conteneur api-client...");
  runCommand("docker compose build payetonkawaclient");
}

async function main() {
  stopDockerServices();
  startDockerServices();

  console.log("\nServices prêts !");
  console.log("Lancez l'app avec : npm start");
}

main();
