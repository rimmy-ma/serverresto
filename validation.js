//voir code du cours pour validation.
export const isCourrielValide = (courriel) => {
    return courriel.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
};
    

export const isMotPasseValide = (mot_de_passe) => 
    typeof mot_de_passe === 'string' &&
    mot_de_passe.length >= 8;