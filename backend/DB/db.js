const sqlite3 = require('sqlite3').verbose();

// Create and connect to the SQLite database
const db = new sqlite3.Database('mydb.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Move all create queries to createTables
db.run(`
  CREATE TABLE IF NOT EXISTS user_times (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    startTime INTEGER NOT NULL,
    endTime INTEGER
  )
`, (err) => {
  if (err) {
    console.error('Error creating table', err.message);
  } else {
    console.log('user_times table created successfully');
  }
});

module.exports = db;