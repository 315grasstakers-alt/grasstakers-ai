require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const db = new sqlite3.Database('./grasstakers.db');

db.serialize(() => {

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

  db.run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);

});

app.get('/', (req, res) => {

  res.json({
    status: 'ok',
    service: 'GrassTakers Backend Running'
  });

});

app.post('/api/chat', async (req, res) => {

  try {

    const message = req.body.message;

    const completion =
      await groq.chat.completions.create({

        messages: [
          {
            role: 'user',
            content: message
          }
        ],

        model: 'llama3-8b-8192'
      });

    res.json({

      reply:
        completion.choices?.[0]?.message?.content ||
        'No AI response returned.'
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: 'AI request failed'
    });

  }

});

app.post('/api/book', (req, res) => {

  const {
    name,
    phone,
    address,
    service,
    message
  } = req.body;

  db.run(

    `
    INSERT INTO bookings
    (
      name,
      phone,
      address,
      service,
      message
    )
    VALUES (?, ?, ?, ?, ?)
    `,

    [
      name,
      phone,
      address,
      service,
      message
    ],

    function(err) {

      if (err) {

        console.log(err);

        return res.status(500).json({
          error: 'Booking failed'
        });

      }

      res.json({

        success: true,
        bookingId: this.lastID

      });

    }

  );

});

app.get('/api/bookings', (req, res) => {

  db.all(

    `
    SELECT *
    FROM bookings
    ORDER BY created_at DESC
    `,

    [],

    (err, rows) => {

      if (err) {

        console.log(err);

        return res.status(500).json({
          error: 'Database error'
        });

      }

      res.json(rows);

    }

  );

});

app.delete('/api/bookings/:id', (req, res) => {

  const bookingId = req.params.id;

  db.run(

    `
    DELETE FROM bookings
    WHERE id = ?
    `,

    [bookingId],

    function(err) {

      if (err) {

        console.log(err);

        return res.status(500).json({
          error: 'Delete failed'
        });

      }

      res.json({
        success: true
      });

    }

  );

});

app.post('/api/admin/register', async (req, res) => {

  const { username, password } = req.body;

  try {

    const hashedPassword =
      await bcrypt.hash(password, 10);

    db.run(

      `
      INSERT INTO admins
      (
        username,
        password
      )
      VALUES (?, ?)
      `,

      [
        username,
        hashedPassword
      ],

      function(err) {

        if (err) {

          console.log(err);

          return res.status(500).json({
            error: 'Admin creation failed'
          });

        }

        res.json({
          success: true
        });

      }

    );

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: 'Server error'
    });

  }

});

app.post('/api/admin/login', (req, res) => {

  const {
    username,
    password
  } = req.body;

  db.get(

    `
    SELECT *
    FROM admins
    WHERE username = ?
    `,

    [username],

    async (err, admin) => {

      if (err || !admin) {

        return res.status(401).json({
          error: 'Invalid credentials'
        });

      }

      const validPassword =
        await bcrypt.compare(
          password,
          admin.password
        );

      if (!validPassword) {

        return res.status(401).json({
          error: 'Invalid credentials'
        });

      }

      const token = jwt.sign(

        {
          id: admin.id,
          username: admin.username
        },

        process.env.JWT_SECRET,

        {
          expiresIn: '7d'
        }

      );

      res.json({

        success: true,
        token

      });

    }

  );

});

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {

  console.log(
    `🌿 GrassTakers AI running on port ${PORT}`
  );

});
