# PayeTonKawaClients

## Lancement du projet avec Docker

Assurez-vous d'avoir Docker et Docker Compose installés sur votre machine.

Dans le dossier du projet, lancez :

```bash
docker-compose up -d
```

## Services et ports utilisés

- **API Clients** : [http://localhost:3003](http://localhost:3003)
- **RabbitMQ (service)** : `localhost:5673`
- **RabbitMQ (interface web)** : [http://localhost:15673](http://localhost:15673)
  - Utilisateur : `admin`
  - Mot de passe : `admin`
- **Prometheus** : [http://localhost:9091](http://localhost:9091)
- **Grafana** : [http://localhost:7071](http://localhost:7071)
  - Utilisateur : `admin`
  - Mot de passe : `admin`

## Arrêter les conteneurs

```bash
docker-compose down
```

## Remarques

- Les ports ont été adaptés pour éviter les conflits avec d'autres services similaires.
- Si un port est déjà utilisé, modifiez-le dans le fichier `docker-compose.yml`.

