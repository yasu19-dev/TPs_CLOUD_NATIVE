const express = require('express');
const app = express();
const equipes = require('./equipes.json');

// Middleware pour autoriser Express à lire le corps (body) des requêtes en JSON
app.use(express.json());

// 1. GET - Lister toutes les équipes
app.get('/equipes', (req, res) => {
    res.status(200).json(equipes);
});

// 2. GET - Afficher une équipe spécifique via son ID
app.get('/equipes/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const equipe = equipes.find(equipe => equipe.id === id);
    res.status(200).json(equipe);
});

// 3. POST - Ajouter une nouvelle équipe
app.post('/equipes', (req, res) => {
    equipes.push(req.body);
    res.status(200).json(equipes);
});

// 4. PUT - Modifier une équipe existante
app.put('/equipes/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let equipe = equipes.find(equipe => equipe.id === id);
    
    // Mise à jour des informations
    equipe.name = req.body.name;
    equipe.country = req.body.country;
    
    res.status(200).json(equipe);
});

// 5. DELETE - Supprimer une équipe
app.delete('/equipes/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let equipe = equipes.find(equipe => equipe.id === id);
    
    // Suppression de l'élément dans le tableau
    equipes.splice(equipes.indexOf(equipe), 1);
    
    res.status(200).json(equipes);
});

// Démarrage du serveur sur le port 82 comme demandé dans le TP
app.listen(82, () => {
    console.log('REST API via ExpressJS en écoute sur le port 82');
});