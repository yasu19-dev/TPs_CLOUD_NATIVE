const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  database: 'test_mysql2',
  user: 'root',
  password: '0772633934yas++'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    return;
  }
  console.log('Connected to MySQL database');
 });
  /////////////////
 
 // Get all members
 app.get('/members', (req, res) => {
   db.query('SELECT * FROM members', (err, results) => {
     if (err) throw err;
     res.json(results);
   });
 });
 
 // Get a member by ID
 app.get('/members/:id', (req, res) => {
   const { id } = req.params;
   db.query('SELECT * FROM members WHERE id = ?', [id], (err, results) => {
     if (err) throw err;
     res.json(results[0]);
   });
 });
 
 // Create a new member
 app.post('/members', (req, res) => {
   const { name } = req.body;
   db.query('INSERT INTO members (name) VALUES (?)', [name], (err, result) => {
     if (err) throw err;
     res.json({ message: 'Member added successfully', id: result.insertId });
   });
 });
 
 // Update a member
 app.put('/members/:id', (req, res) => {
   const { id } = req.params;
   const { name } = req.body;
   db.query('UPDATE members SET name = ? WHERE id = ?', [name, id], (err) => {
     if (err) throw err;
     res.json({ message: 'Member updated successfully' });
   });
 });
 
 // Delete a member
 app.delete('/members/:id', (req, res) => {
   const { id } = req.params;
   db.query('DELETE FROM members WHERE id = ?', [id], (err) => {
     if (err) throw err;
     res.json({ message: 'Member deleted successfully' });
   });
 });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});