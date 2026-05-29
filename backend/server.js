require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
const sqlite3 = require('sqlite3').verbose();

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const db = new sqlite3.Database(
  './grasstakers.db'
);

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
        reply: 'No message provided'
      });

    }

    const completion =
      await groq.chat.completions.create({

        messages: [

          {
            role: 'system',
            content:
              'You are GrassTakers AI, a professional lawn care assistant. Help customers with lawn mowing, fertilization, aeration, landscaping, weed control, and seasonal cleanup.'
          },

          {
            role: 'user',
            content: message
          }

        ],

        model: 'llama-3.1-8b-instant'

      });

    const reply =
      completion.choices?.[0]?.message?.content ||
      'No AI response';

    res.json({
      reply: reply
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      reply: 'AI request failed'
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
          success: false
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

  const bookingId =
    req.params.id;

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
          success: false
        });

      }

      res.json({
        success: true
      });

    }

  );

});

const PORT =
  process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {

  console.log(
    `GrassTakers backend running on ${PORT}`
  );

});