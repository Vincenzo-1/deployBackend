// Importa l'istanza principale di Passport.
import passport from 'passport';
// Importa la strategia di autenticazione Google OAuth 2.0 da passport-google-oauth20.
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// Importa il modello User, che interagisce con il database per gli utenti.
import Utente from '../models/Utente.js';
// Importa dotenv per caricare le variabili d'ambiente.
import dotenv from 'dotenv';

// Carica le variabili d'ambiente dal file .env.
dotenv.config();

// Configurazione della strategia Google OAuth 2.0.
passport.use(
  new GoogleStrategy({
    // clientID: ID client OAuth fornito da Google Cloud Console.
    clientID: process.env.GOOGLE_CLIENT_ID,
    // clientSecret: Segreto client OAuth fornito da Google Cloud Console.
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // callbackURL: L'URL a cui Google reindirizzerà l'utente dopo l'autenticazione. Deve corrispondere a quello configurato in Google Cloud Console.
    callbackURL: 'http://localhost:5000/api/auth/google/callback', //Questo è l’indirizzo a cui Google reindirizzerà l’utente dopo l’autenticazione, permettendo alla tua applicazione di completare il processo di login.
    //callbackURL servirà in modo tale da riportarmi qui una volta fatto il login
    // scope: Array di stringhe che specificano quali informazioni dell'utente richiedere a Google (profilo e email in questo caso).
    scope: ['profile', 'email'] //profile talvolta include email, ma è meglio specificare entrambi per sicurezza, perchè non è detto.
  },
  // Funzione di callback (verify function) eseguita dopo che Google ha autenticato l'utente.
  // Riceve accessToken, refreshToken, il profilo dell'utente da Google, e la funzione done di Passport.
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Cerca un utente nel database locale che corrisponda al googleId del profilo Google.
      let utente = await Utente.findOne({ googleId: profile.id }); 
      
      /*Google, tramite la sua API OAuth, restituisce l’oggetto `profile` e il suo identificativo univoco si trova nella proprietà `profile.id`.  
**Questo nome (`profile.id`) è deciso da Google** e non puoi cambiarlo: quando ricevi i dati dal provider, si chiama sempre così.
Tuttavia, **nel tuo database** o nel tuo oggetto utente, puoi salvare questo valore con qualsiasi nome tu voglia, ad esempio:
```javascript
googleId: profile.id
// oppure
pippo: profile.id
*/ 

//serve per segnalare che un'operazione asincrona è terminata [DONE]
      if (utente) {
        // Se l'utente esiste, passa l'utente alla funzione done (nessun errore, utente trovato).
        return done(null, utente); //sintassi: done(error, user, [info]opzionale);
      } else {
        // Se l'utente non esiste, ne crea uno nuovo nel database.
        // Nota sulla scelta di userType: come indicato nel commento, questa è una semplificazione.
        // In un'applicazione reale, si dovrebbe gestire meglio la scelta del tipo di utente (es. pagina di completamento profilo).
        //profile, email e displayName è roba di passport per OAuth google
        utente = await Utente.create({
          googleId: profile.id,                 // ID Google del profilo.
          email: profile.emails[0].value,       // Email principale dell'utente (la prima nell'array emails).
          mostraNome: profile.displayName      // Nome visualizzato dall'utente su Google.
          // tipoUtente non viene impostato qui, sarà impostato dall'utente nella pagina di selezione ruolo.
        });
        //Quando usi Passport con Google, il profilo dell’utente (profile) contiene un array di email, perché un account Google può avere più email associate.
        //profile.emails è un array di oggetti email.
        //[0] prende la prima email dell’array (di solito quella principale).
        //.value prende il valore della mail (la stringa vera e propria).
        // Passa il nuovo utente creato alla funzione done.
        return done(null, utente);
      }
    } catch (error) {
      // Se si verifica un errore (es. problema di database), passa l'errore alla funzione done.
      return done(error, null);
    }
  }
));


//Cosa fa:
//Quando un utente effettua il login, questa funzione decide quale informazione dell’utente salvare nella sessione.
//Come funziona:
//Salva solo l’id dell’utente nella sessione (non tutto l’oggetto utente), così la sessione resta leggera.

//SESSIONE LEGGERA>> Questo rende la sessione:
//più piccola in termini di memoria/byte,
//più veloce da leggere e scrivere,
//più sicura, perché non contiene dati sensibili.
//Quando serve conoscere i dettagli dell’utente, questi vengono recuperati dal database usando l’ID salvato nella session


// Serializzazione dell'utente per la sessione.
// Determina quali dati dell'utente salvare nella sessione. In questo caso, si salva solo l'ID dell'utente, per rendere leggera la sessione.
passport.serializeUser((utente, done) => {
  // Salva solo l'ID dell'utente nella sessione per mantenerla leggera.
  done(null, utente.id); //Quindi, utente.id corrisponde al valore del campo _id nello schema utente nel di mongoDB.
});

//serializeUser serve per prendere e salvare solo dati che vogliamo noi
//in questo caso salva e mantiene solo utente.id


//Cosa fa:
//Quando arriva una richiesta, questa funzione recupera dal database l’utente completo usando l’id salvato nella sessione.
//Come funziona:
//Prende l’id dalla sessione, cerca l’utente nel database e lo rende disponibile come req.user nelle route.

// Deserializzazione dell'utente dalla sessione.
// Recupera i dati completi dell'utente basandosi sull'ID salvato nella sessione.
passport.deserializeUser(async (id, done) => { //done è la firma di deserialize e serve per dire a passport che l'operazione asincrona è finita.
  try {
    // Trova l'utente nel database usando l'ID.
    const utente = await Utente.findById(id); //id sarebbe utente.it messo in serialized (lo capisce ... vanno a coppia)
    // Passa l'utente trovato alla funzione done.
    done(null, utente);
  } catch (error) {
    // Se si verifica un errore, lo passa alla funzione done.
    done(error, null);
  }
});

//serializzazione e deserializzazione serve per mantenere attiva la sessione tra le richieste
//PASSPORT SERVE PER L'AUTENTICAZIONE ; OVVERO L'UTENTE X DEVE VEDERE SOLO LE SUE COSE