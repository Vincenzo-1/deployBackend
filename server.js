import express from 'express';
import session from 'express-session';
import passport from 'passport';
import mongoose from 'mongoose';
import cors from 'cors';
import candidatureRoutes from './routes/candidature.js';
import postAnnunciRoutes from './routes/postAnnunci.js';
import authRoutes from './routes/authRoutes.js';
import dotenv from "dotenv";
import './config/passportSetup.js'; // Importa la configurazione di Passport per l'autenticazione

// Carica le variabili d'ambiente dal file .env nella directory principale del progetto.
dotenv.config();
// Crea un'istanza dell'applicazione Express.
const app = express();
// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Allow only the frontend origin
  credentials: true // Allow cookies and authorization headers
}));


const PORT = process.env.PORT || 5000;
const MONGOURI = process.env.MONGO_URI;
// Inizializza Passport per l'uso nell'applicazione Express.
app.use(session({
  //firma il cookie della sessione(connect.sid) per evitare di essere manomesso dal client
  //N.B. Se qualcuno prova a modificare il cookie, la firma non sarà più valida , e la sessione verrà ignorata
  //Non bisogna cambiare ogni volta il cookie, perché?Ogni volta che il server si riavvia, se la chiave cambia → tutte le sessioni precedenti diventano invalide. Gli utenti verranno disconnessi ogni volta.
  secret: process.env.SESSION_SECRET || 'fallbacksecretkey', 
  //Firma il cookie della sessione. È obbligatorio e dev'essere segreto.
  //fallbacksecretkey userà questo di default se non imposto la variabile d'ambiente session_secret
  resave: false, //	Non salva la sessione se non è stata modificata. Riduce stress sul database/memoria.
  saveUninitialized: false, //	Non salva le nuove sessioni vuote (entri e non fai niente)
  cookie: {
    secure: process.env.NODE_ENV === "production", // Imposta il cookie come sicuro solo in produzione (HTTPS) 
    /*Se l'app è in ambiente di produzione (cioè quando la variabile d’ambiente NODE_ENV è settata su "production"),
    allora il cookie di sessione sarà marcato come "secure", cioè verrà inviato dal browser al server SOLO se la connessione è HTTPS, cioè una connessione criptata e sicura. Dal momento che il nostro node_env = development, Il cookie non sarà marcato come secure, ma sarà inviato anche su connessioni HTTP (tipico in ambiente di sviluppo).*/
    sameSite: 'Lax', // Aggiunto per una politica SameSite esplicita, buona per la maggior parte degli scenari.
    httpOnly: true,     //L'attributo httpOnly serve per evitare che js possa accedere ai cookie
    maxAge: 24 * 60 * 60 * 1000 // 24 ore in millisecondi, dopodiché il cookie scade e l'utente deve effettuare nuovamente il login.
  }
}));

app.use(passport.initialize());
// Abilita le sessioni persistenti di login per Passport (usa express-session).
app.use(passport.session());

app.use(express.json()); //per poter leggere i dati in formato JSON
app.use('/api/auth', authRoutes);
app.use('/api/candidature', candidatureRoutes);
app.use('/api/postAnnunci', postAnnunciRoutes);

//è un middleware preso da express-session, che permette di gestire le sessioni degli utenti in modo semplice e sicuro.
//Questo cookie contiene di default un id di sessione(connect.sid)

//middleware session() e gestisce automaticamente la crea
mongoose
  .connect(MONGOURI, {useUnifiedTopology: true,}) // migliora la gestione dei cluster, delle repliche, della riconnessione automatica, del monitoraggio, ecc.Senza questa opzione, in passato c’erano warning in console 
  .then(() => {
    console.log('MongoDB connesso con successo');
    app.listen(PORT, () => {
        console.log(`Server in ascolto sulla porta ${PORT}`);
    });
}).catch((error) => {console.error('Errore di connessione a MongoDB:', error);
    process.exit(1); // Esce dal processo se la connessione fallisce
});

app.get('/', (req, res) => {
  res.send('Bacheca di annunci di lavoro API è avviata.');
});

