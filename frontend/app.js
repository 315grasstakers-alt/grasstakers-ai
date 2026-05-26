async function askAI() {

  const message =
    document.getElementById('message').value;

  if (!message) {
    alert('Please enter a message');
    return;
  }

  try {

    const response = await fetch(
      'https://grasstakers-ai.onrender.com/api/chat',
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

    document.getElementById('response').innerText =
      data.reply || data.error;

  } catch (error) {

    console.log(error);

    document.getElementById('response').innerText =
      'Server connection failed';

  }

}