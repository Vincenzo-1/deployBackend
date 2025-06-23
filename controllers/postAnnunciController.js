import PostAnnunci from "../models/PostAnnunci.js";
//Controller per pubblicare un Lavoro


export const pubblicaLavoro = async (req, res) =>{try {
    const {titolo, azienda, descrizione, località} = req.body;
    // Assicurati che req.user sia disponibile e contenga l'ID dell'utente autenticato
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "Utente non autenticato o ID utente non trovato." });
    }
    const newPostAnnunci = new PostAnnunci({
        titolo,
        azienda, // Considera se 'azienda' debba essere precompilato dal profilo dell'utente azienda
        descrizione,
        località,
        createdBy: req.user._id // Associa l'annuncio all'utente che lo crea
    });
const annunciSalvati = await newPostAnnunci.save();
res.status(201).json(annunciSalvati); //201 Created indica che la richiesta è andata a buon fine e ha portato alla creazione di una nuova risorsa.
}catch (error){
    res.status(500).json({message: 'Errore nella pubblicazione di un post di lavoro', error: error.message})
}
};


//Controller per ricevere tutti i lavori
export const riceviLavoro = async(req, res) => {try {
    const ricezioneAllLavori = await PostAnnunci.find();
    if (ricezioneAllLavori.length === 0) {
        return res.status(404).json({message: 'Nessun annuncio di lavoro trovato'});
    }
    res.json(ricezioneAllLavori);
    
} catch(error){
    res.status(500).json({message:'Errore nella ricezione  annunci di lavoro', error: error.message});
}
};

//Controller per ricevere un lavoro da id
export const riceviLavoroDaId = async(req,res)=>{ try {
const ricezioneAnnuncio = await PostAnnunci.findById(req.params.id);
if (!ricezioneAnnuncio){
    return res.stautus(404).json({message:'Annuncio di lavoro non trovato'})
}
res.json(ricezioneAnnuncio);
} catch(error){
 res.status(500).json({message:'Errore nella ricezione annuncio di lavoro', error: error.message})
}};



//Controller per rimuovere un lavoro da id
export const rimuoviLavoroDaId = async(req, res) => {
    try{
        const annunciEliminati = await PostAnnunci.findByIdAndDelete(req.params.id);
        if (!annunciEliminati) {
            return res.status(404).json({message:'Errore eliminazione annuncio'}); 
        } 
 res.json({message: 'Annuncio eliminato con successo'});
} catch(error){
        res.status(500).json({message:'Errore nella rimozione del lavoro', error: error.message });
    }
};


export const riceviLavoroDaAzienda = async (req, res) => {
  try {
    // Ottiene l'ID dell'utente (azienda) autenticato dalla richiesta (req.user.id).
    const utenteId = req.user.id; // Modificato da req.utente.id a req.user.id
    // Cerca tutti gli annunci nel database dove il campo 'createdBy' corrisponde all'ID dell'utente.
    // Popola i dettagli del creatore (opzionale, ma può essere utile per conferma).
    // Ordina gli annunci per data di pubblicazione decrescente.
    const annunciAzienda = await PostAnnunci.find({ createdBy: utenteId })
                                          .populate('createdBy', 'displayName email')
                                          .sort({ dataPubblicazione: -1 });

    // Se non vengono trovati annunci per l'azienda o l'array è vuoto.
    if (!annunciAzienda || annunciAzienda.length === 0) {
      // Restituisce uno stato 404 con un messaggio specifico.
      return res.status(404).json({ message: 'Nessun annuncio trovato per la tua azienda.' });
    }
    // Se trovati, restituisce gli annunci dell'azienda in formato JSON.
    res.json(annunciAzienda);
  } catch (error) {
    // In caso di errore, restituisce un errore 500.
    res.status(500).json({ message: 'Errore nella ricezione degli annunci della tua azienda', error: error.message });
  }
};

