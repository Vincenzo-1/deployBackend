import express, { application } from 'express';
import {
    pubblicaLavoro,
    riceviLavoro,
    riceviLavoroDaId,
    rimuoviLavoroDaId,
    riceviLavoroDaAzienda
} from '../controllers/postAnnunciController.js';
import { ensureAuthenticated, ensureAuthorized } from '../middleware/authMiddleware.js';


const router = express.Router() //serve perchè abbiamo creato scheda con routes. Se lo avessimo fatto direttamente in server.js non avremmo avuto bisogno di creare un router, ma avremmo potuto usare direttamente app.get() o app.post() per definire le rotte. In questo caso, abbiamo creato un router per organizzare meglio le nostre rotte e separare la logica del controller dalla definizione delle rotte.




router.post('/', ensureAuthenticated, ensureAuthorized(['azienda']), pubblicaLavoro);

router.get('/', riceviLavoro); 

// Specific route for 'miei-annunci' must come before the parameterized ':id' route
router.get('/miei-annunci', ensureAuthenticated, ensureAuthorized(['azienda']), riceviLavoroDaAzienda);

router.get('/:id', riceviLavoroDaId);

router.delete('/:id', ensureAuthenticated, ensureAuthorized(['azienda']), rimuoviLavoroDaId);

export default router 