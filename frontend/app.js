const API_URL = 'https://grasstakers-ai.onrender.com';

async function askAI() {

  const message =
    document.getElementById('message').value;

  const responseBox =
    document.getElementById('response');

  if (!message) {

    responseBox.innerHTML =
      'Please type a message';

    return;
  }

  responseBox.innerHTML = 'Thinking...';

  try {

    const response = await fetch(
      `${API_URL}/api/chat`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          message: message
        })
      }
    );

    const data = await response.json();

    console.log(data);

    responseBox.innerHTML =
      data.reply || 'No response from AI';

  } catch (error) {

    console.log(error);

    responseBox.innerHTML =
      'AI request failed';

  }

}