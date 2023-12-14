const buttons = document.querySelectorAll(".btn-sm");
//verifie l'id de chaque btn etat commande et met le bon texte a l'interieur selon ça valeur
buttons.forEach(async function(button){
    var allCommandeActuel = await getOrders();
    var id_commande = allCommandeActuel.find(item => item.id_commande === parseInt(button.id)).id_etat_commande
    switch(parseInt(id_commande)){
        case 1: 
            button.innerHTML='Panier';
        break;
        case 2: 
            button.innerHTML='Cuisine';
        break;
        case 3: 
            button.innerHTML='Livraison';
        break;
        case 4: 
            button.innerHTML='Terminé';
        break;
        default:
        console.log(button.id);

    }
});
//Place les eventListener sur chaque btn de la colonne état
buttons.forEach(function(button) {
    button.addEventListener("click", async function changerEtat() {
        let id_commande = button.id;
        var allCommandeActuel = await getOrders();
        console.log(allCommandeActuel);
        console.log(id_commande);

        let data = {
            id_commande: parseInt(id_commande)
        }
        //verifie si l'etat doit etre set a 3,4 ou a 2 (etat==4) pour faire un btn qui switch entre les 3 valeur lors du click.
        if(allCommandeActuel.find(item => item.id_commande === parseInt(button.id)).id_etat_commande==4){
            let response = await fetch('/api/etatCuisine', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }
        else{
            let response = await fetch('/api/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
        }  
        allCommandeActuel = await getOrders(); 
        console.log(allCommandeActuel);
        location.reload(); 

    });
  });

  async function getOrders() {
    let response = await fetch('/api/orders');
    let panier = await response.json();
    return panier;
}
//Crée la nouvelle ligne du tableau de la page suivi commande, y ajoute les bonne info et l'ajoute.
function addOneOrder(id_commande, id_utilisateur,panier_sauvegarde){
    var table = document.getElementById("orders-list");
    var newRow = table.insertRow();
    var cellIdCommande = newRow.insertCell(0);
    var cellIdClient = newRow.insertCell(1);
    var cellDetail = newRow.insertCell(2);
    var cellEtat = newRow.insertCell(3);
    cellIdCommande.innerHTML = id_commande;
    cellIdClient.innerHTML = id_utilisateur;
    cellDetail.innerHTML = panier_sauvegarde;

    //crée et place dans la tableau le bouton état de la commande.
    var etatButton = document.createElement("button");
    etatButton.type = "button";
    etatButton.className = "btn btn-sm btn-outline-secondary";
    etatButton.innerHTML = "Cuisine";
    etatButton.id = id_commande;
    etatButton.onclick = async function() {
        var allCommandeActuel = await getOrders();
        let data = {
            id_commande: parseInt(id_commande)
        }
        //verifie si l'etat doit etre set a 3,4 ou a 2 (etat==4) pour faire un btn qui switch entre les 3 valeur lors du click.
        if(allCommandeActuel.find(item => item.id_commande === parseInt(id_commande)).id_etat_commande==4){
            let response = await fetch('/api/etatCuisine', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }
        else{
            let response = await fetch('/api/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
        }  
        location.reload();
    };
    cellEtat.appendChild(etatButton);
}

//Ouverture du canal SSE avec le serveur
let source = new EventSource('/api/stream');

source.addEventListener('add-new-order', (event)=>{
    let data = JSON.parse(event.data);
    addOneOrder(data.id_commande, data.id_utilisateur,data.panier_sauvegarde);
});

source.addEventListener('changement-etat', (event)=>{
    let data = JSON.parse(event.data);
    let buttonEtat = document.getElementById(data.id_commande);
    if(buttonEtat.innerHTML.match("Cuisine")){
        buttonEtat.innerHTML = "Livraison";
    }
    else{
        buttonEtat.innerHTML = "Terminé";
    }
});

source.addEventListener('changement-etat-val-4', (event)=>{
    let data = JSON.parse(event.data);
    let buttonEtat = document.getElementById(data.id_commande);
    buttonEtat.innerHTML = "Cuisine";
});
