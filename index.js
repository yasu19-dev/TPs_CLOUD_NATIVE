const express = require('express');
const app = express();

// Importation des deux ressources
const joueurs = require('./joueurs.json');
const equipes = require('./equipes.json'); 

app.use(express.json());

// Route de base (Accueil)
app.get('/', (req, res) => {
    res.send('Application Cloud Native Operationnelle !');
});

// ====================================================================================
        // 1. Opérations CRUD pour l'entité Joueur
// ====================================================================================

    // GET - Lister tous les joueurs
    app.get('/joueurs', (req, res) => {
        res.status(200).json(joueurs);
    });

    // GET - Afficher un joueur via son ID
    app.get('/joueurs/:id', (req, res) => {
        const id = parseInt(req.params.id);
        const joueur = joueurs.find(j => j.id === id);
        if (joueur) {
            res.status(200).json(joueur);
        } else {
            res.status(404).json({ erreur: "Joueur non trouvé" });
        }
    });

    // POST - Ajouter un nouveau joueur
    app.post('/joueurs', (req, res) => {
        joueurs.push(req.body);
        res.status(200).json(joueurs);
    });

    // PUT - Modifier un joueur existant
    app.put('/joueurs/:id', (req, res) => {
        const id = parseInt(req.params.id);
        let joueur = joueurs.find(j => j.id === id);
        
        if (joueur) {
            joueur.idEquipe = req.body.idEquipe;
            joueur.nom = req.body.nom;
            joueur.numero = req.body.numero;
            joueur.poste = req.body.poste;
            res.status(200).json(joueur);
        } else {
            res.status(404).json({ erreur: "Joueur non trouvé" });
        }
    });

    // DELETE - Supprimer un joueur
    app.delete('/joueurs/:id', (req, res) => {
        const id = parseInt(req.params.id);
        let joueur = joueurs.find(j => j.id === id);
        
        if (joueur) {
            joueurs.splice(joueurs.indexOf(joueur), 1);
            res.status(200).json(joueurs);
        } else {
            res.status(404).json({ erreur: "Joueur non trouvé" });
        }
    });

// ====================================================================================
                // 2. Afficher les joueurs d'une équipe
// ====================================================================================
    // Route : /equipes/:id/joueurs
    app.get('/equipes/:id/joueurs', (req, res) => {
        const idEquipe = parseInt(req.params.id);
        const joueursDeLequipe = joueurs.filter(j => j.idEquipe === idEquipe);
        
        res.status(200).json(joueursDeLequipe);
    });

// ====================================================================================
        // 3. Afficher l'équipe d'un joueur donné
// ====================================================================================
        // Route : /joueurs/:id/equipe
        app.get('/joueurs/:id/equipe', (req, res) => {
            const idJoueur = parseInt(req.params.id);
            const joueur = joueurs.find(j => j.id === idJoueur);
            
            if (joueur) {
                const equipeDuJoueur = equipes.find(e => e.id === joueur.idEquipe);
                res.status(200).json(equipeDuJoueur);
            } else {
                res.status(404).json({ erreur: "Joueur non trouvé" });
            }
        });

// ====================================================================================
            // 4. Chercher un joueur à partir de son nom
// ====================================================================================
        // Route : /joueurs/recherche/:nom
        app.get('/joueurs/recherche/:nom', (req, res) => {
            const nomRecherche = req.params.nom.toLowerCase();
            const resultats = joueurs.filter(j => j.nom.toLowerCase().includes(nomRecherche));
            res.status(200).json(resultats);
        });

// ====================================================================================
// EXPORTATION DE L'APPLICATION (Très important)
// ====================================================================================
module.exports = app;