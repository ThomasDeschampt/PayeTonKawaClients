-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pseudo" VARCHAR NOT NULL,
    "motDePasse" VARCHAR NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" SERIAL NOT NULL,
    "codePostal" INTEGER NOT NULL,
    "adresse" VARCHAR NOT NULL,
    "complement" VARCHAR,
    "clientId" TEXT NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entreprise_client_details" (
    "id" SERIAL NOT NULL,
    "nomEntreprise" VARCHAR NOT NULL,
    "siret" VARCHAR NOT NULL,
    "clientId" TEXT NOT NULL,

    CONSTRAINT "entreprise_client_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personne_client_details" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR NOT NULL,
    "prenom" VARCHAR NOT NULL,
    "mail" VARCHAR NOT NULL,
    "telephone" VARCHAR NOT NULL,
    "dateNaissance" TIMESTAMPTZ(6) NOT NULL,
    "clientId" TEXT NOT NULL,

    CONSTRAINT "personne_client_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_pseudo_key" ON "users"("pseudo");

-- CreateIndex
CREATE INDEX "addresses_clientId_idx" ON "addresses"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "entreprise_client_details_siret_key" ON "entreprise_client_details"("siret");

-- CreateIndex
CREATE UNIQUE INDEX "entreprise_client_details_clientId_key" ON "entreprise_client_details"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "personne_client_details_mail_key" ON "personne_client_details"("mail");

-- CreateIndex
CREATE UNIQUE INDEX "personne_client_details_clientId_key" ON "personne_client_details"("clientId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entreprise_client_details" ADD CONSTRAINT "entreprise_client_details_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personne_client_details" ADD CONSTRAINT "personne_client_details_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
