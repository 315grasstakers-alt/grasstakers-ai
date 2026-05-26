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

    console.log('GROQ ERROR:', error);

    res.status(500).json({
      error: 'AI request failed'
    });

  }

});