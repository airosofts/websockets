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
  } else {
    console.error('User ID missing, closing connection');
    socket.close();
  }

  socket.on('close', () => {
    console.log(`User ${userId} disconnected`);
    clients.delete(userId); // Remove the connection on disconnect
  });

  socket.on('message', (message) => {
    console.log(`Message from user ${userId}: ${message}`);
  });
});
