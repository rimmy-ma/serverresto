const form_inscription = document.getElementById('formInscription');
const inputCourriel = document.getElementById('formCourriel');
const inputMotDePasse = document.getElementById('motDePasse');
const inputNom = document.getElementById('nomUtilisateur');
const getErreur = document.getElementById('formErreur');

async function validateFormInscription() {
    let email = inputCourriel.value.trim();
    let password = inputMotDePasse.value.trim();
    let nom = inputNom.value.trim();

    if (!email || !password || !nom) {
        getErreur.innerText = 'Veuillez remplir tous les champs';
        getErreur.style.color = 'red';
        return false;
    }

    else if(password.length < 8){
        getErreur.innerText = 'Le mot de passe doit être composé au minimum de 8 caractère';
        getErreur.style.color = 'red';
        return false;
    }
    else{
        return true;
    }
}

async function inscription(event) {
    event.preventDefault();
    if (!await validateFormInscription()) return;

        let data = {
            courriel: inputCourriel.value,
            mot_de_passe: inputMotDePasse.value,
            nom: inputNom.value
        };

        let response = await fetch('/api/inscription', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        if (response.ok) {
            window.location.replace('/connexion');
        } else if (response.status === 409) {
            getErreur.innerText = 'L\'utilisateur existe déjà';
            getErreur.style.color = 'red';
        } else {
            getErreur.innerText = 'Une erreur est survenue';
            getErreur.style.color = 'red';
        }
}

form_inscription.addEventListener('submit', inscription);