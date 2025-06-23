import mongoose from 'mongoose';

const utenteSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    mostraNome: {
        type: String, 
        trim: true //fa sì che eventuali spazi vuoti all’inizio o alla fine del valore vengano automaticamente rimossi quando il dato viene salvato nel database.
    },
    creatoIl: {
        type: Date,
        default: Date.now
    },
    
    ultimoLogin: {
        type: Date,
        default: Date.now
    },
    
    tipoUtente: { 
        type: String,
        enum: ['candidato', 'azienda']
        // required: true // Temporaneamente rimosso per permettere la creazione utente via OAuth senza ruolo immediato
    }
});

const Utente = mongoose.model("Utente", utenteSchema);
export default Utente;