require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const axios = require('axios');

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const resend = new Resend(
  process.env.RESEND_API_KEY
);

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

app.post('/api/admin/login', (req, res) => {

  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASSWORD
  ) {

    const token = jwt.sign(
      { admin: true },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      token
    });

  }

  res.status(401).json({
    success: false,
    message: 'Invalid username or password'
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
    content: `
You are GrassTakers AI.

You work for GrassTakers Lawn Care.

Services:

- Lawn Mowing ($45-$95)
- Fertilization ($75)
- Aeration ($150)
- Leaf Cleanup ($120+)

Your goals:

1. Help customers.
2. Generate leads.
3. Encourage bookings.
4. Give pricing when possible.

Pricing:

Small lawn mowing = $45
Medium lawn mowing = $65
Large lawn mowing = $95

Fertilization = $75
Aeration = $150
Leaf Cleanup = $120+

Always be friendly.

If someone asks for pricing, give an estimate.

If someone asks about services, recommend the correct service.

If someone seems interested, encourage them to submit a booking.

Never mention OpenAI, Groq, or that you are an AI model.

Always act like a GrassTakers employee.

When appropriate, remind customers:

"Use the booking form below to request service and receive a confirmation."

Keep answers short, professional, and helpful.
`
  },

  {
    role: 'user',
    content: message
  }

],
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
    async function(err) {

      if (err) {

        console.log(err);

        return res.status(500).json({
          success: false
        });

      }

      try {

        if (process.env.RESEND_API_KEY) {

          await resend.emails.send({

            from: 'onboarding@resend.dev',

            to: '315grasstakers@gmail.com',

            subject: 'New GrassTakers Booking',

            html: `
              <h2>New Booking</h2>

              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Address:</strong> ${address}</p>
              <p><strong>Service:</strong> ${service}</p>
              <p><strong>Message:</strong> ${message}</p>
            `

          });

        }

      } catch (emailError) {

        console.log(
          'Email Error:',
          emailError
        );

      }

      try {

        if (process.env.DISCORD_WEBHOOK_URL) {

          await axios.post(
            process.env.DISCORD_WEBHOOK_URL,
            {
              content:
`🌱 NEW GRASSTAKERS BOOKING

Name: ${name}
Phone: ${phone}
Address: ${address}
Service: ${service}
Message: ${message}`
            }
          );

        }

      } catch (discordError) {

        console.log(
          'Discord Error:',
          discordError.message
        );

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
          success: false
        });

      }

      res.json({
        success: true
      });

    }
  );

});

app.post('/api/quote', (req, res) => {

  const {
    service,
    yardSize
  } = req.body;

  let quote = 0;

  if (service === 'Lawn Mowing') {

    if (yardSize === 'Small') quote = 45;
    if (yardSize === 'Medium') quote = 65;
    if (yardSize === 'Large') quote = 95;

  }

  if (service === 'Fertilization') {
    quote = 75;
  }

  if (service === 'Aeration') {
    quote = 150;
  }

  if (service === 'Leaf Cleanup') {
    quote = 120;
  }

  res.json({
    success: true,
    quote
  });

});
const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {

  console.log(
    `GrassTakers backend running on ${PORT}`
  );

});