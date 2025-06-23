import mongoose from "mongoose";

const candidatureSchema = new mongoose.Schema({
    postAnnunci : {
        type: mongoose.Schema.Types.ObjectId, //prendo l'id dell'annuncio
        ref: "PostAnnunci", //ref al modello postAnnunci
        required: true
    },
    emailCandidato: {
        type: String,
        required: [true, "Inserire email"]
    },
    utenteId: { // ID dell'utente che si candida
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utente',
        required: true
    },
    nome: { 
        type: String, 
        trim: true,
        required: [true, "Il nome è obbligatorio"] // Decidere se renderli obbligatori
    }, 
    cognome: { 
        type: String, 
        trim: true,
    required: [true, "Il cognome è obbligatorio"] 
    },
    numeroTelefono: { 
        type: String, 
        trim: true,
        // required: [true, "Il numero di telefono è obbligatorio"] 
    },
    descrizioneCandidato : { // Usato per la lettera motivazionale o descrizione generale
        type : String, 
        required : [true, "Inserire descrizione/lettera motivazionale"]
    },
    dataCandidatura: {
        type: Date,
        default: Date.now //data di candidatura, se non specificata prende la data attuale
    }
    //Aggiungere statoCandidaura
 });
 

 const Candidature = mongoose.model("Candidature", candidatureSchema);
 export default Candidature;

 //IMPORTANTE >> FARE IL COLLEGAMENTO CON ATLAS 