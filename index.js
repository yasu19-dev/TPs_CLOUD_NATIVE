const express = require('express');
const mysql = require('mysql2');
const app = express();

app.use(express.json()); 

// Configuration de la connexion MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '0772633934yas++', 
  database: 'gestion_stagiaires' 
});

db.connect(err => {
  if (err) throw err;
  console.log('Connecté à la base de données MySQL.');
});

// Le serveur écoutera sur le port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});


// 1. Insérer un nouveau stagiaire avec vérification du groupe
app.post('/api/stagiaires', (req, res) => {
    const { nom, prenom, ville, id_groupe } = req.body;

    // Vérifier l'existence du groupe d'abord
    db.query('SELECT * FROM groupe WHERE id = ?', [id_groupe], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) {
            return res.status(404).json({ message: "Le groupe spécifié n'existe pas." });
        }

        // Si le groupe existe, on insère le stagiaire
        const sqlInsert = 'INSERT INTO stagiaire (nom, prenom, ville, id_groupe) VALUES (?, ?, ?, ?)';
        db.query(sqlInsert, [nom, prenom, ville, id_groupe], (err, result) => {
            if (err) return res.status(500).json(err);
            res.status(201).json({ message: "Stagiaire ajouté avec succès", id: result.insertId });
        });
    });
});


// 2. Modifier la ville des stagiaires d'un groupe spécifique
app.put('/api/stagiaires/groupe/:id/ville', (req, res) => {
    const id_groupe = req.params.id;
    const { nouvelle_ville } = req.body;

    const sql = 'UPDATE stagiaire SET ville = ? WHERE id_groupe = ?';
    db.query(sql, [nouvelle_ville, id_groupe], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: `${result.affectedRows} stagiaires mis à jour.` });
    });
});

// 3. Supprimer les formateurs selon leur ville
app.delete('/api/formateurs/ville/:ville', (req, res) => {
    const ville = req.params.ville;

    const sql = 'DELETE FROM formateur WHERE ville = ?';
    db.query(sql, [ville], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: `${result.affectedRows} formateur(s) supprimé(s).` });
    });
});

// 4. Afficher tous les stagiaires triés par id de groupe
app.get('/api/stagiaires', (req, res) => {
    const sql = 'SELECT * FROM stagiaire ORDER BY id_groupe ASC';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});


//5. Afficher un stagiaire par son id
app.get('/api/stagiaires/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM stagiaire WHERE id = ?';
    
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(404).json({ message: "Stagiaire introuvable" });
        res.json(results[0]);
    });
});

// 6. Afficher les stagiaires par nom du groupe
app.get('/api/stagiaires/groupe/nom/:nom_groupe', (req, res) => {
    const nom_groupe = req.params.nom_groupe;
    const sql = `
        SELECT s.* FROM stagiaire s
        JOIN groupe g ON s.id_groupe = g.id
        WHERE g.nom = ?
    `;
    db.query(sql, [nom_groupe], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// 7. Afficher les stagiaires par nom du formateur
app.get('/api/stagiaires/formateur/nom/:nom_formateur', (req, res) => {
    const nom_formateur = req.params.nom_formateur;
    const sql = `
        SELECT s.* FROM stagiaire s
        JOIN affectation a ON s.id_groupe = a.id_groupe
        JOIN formateur f ON a.id_formateur = f.id
        WHERE f.nom = ?
    `;
    db.query(sql, [nom_formateur], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// 8. Afficher les stagiaires par nom du module
app.get('/api/stagiaires/module/nom/:nom_module', (req, res) => {
    const nom_module = req.params.nom_module;
    const sql = `
        SELECT s.* FROM stagiaire s
        JOIN affectation a ON s.id_groupe = a.id_groupe
        JOIN module m ON a.id_module = m.id
        WHERE m.nom = ?
    `;
    db.query(sql, [nom_module], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// 9. Afficher les formateurs par nom du module
app.get('/api/formateurs/module/nom/:nom_module', (req, res) => {
    const nom_module = req.params.nom_module;
    const sql = `
        SELECT DISTINCT f.* FROM formateur f
        JOIN affectation a ON f.id = a.id_formateur
        JOIN module m ON a.id_module = m.id
        WHERE m.nom = ?
    `;
    db.query(sql, [nom_module], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// 10. Afficher le nombre de stagiaires par formateur et par module
app.get('/api/statistiques/stagiaires', (req, res) => {
    const sql = `
        SELECT a.id_formateur, a.id_module, COUNT(s.id) AS nombre_stagiaires
        FROM affectation a
        JOIN stagiaire s ON a.id_groupe = s.id_groupe
        GROUP BY a.id_formateur, a.id_module
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});