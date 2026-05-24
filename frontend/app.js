async function askAI() {

  const message =
    document.getElementById('message').value;

  const responseBox =
    document.getElementById('response');

  if (!message) {

    alert('Please enter a message');

    return;
  }

  responseBox.innerHTML = 'Thinking...';

  try {

    const response = await fetch(
      'http://localhost:3001/api/chat',
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

    responseBox.innerHTML = data.reply;

  } catch (error) {

    console.error(error);

    responseBox.innerHTML =
      '❌ Error connecting to backend.';
  }
}

async function submitBooking() {

  const bookingData = {

    name:
      document.getElementById('name').value,

    phone:
      document.getElementById('phone').value,

    address:
      document.getElementById('address').value,

    service:
      document.getElementById('service').value,

    message:
      document.getElementById('bookingMessage').value
  };

  try {

    const response = await fetch(
      'http://localhost:3001/api/book',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify(bookingData)
      }
    );

    const data = await response.json();

    document.getElementById(
      'bookingResponse'
    ).innerHTML =

      '✅ Booking submitted! ID: ' +
      data.bookingId;

  } catch (error) {

    console.error(error);

    document.getElementById(
      'bookingResponse'
    ).innerHTML =

      '❌ Booking failed.';
  }
}