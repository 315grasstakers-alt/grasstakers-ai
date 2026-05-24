const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(
  './database/grasstakers.db',
  (err) => {

    if (err) {

      console.error(err.message);

    } else {

      console.log(
        '✅ Connected to SQLite database'
      );

    }

  }
);


/* BOOKINGS TABLE */

db.run(`

CREATE TABLE IF NOT EXISTS bookings (

  id INTEGER PRIMARY KEY AUTOINCREMENT,

  name TEXT,

  phone TEXT,

  address TEXT,

  service TEXT,

  message TEXT,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)

`);


/* QUOTES TABLE */

db.run(`

CREATE TABLE IF NOT EXISTS quotes (

  id INTEGER PRIMARY KEY AUTOINCREMENT,

  name TEXT,

  email TEXT,

  lawn_size TEXT,

  service TEXT,

  details TEXT,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP

)

`);


module.exports = db;