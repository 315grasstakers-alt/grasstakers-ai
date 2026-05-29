require('dotenv').config();

const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
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
              'You are GrassTakers AI, a professional lawn care assistant. You help customers with lawn mowing, fertilization, aeration, weed control, landscaping, seasonal cleanup, and lawn maintenance. Keep answers friendly, professional, short, and helpful.'
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

    console.log('GROQ ERROR:', error);

    res.status(500).json({
      reply: 'AI request failed'
    });

  }

});

const PORT =
  process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {

  console.log(
    `GrassTakers backend running on ${PORT}`
  );

});