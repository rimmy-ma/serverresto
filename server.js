// Aller chercher les configurations de l'application
import 'dotenv/config';

// Importer les fichiers et librairies
import https from 'node:https'
import { readFile } from 'node:fs/promises'
import express, { json, urlencoded } from 'express';
import expressHandlebars from 'express-handlebars';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import session from 'express-session';
import memorystore from 'memorystore';
import passport from 'passport';
import cspOption from './csp-options.js'
import {isCourrielValide, isMotPasseValide} from './validation.js'
import {addUtilisateur, getUtilisateurParCourriel, getUtilisateurParId} from './model/utilisateur.js'
import {getOrder, incrItem, addItem, clearOrder, reduireQuantiteItem, retirerItem, bonIdCommande, joinPanierMenu, beauJoinPanierMenu} from './model/order.js'
import {getOrders, addOrder, changerEtat, changerEtat2, saveOrder, getSaveOrders, joinSavePanierOrders, joinSavePanierOrdersClient} from './model/orders.js'
import {getProduit} from './model/menu.js'
import './authentification.js';
import middlewareSse from './middleware-sse.js'

//Creation de la basse de donnee session
const MemoryStore = memorystore(session);

// Création du serveur
const app = express();
app.engine('handlebars', expressHandlebars());
app.set('view engine', 'handlebars');

// Ajout de middlewares
app.use(helmet(cspOption));
app.use(compression());
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(session({
    cookie: { maxAge: 3600000 },
    name: process.env.npm_package_name,
    store: new MemoryStore({ checkPeriod: 3600000 }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));
app.use(middlewareSse());

// Ajouter les routes ici ...
app.get('/', (request, response) => {
    response.render('accueil', {
        title: 'Le Gourmet Pizzeria',
        styles:['/css/normalize.css','https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css','/css/style.css'],
        pageAccueil:true,
        user: request.user,
        admin: request.user && request.user.id_type_utilisateur === 2
    });
});
app.get('/menu', async (request, response) => {
    response.render('menu', {
        title: 'Menu de la Pizzeria',
        styles:['/css/normalize.css','https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css','/css/style.css'],
        scripts:['/js/menu.js'],
        pageMenu:true,
        produit: await getProduit(),
        user: request.user,
        admin: request.user && request.user.id_type_utilisateur === 2
    });
});
app.get('/order', async (request, response) => {
    response.render('order', {
        title: 'Revision du Panier',
        styles:['/css/normalize.css','https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css','/css/style.css'],
        scripts:['/js/order.js'],
        pageOrder: true,
        produit: await getProduit(),
        order: await joinPanierMenu(),
        user: request.user,
        admin: request.user && request.user.id_type_utilisateur === 2
    });
});
app.get('/ordersCLient', async (request, response) => {
    if(!request.user){
        return response.status(401).end(); 
    }
    response.render('ordersClient', {
        title: 'Suivi Mes Commandes',
        styles:['/css/normalize.css','https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css','/css/style.css'],
        scripts:['/js/orders.js'],
        pageOrders:true,
        orders: await joinSavePanierOrdersClient(request.user.id_utilisateur),
        user: request.user,
        admin: request.user && request.user.id_type_utilisateur === 2
    });
});
app.get('/orders', async (request, response) => {
    response.render('orders', {
        title: 'Suivi des Commandes',
        styles:['/css/normalize.css','https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css','/css/style.css'],
        scripts:['/js/orders.js'],
        pageOrders:true,
        orders: await joinSavePanierOrders(),
        user: request.user,
        admin: request.user && request.user.id_type_utilisateur === 2
    });
});
app.get('/inscription', async (request, response) => {
    response.render('inscription', {
        title: 'Inscription',
        styles:['/css/normalize.css','https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css','/css/style.css','/css/inscriptionEtConnexion.css'],
        scripts:['/js/inscription.js'],
        pageInscription:true,
        user: request.user,
        admin: request.user && request.user.id_type_utilisateur === 2
    });
});
app.get('/connexion', async (request, response) => {
    response.render('connexion', {
        title: 'Connexion',
        styles:['/css/normalize.css','https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css','/css/style.css','/css/inscriptionEtConnexion.css'],
        scripts:['/js/connexion.js'],
        pageConnexion:true,
        user: request.user,
        admin: request.user && request.user.id_type_utilisateur === 2
    });
});

app.route('/api/order')
    .get(async (request, response) => {
        // Lister le panier
        let order = await getOrder();
        response.status(200).json(order);
    })
    .post(async (request, response) => {
        //verification pour voir si user connecter
        if(!request.user){
            return response.status(401).end(); 
        }
        // Ajouter un article
        await addItem(request.body.id_produit);
        response.sendStatus(201);
    })
    .delete(async (request, response) => {
        if(!request.user){
            return response.status(401).end(); 
        }
        // Vider le panier
        await clearOrder();
        response.sendStatus(200);
    })
    .patch(async (request, response) => {
        if(!request.user){
            return response.status(401).end(); 
        }
        //reduire la quantite d'un article de 1
        await reduireQuantiteItem(request.body.id_produit);
        response.sendStatus(200);
    });

app.route('/api/orders')
    .get(async (request, response) => {
        // Lister les commandes
        let orders = await getOrders();
        response.status(200).json(orders);
    })
    .post(async (request, response) => {
        if(!request.user){
            return response.status(401).end(); 
        }
        // Ajouter une commande et l'id de l'utilisateur
        await addOrder(request.body.id_commande, request.user.id_utilisateur, request.body.panier_sauvegarde);
        //modifie la page commande pour tout les uti connnecté lors de l'ajout d'une commande au serveur.
        response.pushJson({
            id_commande: request.body.id_commande,
            id_utilisateur: request.user.id_utilisateur,
            panier_sauvegarde: request.body.panier_sauvegarde
        }, 'add-new-order');
        response.status(201).end();
        
    })
    .patch(async (request, response) => {
        if(!request.user){
            return response.status(401).end(); 
        }
        if(request.user.id_type_utilisateur !== 2) {
            return response.status(403).end();
        }
        //Change l'etat d'une commande
        await changerEtat(request.body.id_commande);

        //modifie la page commande pour tout les uti connnecté lors de quand changement detat commande.
        response.pushJson({
            id_commande: request.body.id_commande
        }, 'changement-etat');
        response.sendStatus(200);
    });

app.delete('/api/itemOrder', async (request, response) => {
    if(!request.user){
        return response.status(401).end(); 
    }
     // retire un article
     await retirerItem(request.body.id_produit);
     response.sendStatus(200);
});
app.patch('/api/itemOrder', async (request, response) => {
    if(!request.user){
        return response.status(401).end(); 
    }
    // incr quantite du produit
    await incrItem(request.body.id_produit);
    response.sendStatus(200);
});
app.get('/api/produit',async (request, response) => {
    // Lister le menu
    let order = await getProduit();
    response.status(200).json(order);
})
app.patch('/api/bonIdCommande',async (request, response) => {
    // Lister le menu
    await bonIdCommande(request.body.id_commande);
    response.sendStatus(200);
})
app.patch('/api/etatCuisine',async (request, response) => {
    if(!request.user){
        return response.status(401).end(); 
    }
    if(request.user.id_type_utilisateur !== 2) {
        return response.status(403).end();
    }
    // change letat de la cuisine a 2 lorsque la valeur est a 4
    await changerEtat2(request.body.id_commande);
    //modifie la page commande pour tout les uti connnecté lors de quand changement detat commande.
    response.pushJson({
        id_commande: request.body.id_commande
    }, 'changement-etat-val-4');
    response.sendStatus(200);
})
app.get('/api/menuPanier',async (request, response) => {
    // Lister le menu
    let order = await joinPanierMenu();
    response.status(200).json(order);
})
app.post('/api/savePanier/:id_commande', async (request, response) => {
    if(!request.user){
        return response.status(401).end(); 
    }
    // Ajouter une commande dans la sauvegarde
    await saveOrder(request.params.id_commande, request.body.panier_sauvegarde);
    response.sendStatus(200);
})
app.get('/api/savePanier', async (request, response) => {
    // Liste panier sauvegarder
    let saveOrders = await getSaveOrders();
    response.status(200).json(saveOrders);
})
app.get('/api/beauPanier', async (request, response) => {
    // Liste panier sauvegarder
    let beauPanier = await beauJoinPanierMenu();
    response.status(200).json(beauPanier);
})

app.post('/api/inscription', async (request, response, next) => {
    if(isCourrielValide(request.body.courriel) &&
       isMotPasseValide(request.body.mot_de_passe)) {
        console.log("Tentative d'insertion avec le courriel :", request.body.courriel);
try {
    await sequelize.transaction(async (t) => {
        await addUtilisateur(
            request.body.courriel,
            request.body.mot_de_passe,
            request.body.nom,
            { transaction: t }
        );
    });
    console.log("Utilisateur inséré avec succès");
    response.status(201).end();
} catch (error) {
    console.error("Erreur lors de l'insertion :", error);
    if (error.code === 'SQLITE_CONSTRAINT') {
        response.status(409).end();
    } else {
        next(error);
    }
}
    }
    else {
        response.status(400).end();
    }
});

app.post('/api/connexion', (request, response, next) => {
    // On vérifie le le courriel et le mot de passe
    // envoyé sont valides
    if (isCourrielValide(request.body.courriel) &&
        isMotPasseValide(request.body.mot_de_passe)) {
        // On lance l'authentification avec passport.js
        passport.authenticate('local', (error, utilisateur, info) => {
            if (error) {
                // S'il y a une erreur, on la passe
                // au serveur
                next(error);
            }
            else if (!utilisateur) {
                // Si la connexion échoue, on envoit
                // l'information au client avec un code
                // 401 (Unauthorized)
                response.status(401).json(info);
            }
            else {
                // Si tout fonctionne, on ajoute
                // l'utilisateur dans la session et
                // on retourne un code 200 (OK)
                request.logIn(utilisateur, (error) => {
                    if (error) {
                        next(error);
                    }

                    response.status(200).end();
                });
            }
        })(request, response, next);
    }
    else {
        response.status(400).end();
    }
});

app.post('/api/deconnexion', (request, response, next) => {
    // Déconnecter l'utilisateur
    request.logOut((error) => {
        if(error) {
            next(error);
        }

        // Rediriger l'utilisateur vers une autre page
        response.redirect('/');
    });
});

//Route pour ouvrir le canal de Sse
app.get('/api/stream', (request, response) =>{
    response.initStream();
});

// Renvoye une erreur 404 pour les routes non définies
app.use(function (request, response) {
    response.status(404).send(request.originalUrl + ' not found.');
});

// Démarrage du serveur
// Lancer le serveur
if(process.env.NODE_ENV === 'development') {
    let credentials = {
        key: await readFile('./security/localhost.key'),
        cert: await readFile('./security/localhost.cert')
    };

    https.createServer(credentials, app).listen(process.env.PORT)
    console.log('Serveur démarré: https://localhost:' + process.env.PORT);
}
else {
    app.listen(process.env.PORT);
    console.log('Serveur démarré: http://localhost:' + process.env.PORT);
}
