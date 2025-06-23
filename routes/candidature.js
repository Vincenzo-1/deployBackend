import express from 'express';

import { 
    creazioneCandidature, 
    visualizzazioneCandidatureFatte,
    visualizzaCandidaturePerAnnuncio
} from "../controllers/candidatureController.js" ;

import {ensureAuthenticated, ensureAuthorized} from "../middleware/authMiddleware.js"


const router = express.Router();

// ensureAuthenticated: Richiede che l'utente sia autenticato.
// ensureAuthorized(['candidato']): Richiede che l'utente autenticato sia di tipo 'candidato' (come da schema Utente.js).
router.post("/" , ensureAuthenticated, ensureAuthorized(["candidato"]), creazioneCandidature); 

router.get("/lavoratore" , ensureAuthenticated, ensureAuthorized(["candidato"]),visualizzazioneCandidatureFatte); // Rimosso :email dal path

router.get("/annuncio/:postAnnunciId", ensureAuthenticated, ensureAuthorized(["azienda"]), visualizzaCandidaturePerAnnuncio);

export default router;