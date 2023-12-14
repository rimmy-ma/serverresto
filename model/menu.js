import connectionPromise from '../connexion.js'

export async function getProduit(){
    let connection = await connectionPromise;

    let produit = await connection.all(
        `SELECT * FROM produit`
    );
    return produit;
};