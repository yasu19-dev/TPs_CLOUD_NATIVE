const express = require('express');
const mysql = require('mysql2');
const app = express();

app.use(express.json()); 

// Configuration de la connexion MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '0772633934yas++', 
  database: 'hotel_api_db' 
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


// 1.	Implémentez les routes CRUD pour les clients.

// Créer un client (POST)
app.post('/api/clients', (req, res) => {
    const { nom, email, telephone } = req.body;
    db.query('INSERT INTO clients (nom, email, telephone) VALUES (?, ?, ?)', 
        [nom, email, telephone], 
        (err, result) => {
            if (err) return res.status(500).send(err.message);
            res.send("Client ajouté avec succès !");
        }
    );
});

// Lire les clients (GET)
app.get('/api/clients', (req, res) => {
    db.query('SELECT * FROM clients', (err, results) => {
        if (err) return res.status(500).send(err.message);
        res.json(results);
    });
});


//  2.	Implémentez une route SQL pour  insérer une réservation
app.post('/api/reservations', (req, res) => {
    const { client_id, chambre_id, date_arrivee, date_depart } = req.body;

    // 1. Vérifier si une chambre est disponible avant d’insérer [cite: 27]
    db.query('SELECT disponible FROM chambres WHERE id = ?', [chambre_id], (err, chambres) => {
        if (err) return res.status(500).send(err.message);
        
        if (chambres.length === 0 || chambres[0].disponible === 0) {
            return res.status(400).send("Désolé, cette chambre n'est pas disponible.");
        }

        // 2. Insérer la réservation [cite: 28]
        db.query(
            'INSERT INTO reservations (client_id, chambre_id, date_arrivee, date_depart) VALUES (?, ?, ?, ?)',
            [client_id, chambre_id, date_arrivee, date_depart],
            (err, resultInsert) => {
                if (err) return res.status(500).send(err.message);

                // 3. Mettre à jour le champ disponible de la chambre réservée [cite: 29]
                db.query('UPDATE chambres SET disponible = 0 WHERE id = ?', [chambre_id], (err, resultUpdate) => {
                    if (err) return res.status(500).send(err.message);
                    
                    res.send("Réservation effectuée avec succès !");
                });
            }
        );
    });
});

// --------------- 2.	Requêtes SQL avancées -----------------------

// Implémentez une route qui retourne la liste des chambres disponibles pour une période donnée
app.get('/api/chambres/disponibles', (req, res) => {
    const { debut, fin } = req.query; 
    
    const sql = `
        SELECT * FROM chambres 
        WHERE id NOT IN (
            SELECT chambre_id FROM reservations 
            WHERE date_arrivee <= ? AND date_depart >= ?
        )
    `;
    
    db.query(sql, [fin, debut], (err, results) => {
        if (err) return res.status(500).send(err.message);
        res.json(results);
    });
});

// Implémentez une route pour calculer le revenu total généré par les réservations entre deux dates.
app.get('/api/revenus', (req, res) => {
    const { debut, fin } = req.query;
    
    const sql = `
        SELECT SUM(DATEDIFF(date_depart, date_arrivee) * prix_par_nuit) as total
        FROM reservations
        JOIN chambres ON reservations.chambre_id = chambres.id
        WHERE date_arrivee >= ? AND date_depart <= ?
    `;
    
    db.query(sql, [debut, fin], (err, results) => {
        if (err) return res.status(500).send(err.message);
        res.json(results[0]);
    });
});

// Implémentez une route pour afficher les clients qui ont effectué plus de 3 réservations au cours des 6 derniers mois.
app.get('/api/clients/fidelite', (req, res) => {
    const sql = `
        SELECT client_id, COUNT(*) as nombre_reservations 
        FROM reservations 
        WHERE date_arrivee >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY client_id 
        HAVING nombre_reservations > 3
    `;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err.message);
        res.json(results);
    });
});

// Implémentez une requête pour récupérer la chambre la plus réservée au cours des 12 derniers mois.
app.get('/api/chambres/populaire', (req, res) => {
    const sql = `
        SELECT chambre_id, COUNT(*) as nombre_reservations 
        FROM reservations 
        WHERE date_arrivee >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY chambre_id 
        ORDER BY nombre_reservations DESC 
        LIMIT 1
    `;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).send(err.message);
        res.json(results[0]);
    });
});