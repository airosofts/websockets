const { WebSocketServer } = require('ws');
const url = require('url');

// Create WebSocket server
const wss = new WebSocketServer({ port: 8080 });

// Store connections by user ID
const clients = new Map();

wss.on('connection', (socket, req) => {
  // Extract user ID from query parameters
  const queryParams = url.parse(req.url, true).query;
  const userId = queryParams.userId;

  if (userId) {
    // Store the connection with the user ID
    clients.set(userId, socket);
    console.log(`User ${userId} connected`);

    // Handle socket close event
    socket.on('close', () => {
      console.log(`User ${userId} disconnected`);
      clients.delete(userId); // Remove the connection when user disconnects
    });

    // Handle incoming messages from the user
    socket.on('message', (message) => {
      console.log(`Message from user ${userId}: ${message}`);
    });
  } else {
    console.error('User ID missing, closing connection');
    socket.close(); // Reject the connection if user ID is missing
  }
});

// Function to send data to a specific user
function sendDataToUser(userId, data) {
  const targetSocket = clients.get(userId);
  if (targetSocket && targetSocket.readyState === targetSocket.OPEN) {
    try {
      console.log(`Sending data to user ${userId}:`, data);
      targetSocket.send(JSON.stringify(data));
    } catch (error) {
      console.error(`Error sending data to user ${userId}:`, error);
    }
  } else {
    console.error(`User ${userId} is not connected`);
  }
}

console.log('WebSocket server running on port 8080');

module.exports = { sendDataToUser };
