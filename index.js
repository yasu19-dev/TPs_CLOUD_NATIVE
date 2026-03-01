const express = require('express');
const mysql = require('mysql2');
const app = express();

app.use(express.json()); 

// Configuration de la connexion MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '0772633934yas++', 
  database: '' 
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
