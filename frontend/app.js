const API_URL = 'https://grasstakers-ai.onrender.com';

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
        document.getElementById('message').value;

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

        const bookingStatus =
          document.getElementById('bookingStatus');

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

        document.getElementById(
          'bookingStatus'
        ).innerHTML =
          '❌ Server error';

      }

    }
  );

}

const aiButton =
  document.getElementById('askAIButton');

if (aiButton) {

  aiButton.addEventListener(
    'click',
    async () => {

      const question =
        document.getElementById('aiInput').value;

      const aiResponse =
        document.getElementById('aiResponse');

      aiResponse.innerHTML =
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

        aiResponse.innerHTML =
          data.reply || 'No response';

      } catch (error) {

        console.log(error);

        aiResponse.innerHTML =
          'AI request failed';

      }

    }
  );

}