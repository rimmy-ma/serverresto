const clickEffacer = document.getElementById("vider");
const clickCommander = document.getElementById("commander");
clickEffacer.addEventListener('click', clearPanierServer);
clickCommander.addEventListener('click', commanderPanier);
const tdTotal = document.querySelectorAll(".total");

//retorune un array avec le inner join de la tab order et menu
async function getJoinMenuPanier(){
  let response = await fetch('/api/menuPanier');
  let order = await response.json();
  return order; 
}
async function getBeauPanier(){
    let response = await fetch('/api/beauPanier');
    let beauPanier = await response.json();
    return beauPanier; 
  }
//calcule le total de chaque produit du panier et l'ajoute a la colonne total de la page 
tdTotal.forEach(async function(td){
  var allProduitActuel= await getJoinMenuPanier();
  var prix = allProduitActuel.find(item => item.id_produit === parseInt(td.id)).prix;
  var quantite = allProduitActuel.find(item => item.id_produit === parseInt(td.id)).quantite;
  let total= parseInt(quantite)*parseInt(prix);
  td.innerHTML=total;
});

async function commanderPanier(){
    //reçois le array de toute les order pour compter le nombre de commande existante et incrementer la valeur de l'id de l'item dans le panier
    var allCommandeActuel = await getOrders();
    var nombreCommande = allCommandeActuel.length;
    var panier = await getPanier();
    //bloque lajout de panier vide
    if(panier.length==0){
        alert("Le panier est vide");
        return;
    }
    let id_commande= nombreCommande+1
    //obtien le join entre les table, le transforme en string, edit le string pour retirer certain caracter et le renvoie a la table sauvegarde_commande.
    var allProduitActuel= await getBeauPanier(); 
    var stringProduit= JSON.stringify(allProduitActuel);
    stringProduit = stringProduit.replace(/,|\[|\]|\"/g," ");
    console.log(stringProduit);

    let data ={
        id_commande:id_commande,
        panier_sauvegarde:stringProduit
    }
    let response = await fetch('/api/bonIdCommande', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    //ajoute les donner de la commande a la table commande
     await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    let dataSave ={
        panier_sauvegarde:stringProduit
    }
    await fetch(`/api/savePanier/${id_commande}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataSave)
    })
    //vide la table panier
    await clearPanierServer();
}

async function getOrders() {
    let response = await fetch('/api/orders');
    let panier = await response.json();
    return panier;
}

//vide le panier
async function clearPanierServer(){
    var panier= await getPanier();
    console.log(panier);
    let response = await fetch('/api/order', {
        method: 'DELETE',
    });
    location.reload();
    panier= await getPanier();
    console.log(panier);
}

//retourne le menu
async function getMenu() {
    let response = await fetch('/api/produit');
    let menu = await response.json();
    return menu;    
}
//retourne le panier
async function getPanier() {
    let response = await fetch('/api/order');
    let panier = await response.json();
    return panier;
}

const buttons = document.querySelectorAll(".btn-sm");

//boucle ajoutant un eventListener sur chaque bouton du retirer du panier, la fonction retire l'item au panier du client au niveau du serveur.
buttons.forEach(function(button) {
    button.addEventListener("click", async function retirerProduit() {
        let itemId= button.id
        var panierActuel = await getPanier();
        console.log(panierActuel);

        let data = {
            id_produit: parseInt(itemId)
        }
        //Validation si le produit doit etre retirer (quantite==1) ou si la quantite doit juste etre diminuer.
        if(panierActuel.find(item => item.id_produit === parseInt(itemId)).quantite>1){
            let response = await fetch('/api/order', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }
        else{
            let response = await fetch('/api/itemOrder', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }  
        panierActuel = await getPanier();  
        console.log(panierActuel);
        location.reload(); 
    });
  });

 
