import connectionPromise from '../connexion.js'
import bcrypt from 'bcrypt'

export async function addUtilisateur(courriel, mot_de_passe, nom){
    const connection = await connectionPromise;
    let hash = await bcrypt.hash(mot_de_passe, 10);

    connection.run(
        `INSERT INTO utilisateur(courriel, mot_de_passe, nom)
        VALUES(?,?,?)`,
        [courriel, hash, nom]
    )

}

export async function getUtilisateurParId(id_utilisateur){
    const connection = await connectionPromise;

    let utilisateur = await connection.get(
        `SELECT * FROM utilisateur
        WHERE id_utilisateur = ?`,
        [id_utilisateur]
    );

    return utilisateur;
}

export async function getUtilisateurParCourriel(courriel){
    const connection = await connectionPromise;

    let utilisateur = await connection.get(
        `SELECT * FROM utilisateur
        WHERE courriel = ?`,
        [courriel]
    );

    return utilisateur;

}