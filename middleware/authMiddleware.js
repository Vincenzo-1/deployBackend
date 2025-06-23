/*Questi middleware (`ensureAuthenticated` ed `ensureAuthorized`) funzionano sia per **login locale** che per **login OAuth**.

Infatti, entrambi si basano su `req.isAuthenticated()` e `req.user`, che vengono gestiti da Passport dopo una qualunque autenticazione andata a buon fine, sia tramite password locale che tramite provider OAuth (come Google).

**In sintesi:**  
- **Servono per entrambi i casi**: locale e OAuth.
- Proteggono le rotte che richiedono un utente autenticato e/o con un certo ruolo, indipendentemente dal metodo di login usato.*/ 

//Passport fornisce solo il metodo req.isAuthenticated() e popola req.user dopo il login.
//Passport non fornisce direttamente middleware come ensureAuthenticated o ensureAuthorized.

//AUTENTICAZIONE GARANTITA , ensureAuthenticated nome per questo tipo di controllo che do io
export const ensureAuthenticated = (req, res, next) => {
    //isAuthenticated è una funzione fornita da passport.js. 
    //Serve per verificare se l'utente ha effettuato il login(cioè, se la sessione
    //contiene un utente autenticato)
    //RESTITUISCE TRUE SE L'UTENTE HA EFFETTUATO IL LOGIN (è un metoodo di passport)
    if(req.isAuthenticated()){
        return next();
        //non faccio !req.isAunthenticated perchè se no dovrei mettere il res
        //nel caso fosse affermativo e il return fuori dall'if e quindi l'utente verrebbe 
        //sempre mandato avanti per l'altro middleware anche se non ha accesso autoriz
    } 
    res.status(401).json({ message: "Accesso non autorizzato."});
};



//Parametro tipoAutorizzato viene messo nella route in maniera tale 
//da conoscere chi è autorizzato.

export const ensureAuthorized = (tipoAutorizzato) => {
    return (req, res, next) => {
         // Controlla se l'oggetto req.user esiste (l'utente è autenticato) e se ha una proprietà tipoUtente.
         // req.user è popolato da Passport dopo un'autenticazione riuscita e deve contenere il campo come da schema Utente.js.
        if (!req.user || !req.user.tipoUtente) { // Corretto per usare req.user.tipoUtente
            return res.status(403).json({ message: "Autorizzazione fallita: utente non autenticato o tipo utente mancante" });
             // Se non matcha utente o tipoUtente, invia una risposta di errore
        }
        //Usa sempre includes per controllare se un valore è presente in un array.
        //tipoAutorizzato è un array che può essere o 'azienda' o 'candidato' (come da schema Utente.js).
        //mentre req.user.tipoUtente sarà una stringa come 'azienda' o 'candidato'.
        
        //controlla se il tipoUtente dell'utente autenticato è incluso nell'array tipoAutorizzato
        if (tipoAutorizzato.includes(req.user.tipoUtente)) { // Corretto per usare req.user.tipoUtente
              // Se lo tipoUtente è consentito, passa al prossimo middleware o al gestore della rotta.
            return next(); // L'utente ha il tipo corretto, prosegui
        }
        else {
            return res.status(403).json({ message: "Autorizzazione fallita: tipo utente non autorizzato" });
        }
    };
};
