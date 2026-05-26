const API_URL =
  'https://grasstakers-ai.onrender.com';

async function askAI() {

  const question =
    document.getElementById('message').value;

  const responseBox =
    document.getElementById('response');

  if (!question) {

    responseBox.innerHTML =
      'Please enter a message';

    return;
  }

  responseBox.innerHTML =
    'Thinking...';

  try {

    const response = await fetch(
      `${API_URL}/api/chat`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          message: question
        })
      }
    );

    const data = await response.json();

    responseBox.innerHTML =
      data.reply || data.error;

  } catch (error) {

    console.log(error);

    responseBox.innerHTML =
      'AI request failed';
  }
}

const bookingForm =
  document.getElementById('bookingForm');

if (bookingForm) {

  bookingForm.addEventListener(
    'submit',
    async (e) => {

      e.preventDefault();

      const name =
        document.getElementById('name').value;

      const phone =
        document.getElementById('phone').value;

      const address =
        document.getElementById('address').value;

      const service =
        document.getElementById('service').value;

      const message =
        document.getElementById('bookingMessage').value;

      const bookingStatus =
        document.getElementById('bookingStatus');

      try {

        const response = await fetch(
          `${API_URL}/api/book`,
          {
            method: 'POST',

            headers: {
              'Content-Type': 'application/json'
            },

            body: JSON.stringify({
              name,
              phone,
              address,
              service,
              message
            })
          }
        );

        const data = await response.json();

        if (data.success) {

          bookingStatus.innerHTML =
            `✅ Booking submitted! ID: ${data.bookingId}`;

          bookingForm.reset();

        } else {

          bookingStatus.innerHTML =
            '❌ Booking failed';
        }

      } catch (error) {

        console.log(error);

        bookingStatus.innerHTML =
          '❌ Server error';
      }
    }
  );
}