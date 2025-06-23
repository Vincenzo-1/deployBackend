import mongoose from "mongoose";

const postAnnunciSchema = new mongoose.Schema({
    titolo: {
        type: String,
        required: [true, "Inserire titolo"]
    },
    azienda: {
        type: String,
        required: [true, "Inserire nome azienda"]
    },
    descrizione: {
        type: String,
        required: [true, "Inserire descrizione"]
    },
    località:{
        type: String,
        required: [true, "Inserire località"]
    },
    dataPubblicazione: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utente', // Riferimento al modello Utente
        required: [true, "Autore dell'annuncio (createdBy) è obbligatorio"]
    }
});


const PostAnnunci = mongoose.model("PostAnnunci", postAnnunciSchema);
export default PostAnnunci;