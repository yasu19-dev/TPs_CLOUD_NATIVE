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
        //    Mise à jour de la route POST /joueurs (Questions 5 et 6)
// ====================================================================================

        // POST - Ajouter un nouveau joueur (Avec Validations)
        app.post('/joueurs', (req, res) => {
            const { id, idEquipe, nom, numero, poste } = req.body;

            // Règle 5a : Le nom est obligatoire
            if (!nom) {
                return res.status(400).json({ erreur: "Le nom du joueur est obligatoire." });
            }

            // Règle 6 : L'équipe doit exister
            const equipeExiste = equipes.find(e => e.id === idEquipe);
            if (!equipeExiste) {
                return res.status(404).json({ erreur: "Impossible d'ajouter le joueur : l'équipe spécifiée n'existe pas." });
            }

            // Règle 5b : Le numéro doit être unique dans la même équipe
            const numeroPris = joueurs.find(j => j.idEquipe === idEquipe && j.numero === numero);
            if (numeroPris) {
                return res.status(400).json({ erreur: `Le numéro ${numero} est déjà pris dans cette équipe.` });
            }

            // Si toutes les validations passent, on ajoute le joueur
            const nouveauJoueur = { id, idEquipe, nom, numero, poste };
            joueurs.push(nouveauJoueur);
            
            // 201 = Created (C'est le code HTTP standard pour une création réussie)
            res.status(201).json(joueurs);
        });

// ====================================================================================
        //    Mise à jour de la route DELETE /equipes/:id (Question 7)
// ====================================================================================
        // DELETE - Supprimer une équipe avec vérification
        app.delete('/equipes/:id', (req, res) => {
            const idEquipe = parseInt(req.params.id);

            // Règle 7 : Vérifier si l'équipe a encore des joueurs
            // La méthode .some() renvoie "true" dès qu'elle trouve au moins un joueur correspondant
            const contientJoueurs = joueurs.some(j => j.idEquipe === idEquipe);
            
            if (contientJoueurs) {
                return res.status(400).json({ 
                    erreur: "Suppression refusée : cette équipe contient encore des joueurs." 
                });
            }

            // Si l'équipe est vide, on procède à la suppression
            const equipe = equipes.find(e => e.id === idEquipe);
            if (equipe) {
                equipes.splice(equipes.indexOf(equipe), 1);
                res.status(200).json({ message: "Équipe supprimée avec succès", equipes });
            } else {
                res.status(404).json({ erreur: "Équipe non trouvée." });
            }
        });

// ====================================================================================
        //    Nouvelle route : Nombre total de joueurs par équipe (Question 8)
// ====================================================================================
            // GET - Retourner le nombre total de joueurs par équipe (Question 8)
        app.get('/equipes/stats/joueurs', (req, res) => {
            // On crée un nouveau tableau avec les statistiques
            const statistiques = equipes.map(equipe => {
                // On filtre les joueurs pour ne garder que ceux de l'équipe actuelle
                const joueursDeLequipe = joueurs.filter(j => j.idEquipe === equipe.id);
                
                // On retourne un objet formaté
                return {
                    idEquipe: equipe.id,
                    nomEquipe: equipe.name,
                    nombreDeJoueurs: joueursDeLequipe.length
                };
            });

            res.status(200).json(statistiques);
        });
// ====================================================================================
// EXPORTATION DE L'APPLICATION (Très important)
// ====================================================================================
module.exports = app;