const API_URL =
  'https://grasstakers-ai.onrender.com';

async function askAI() {

  const message =
    document.getElementById(
      'message'
    ).value;

  const responseBox =
    document.getElementById(
      'response'
    );

  if (!message) {

    responseBox.innerHTML =
      'Please type a message';

    return;

  }

  responseBox.innerHTML =
    'Thinking...';

  try {

    const response =
      await fetch(
        `${API_URL}/api/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json'
          },
          body: JSON.stringify({
            message
          })
        }
      );

    const data =
      await response.json();

    responseBox.innerHTML =
      data.reply || 'No response';

  } catch (error) {

    console.log(error);

    responseBox.innerHTML =
      'AI request failed';

  }

}

async function getQuote() {

  const service =
    document.getElementById(
      'service'
    ).value;

  const yardSize =
    document.getElementById(
      'yardSize'
    ).value;

  try {

    const response =
      await fetch(
        `${API_URL}/api/quote`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json'
          },
          body: JSON.stringify({
            service,
            yardSize
          })
        }
      );

    const data =
      await response.json();

    document.getElementById(
      'quoteResult'
    ).innerHTML =
      `💰 Estimated Quote: $${data.quote}`;

  } catch (error) {

    console.log(error);

    document.getElementById(
      'quoteResult'
    ).innerHTML =
      'Unable to calculate quote';

  }

}

async function submitBooking() {

  const bookingResponse =
    document.getElementById(
      'bookingResponse'
    );

  bookingResponse.innerHTML =
    'Submitting booking...';

  const bookingData = {

    name:
      document.getElementById(
        'name'
      ).value,

    phone:
      document.getElementById(
        'phone'
      ).value,

    address:
      document.getElementById(
        'address'
      ).value,

    service:
      document.getElementById(
        'service'
      ).value,

    yardSize:
      document.getElementById(
        'yardSize'
      ).value,

    message:
      document.getElementById(
        'bookingMessage'
      ).value

  };

  try {

    const response =
      await fetch(
        `${API_URL}/api/book`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json'
          },
          body: JSON.stringify(
            bookingData
          )
        }
      );

    const data =
      await response.json();

    if (data.success) {

      bookingResponse.innerHTML =
        `✅ Booking submitted! ID: ${data.bookingId}`;

    } else {

      bookingResponse.innerHTML =
        '❌ Booking failed';

    }

  } catch (error) {

    console.log(error);

    bookingResponse.innerHTML =
      '❌ Server error';

  }

}