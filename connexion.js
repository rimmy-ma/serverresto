import { existsSync } from 'fs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

/**
 * Constante indiquant si la base de données existe au démarrage du serveur
 * ou non.
 */
const IS_NEW = !existsSync(process.env.DB_FILE)

/**
 * Crée une base de données par défaut pour le serveur. Des données fictives
 * pour tester le serveur y ont été ajouté.
 */
const createDatabase = async (connectionPromise) => {
    let connection = await connectionPromise;

    await connection.exec(
        `CREATE TABLE type_utilisateur(
			id_type_utilisateur INTEGER PRIMARY KEY,
			nom TEXT NOT NULL UNIQUE
		);
		
		CREATE TABLE etat_commande(
			id_etat_commande INTEGER PRIMARY KEY,
			nom TEXT NOT NULL
		);
		
		CREATE TABLE produit(
			id_produit INTEGER PRIMARY KEY,
			nom TEXT,
			description TEXT,
			chemin_image TEXT,
			prix REAL
		);
		
		CREATE TABLE utilisateur(
			id_utilisateur INTEGER PRIMARY KEY,
			id_type_utilisateur INTEGER DEFAULT 1,
			courriel TEXT UNIQUE,
			mot_de_passe TEXT,
			nom TEXT,
			FOREIGN KEY(id_type_utilisateur)
			REFERENCES type_utilisateur(id_type_utilisateur)
		);
		
		CREATE TABLE commande(
			id_commande INTEGER PRIMARY KEY,
			id_utilisateur INTEGER,
			id_etat_commande INTEGER,
			date INTEGER,
			FOREIGN KEY(id_utilisateur)
			REFERENCES utilisateur(id_utilisateur),
			FOREIGN KEY(id_etat_commande)
			REFERENCES etat_commande(id_etat_commande)
		);
		
		CREATE TABLE commande_produit(
			id_commande INTEGER,
			id_produit INTEGER,
			quantite INTEGER,
			PRIMARY KEY(id_commande, id_produit),
			FOREIGN KEY(id_commande)
			REFERENCES commande(id_commande),
			FOREIGN KEY(id_produit)
			REFERENCES produit(id_produit)
		);
		CREATE TABLE sauvegarde_commande(
			id_commande INTEGER,
			panier_sauvegarde TEXT,
			PRIMARY KEY(id_commande),
			FOREIGN KEY(id_commande)
			REFERENCES commande(id_commande)
		);
		
		INSERT INTO type_utilisateur(nom) VALUES('client');
		INSERT INTO type_utilisateur(nom) VALUES('administrateur');
		
		INSERT INTO etat_commande(id_etat_commande, nom) VALUES(1, 'panier');
		INSERT INTO etat_commande(id_etat_commande, nom) VALUES(2, 'cuisine');
		INSERT INTO etat_commande(id_etat_commande, nom) VALUES(3, 'livraison');
		INSERT INTO etat_commande(id_etat_commande, nom) VALUES(4, 'terminée');
		
		INSERT INTO utilisateur(id_utilisateur, courriel, mot_de_passe, nom)
		VALUES(1, 'test@test.com', 'Test1234', 'Test');

		INSERT INTO produit(id_produit , nom, description, chemin_image, prix)
		VALUES(1, 'Pizza végétarienne', 'Champignons, poivrons vert, tomates, oignons', '/img/végéPizza.jpg', 14.99);
		INSERT INTO produit(id_produit , nom, description, chemin_image, prix)
		VALUES(2, 'Pizza Carnivore', 'Double portion de pepperoni, bacon, saucisse italienne', '/img/meat-lovers.jpg', 18.99);
		INSERT INTO produit(id_produit , nom, description, chemin_image, prix)
		VALUES(3, 'Pizza Hawaïenne', 'Poulet, ananas', '/img/pizzaHawa.webp', 16.99);
		INSERT INTO produit(id_produit , nom, description, chemin_image, prix)
		VALUES(4, 'Pizza canadienne', 'Pepperoni, bacon, olives vertes', '/img/imagep.jpg', 16.99);
		INSERT INTO produit(id_produit , nom, description, chemin_image, prix)
		VALUES(5, 'Pizza Margherita', 'tomates, mozzarella, basilic frais, sel, huile d''olive', '/img/Italian Pizza.jpg.jpeg', 14.99);
		INSERT INTO produit(id_produit , nom, description, chemin_image, prix)
		VALUES(6, 'Boîte de 6 beignes', 'Boîte de beigne mélangé.' ,'/img/dessert.jpeg', 8.99);
		INSERT INTO produit(id_produit , nom, description, chemin_image, prix)
		VALUES(7, 'Pepsi', 'Bouteille de 2L' ,'/img/pepsi.png', 3.99);
		INSERT INTO produit(id_produit , nom, description, chemin_image, prix)
		VALUES(8, '7up', 'Bouteille de 2L' ,'/img/7up.webp', 3.99);
		INSERT INTO produit(id_produit , nom, description, chemin_image, prix)
		VALUES(9, 'Lait frappé', 'Fraise, Banane','/img/milkshake.jpeg', 4.99);`
		
    );

    return connection;
}

// Base de données dans un fichier
let connectionPromise = open({
    filename: process.env.DB_FILE,
    driver: sqlite3.Database
});

// Si le fichier de base de données n'existe pas, on crée la base de données
// et on y insère des données fictive de test.
if (IS_NEW) {
    connectionPromise = createDatabase(connectionPromise);
}

export default connectionPromise;