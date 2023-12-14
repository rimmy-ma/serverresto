import connectionPromise from '../connexion.js'
//retourne les commandes
export async function getOrders(){
    let connection = await connectionPromise;

    let orders = await connection.all(
        `SELECT * FROM commande`
    );
    return orders;
};
//Ajoute une commande dans le serv
export async function addOrder(id_commande, id_utilisateur) {
    let connection = await connectionPromise;

    let result = await connection.run(
        `INSERT INTO commande(id_commande, id_utilisateur, id_etat_commande, date)
		VALUES(?,?,2,CURRENT_TIMESTAMP);`,
        [id_commande, id_utilisateur]
    );
    return;
}
//change l'etat du la commande, ne fonctionne pas pour linstant.
export async function changerEtat(id_commande) {
    let connection = await connectionPromise;

    await connection.run(
        `UPDATE commande
        SET id_etat_commande = id_etat_commande + 1
        WHERE id_commande = ?`,
        [id_commande]
    )
}
//changement d'etat utiliser quand l'etat est deja a un id de 2 pour faire un bouton qui switch entre les meme 3 etat de commande.
export async function changerEtat2(id_commande) {
    let connection = await connectionPromise;

    await connection.run(
        `UPDATE commande
        SET id_etat_commande = 2
        WHERE id_commande = ?`,
        [id_commande]
    )
}
//sauvegarde le panier lors qu'il est commander.
export async function saveOrder(id_commande ,panier_sauvegarde) {
    let connection = await connectionPromise;

    let result = await connection.run(
        `INSERT INTO sauvegarde_commande(id_commande, panier_sauvegarde)
		VALUES(?,?);`,
        [id_commande, panier_sauvegarde]
    );
    return;
}

export async function getSaveOrders(){
    let connection = await connectionPromise;

    let saveOrders = await connection.all(
        `SELECT * FROM sauvegarde_commande`
    );
    return saveOrders;
}
//join entre les panier sauvegardé et les commande deja passé.
export async function joinSavePanierOrders(){
    let connection = await connectionPromise;

    let orders = await connection.all(
        `SELECT * FROM commande
        INNER JOIN sauvegarde_commande
        ON commande.id_commande = sauvegarde_commande.id_commande;`
    );
    return orders;
};

export async function joinSavePanierOrdersClient(id_utilisateur){
    let connection = await connectionPromise;

    let orders = await connection.all(
        `SELECT * FROM commande
        INNER JOIN sauvegarde_commande
        ON commande.id_commande = sauvegarde_commande.id_commande
        WHERE commande.id_utilisateur = ?;`,
        [id_utilisateur]
    );
    return orders;
};
