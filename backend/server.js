require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
const sqlite3 = require('sqlite3').verbose();
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

    if (!message) {
      return res.status(400).json({
        error: 'Message required'
      });
    }

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
        completion.choices[0].message.content

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

app.post('/api/login', async (req, res) => {

  const {
    username,
    password
  } = req.body;

  const adminUser = 'admin';
  const adminPass = 'grasstakers123';

  if (
    username !== adminUser ||
    password !== adminPass
  ) {

    return res.status(401).json({
      error: 'Invalid credentials'
    });

  }

  const token = jwt.sign(

    {
      username
    },

    process.env.JWT_SECRET,

    {
      expiresIn: '7d'
    }

  );

  res.json({
    token
  });

});

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {

  console.log(
    `🌿 GrassTakers AI running on port ${PORT}`
  );

});