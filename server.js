// On importe l'application qu'on a configurée et exportée dans index.js
const app = require('./index'); 

// On définit le port à 3000
const PORT = process.env.PORT || 3000;

// On lance l'écoute uniquement ici
app.listen(PORT, () => {
    console.log(`Serveur démarré avec succès sur http://localhost:${PORT}`);
});