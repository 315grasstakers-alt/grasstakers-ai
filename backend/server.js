require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {

  res.json({
    status: 'ok'
  });

});

app.post('/api/chat', async (req, res) => {

  const message = req.body.message;

  res.json({
    reply: `GrassTakers AI received: ${message}`
  });

});

const PORT =
  process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {

  console.log(`Server running on ${PORT}`);

});