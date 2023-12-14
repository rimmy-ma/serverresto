async function getPanier() {
    let response = await fetch('/api/order');
    let panier = await response.json();
    return panier;
}

async function getMenu() {
    let response = await fetch('/api/produit');
    let menu = await response.json();
    return menu;    
}

async function getOrders() {
    let response = await fetch('/api/orders');
    let panier = await response.json();
    return panier;
}
const buttons = document.querySelectorAll(".btn");

//boucle ajoutant un eventListener sur chaque bouton du menu, la fonction ajoute l'item au panier du client au niveau du serveur.
buttons.forEach(function(button) {
    button.addEventListener("click", async function addToCartServer() {
        let itemId= button.id
        var panierActuel = await getPanier();

        let data = {
            id_produit: parseInt(itemId)
        }
        //validation si le panier contient deja l'article pour savoir si ajouter un nouveau produit ou augmenter la quantité.
        if(panierActuel.find(item => item.id_produit === parseInt(itemId))){
            let response = await fetch('/api/itemOrder', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }
        else{
            let response = await fetch('/api/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }  
        panierActuel = await getPanier();  
    });
  });
