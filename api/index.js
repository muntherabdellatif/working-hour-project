const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;

// Create and connect to the SQLite database
const db = new sqlite3.Database('mydb.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS user_times (
    userId INTEGER,
    startTime INTEGER NOT NULL,
    endTime INTEGER NOT NULL
  )
`, (err) => {
  if (err) {
    console.error('Error creating table', err.message);
  } else {
    console.log('user_times table created successfully');
  }
});

// Test SQLite connection with a sample query
app.get('/db', (req, res) => {
  db.all('SELECT datetime("now") AS currentTime', [], (err, rows) => {
    if (err) {
      console.error('Error executing query', err.message);
      res.status(500).send('Database error');
    } else {
      res.json(rows);
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
