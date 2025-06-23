import Candidature from "../models/Candidature.js";
import PostAnnunci from "../models/PostAnnunci.js";


export const creazioneCandidature = async (req , res) => {
    try{
      // Assicurati che l'utente sia autenticato e abbia un ID e un'email
      if (!req.user || !req.user._id || !req.user.email) {
        return res.status(401).json({ message: "Utente non autenticato o dati utente mancanti." });
      }

      const { postAnnunciId, descrizioneCandidato, nome, cognome, numeroTelefono } = req.body; 
      const utenteId = req.user._id;
      const emailCandidato = req.user.email;

      const esistenzaDelLavoro = await PostAnnunci.findById(postAnnunciId);
      if (!esistenzaDelLavoro){
       return res.status(404).json({ message: "Lavoro non trovato"});
      }

      // Controlla se l'utente si è già candidato per questo annuncio
      const candidaturaEsistente = await Candidature.findOne({
        postAnnunci: postAnnunciId,
        utenteId: utenteId 
      });

      if (candidaturaEsistente) {
        return res.status(409).json({ message: "Ti sei già candidato a questo annuncio!" });
      }
      
      const nuoveCandidature = new Candidature({
        postAnnunci : postAnnunciId,
        utenteId: utenteId,
        emailCandidato: emailCandidato,
        descrizioneCandidato,
        nome,
        cognome,
        numeroTelefono
      });
      const candidaturaSalvata = await nuoveCandidature.save();
      res.status(201).json( candidaturaSalvata );
    } catch(error){
        res.status(500).json({ message: "Errore nella creazione della candidatura" , error: error.message});
    }
};



export const visualizzazioneCandidatureFatte = async (req, res) => {
  try{
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: "Utente non autenticato." });
    }
    // Cerca candidature per utenteId invece che per email param
    const candidature = await Candidature.find({ utenteId : req.user._id})
                                          .populate('postAnnunci', 'titolo azienda località') // Popola i dettagli dell'annuncio
                                          .select("postAnnunci dataCandidatura descrizioneCandidato"); // Aggiungi altri campi se necessario
    //restituisce un array( vuoto se non trova nulla), non sarà mai undefined o null
    //conterrà il valore dell’email passato nell’URL del routes
    //Se l'array di candidature è vuoto allora è 0
    if(candidature.length === 0 ){
      return res.status(404).json({message: "Nessuna candidatura trovata per questo Candiadato"}); // Aggiunto return
    }
    res.json(candidature);
  } catch(error) {
    res.status(500).json({message: "Errore nella visualizzazione della candidatura" , error: error.message});
  }
};


//ma è più chiaro e manutenibile lasciarla in candidatureController, perché restituisce un elenco di candidature, non di annunci.
export const visualizzaCandidaturePerAnnuncio = async (req, res) => {
  try {
    const { postAnnunciId } = req.params;  // Prima estrai l'ID dall'URL

    // Ora cerca l'annuncio nel database
    const annuncio = await PostAnnunci.findById(postAnnunciId);

    // Controlla se l'annuncio esiste
    if (!annuncio) {
      return res.status(404).json({ message: "Annuncio non trovato" });
    }

    // Cerca tutte le candidature associate a quell'annuncio
    const candidature = await Candidature.find({ postAnnunci: postAnnunciId });

    if (candidature.length === 0) {
      return res.status(404).json({ message: "Nessuna candidatura trovata per questo annuncio" });
    }

    // Se tutto ok, rispondi con i dati dell'annuncio e le candidature
    return res.json({
      annuncio: {
        titolo: annuncio.titolo,
        azienda: annuncio.azienda,
        descrizione: annuncio.descrizione,
      },
      candidature,
    });

  } catch (error) {
    return res.status(500).json({message: "Errore nella visualizzazione delle candidature",
      error: error.message
    });
  }
};
