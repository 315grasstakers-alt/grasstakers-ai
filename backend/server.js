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

    const reply =
      completion.choices?.[0]?.message?.content;

    res.json({
      reply: reply || 'No response from AI'
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: 'AI request failed'
    });

  }

});

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {

  console.log(
    `🌿 GrassTakers AI running on port ${PORT}`
  );

});