import express from "express";
import passport from "passport";
import Utente from "../models/Utente.js";



const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Rotta GET per avviare l'autenticazione Google.
// Quando questa rotta viene chiamata, Passport reindirizza l'utente a Google per il login
// 'scope' definisce le informazioni richieste (profilo e email) [chiede accesso alle informazioni a google]

router.get("/google", passport.authenticate("google",{scope: ["profile", "email"]})); // Avviare l’autenticazione con Google. TI reindirizza alla classica pagina di login  Google per il login e l'autorizzazione.

    /*google è il nome di default che viene assegnato alla googlestrategy che abbimo configurato in passportSetup.js, quindi scrivendo "google" stiamo chiamando la strategia Google */ 
    /*passport.Authenticate è un middleware che gestisce l'autenticazione con Google.*/

//NON SERVE IF,NEXT perchè passport fa tutto da solo 
//MIDDLEWARE DI PASSPORT (qui ce ne sono due)
// Rotta GET per verificare lo stato di autenticazione dell'utente e ottenere i suoi dati.
// Utile per il frontend per sapere se l'utente è loggato e chi è.
// /google/callback /google/callback è un endpoint nel backend (Express) [callback richiama il callbackURL]:
//Il browser ci passa solo per un istante.
//Poi il backend decide dove reindirizzare l’utente nel frontend, di solito con res.redirect(...)
router.get("/google/callback",             //funzione built-in che essendo fatta con passport, non ha bisogno di next(), e se viene fallita, cioè se l'utente non si autentica, viene reindirizzato alla pagina di login del frontend con un messaggio di errore, altrimenti va avanti. Inoltre viene chiamata in automatico dopo aver fatto il login con Google. Perchè passport lo riconosce come callbackURL della strategia Google che abbiamo configurato in passportSetup.js
    passport.authenticate('google', {
    // URL a cui reindirizzare in caso di fallimento dell'autenticazione Google.
    failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed`, // ?error=oauth_failed Comunica un tipo di errore leggibile nel frontend, tuttavia viene reindirizzato semplicemente a frontend_url/login
    // Abilita i messaggi di fallimento, se configurati nella strategia.
    failureMessage: true //se abbiamo settato nella strategia il messaggio di errore, ci appare.
  }),
  // Gestore della rotta eseguito se l'autenticazione Google ha successo.
  (req, res) => {
    //mi porta in http://localhost:5173/oauth-callback
    res.redirect(`${FRONTEND_URL}/oauth-callback`); //questa è una funzione non built-in, la creo io per reindirizzare l'utente alla pagina che decido io del frontend dopo il login con Google è avvenuto con successo ES: dopo login su facebook entri nella bacheca. 
    //quindi Veniamo indirizzati alla pagina nominata oauth-callback del frontend.
  }
);


// Rotta GET per verificare lo stato di autenticazione dell'utente e ottenere i suoi dati.
// Utile per il frontend per sapere se l'utente è loggato e chi è.
router.get('/me', (req, res) => {
  // req.isAuthenticated() è un metodo di Passport che controlla se l'utente è autenticato.
  if (req.isAuthenticated()) {
    // Se autenticato, restituisce un oggetto JSON con i dati essenziali dell'utente.
    // È importante non restituire dati sensibili come la password hashata.
    res.json({ utente: { id: req.user.id, 
        email: req.user.email, 
        mostraNome: req.user.mostraNome,
        tipoUtente: req.user.tipoUtente } });
  } else {
    // Se non autenticato, restituisce uno stato 401 (Non Autorizzato).
    res.status(401).json({ message: 'Non autenticato' });
  }
});

// Middleware per verificare se l'utente è autenticato
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Non autorizzato: Utente non autenticato' });
};

// Rotta POST per impostare il tipo di utente (ruolo)
router.post('/set-role', ensureAuthenticated, async (req, res) => {
  const { role } = req.body;
  const userId = req.user.id;

  if (!role || !['candidato', 'azienda'].includes(role)) {
    return res.status(400).json({ message: 'Ruolo non valido o mancante.' });
  }

  try {
    const utente = await Utente.findById(userId);
    if (!utente) {
      return res.status(404).json({ message: 'Utente non trovato.' });
    }

    // Controlla se il tipoUtente è già stato impostato
    if (utente.tipoUtente && utente.tipoUtente !== '') {
        // Se il tipoUtente è già impostato e diverso da un valore "vuoto" o "pending"
        // potresti voler impedire la modifica o gestirla in modo specifico.
        // Per ora, permettiamo l'aggiornamento, ma in uno scenario reale potresti volerlo bloccare.
        // return res.status(403).json({ message: 'Il ruolo utente è già stato impostato e non può essere modificato.' });
    }

    utente.tipoUtente = role;
    await utente.save();

    // Restituisci l'utente aggiornato (o solo i campi necessari)
    // Questo aiuta il frontend a aggiornare il suo stato utente.
    res.json({
        utente: {
            id: utente.id,
            email: utente.email,
            mostraNome: utente.mostraNome,
            tipoUtente: utente.tipoUtente
        }
    });

  } catch (error) {
    console.error('Errore durante l_impostazione del ruolo utente:', error);
    res.status(500).json({ message: 'Errore interno del server durante l_impostazione del ruolo.' });
  }
});


// Rotta POST per il logout dell'utente.
router.post('/logout', (req, res, next) => {
  // req.logout() è un metodo di Passport che termina la sessione di login.
  req.logout((err) => { //metodo Passport per disconnessione che rimuove req.user e viene passata una callback in caso di errore
    // Callback per gestire eventuali errori durante il logout.
    if (err) { 
        return next(err);
    } //If per gestire errori di logout in generale
    // Passa l'errore al gestore di errori Express.
    // req.session.destroy() distrugge la sessione sul server.
    req.session.destroy((err) => { //. Dopo aver chiamato session.destroy(), tutte le informazioni salvate nella sessione (come l’ID utente) vengono rimosse dal backend. Tuttavia, il cookie di sessione nel browser dell’utente potrebbe ancora esistere, per questo chiamiamo dopo clearCookie().
      if (err) {
        // Se c'è un errore nella distruzione della sessione, risponde con un errore 500.
        return res.status(500).json({ message: 'Logout fallito.' });
      }
      // res.clearCookie() rimuove il cookie di sessione dal browser dell'utente.
      // connect.sid è il nome predefinito del cookie di sessione creato da express-session
      res.clearCookie('connect.sid'); 
      // Risponde con un messaggio di successo.
      res.status(200).json({ message: 'Logout effettuato con successo' });
    });
  });
});

/* Cosa fa req.session.destroy()?
Questo distrugge la sessione lato server, eliminando tutti i dati associati a quell'ID di sessione. 
È il passo fondamentale per un logout sicuro.*/ 
//Distruggere la sessione sul server con req.session.destroy(...)
//Rimuovere il cookie dal browser con res.clearCookie('connect.sid')

export default router;