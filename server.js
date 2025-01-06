const WebSocket = require('ws');

// Connect to the WebSocket server
const socket = new WebSocket('wss://websockets-production-ffaa.up.railway.app/');

// Unique identifier for this user (e.g., user ID or session token)
const userId = 'unique_user_id'; // Replace with dynamic user ID

socket.on('open', () => {
  console.log('Connected to WebSocket server');

  // Register this user ID with the server
  socket.send(JSON.stringify({ type: 'register', userId }));
});

async function processQueue(urls) {
  for (const url of urls) {
    const extractedData = {
      url,
      email: `example@${url}`,
      phone: '123-456-7890',
      socialMedia: {
        facebook: `https://facebook.com/${url}`,
        twitter: `https://twitter.com/${url}`,
      },
    };

    // Send extracted data to the WebSocket server for this user
    if (socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify({ type: 'data', userId, payload: extractedData }));
        console.log('Data sent:', extractedData);
      } catch (error) {
        console.error('Error sending data:', error);
      }
    } else {
      console.warn('Socket not ready, skipping send');
    }
  }
}

const urls = ['example.com', 'test.com', 'demo.com'];
processQueue(urls);
