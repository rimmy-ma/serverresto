const form_connexion = document.getElementById('formConnexion');
const inputCourriel = document.getElementById('emailConnexion');
const inputMotDePasse = document.getElementById('motDePasseConnexion');
const getErreur = document.getElementById('formErreurCo');

async function validateFormConnexion() {
    let email = inputCourriel.value.trim();
    let password = inputMotDePasse.value.trim();

    if (!email || !password) {
        console.log('uwu');
        getErreur.innerText = 'Veuillez remplir tous les champs';
        getErreur.style.color = 'red';
        return false;
    }
    else{
        return true;
    }
}

async function connexion(event) {
    event.preventDefault();
    if (!await validateFormConnexion()) return;

    try {
        let data = { courriel: inputCourriel.value, mot_de_passe: inputMotDePasse.value };
        let response = await fetch('/api/connexion', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        switch(response.status) {
            case 200:
                window.location.replace('/');
                break;
            case 401:
                let info = await response.json();
                getErreur.innerText = (info.error === 'mauvais_mot_de_passe') ? 'Mauvais mot de passe' : 'Mauvais courriel';
                getErreur.style.color = 'red';
                break;
            default:
                getErreur.innerText = 'Une erreur est survenue';
                getErreur.style.color = 'red';
        }
    } catch(error) {
        getErreur.innerText = 'Erreur de connexion au serveur';
        getErreur.style.color = 'red';
    }
}

form_connexion.addEventListener('submit', connexion);