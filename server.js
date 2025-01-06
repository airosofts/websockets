const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8080 });

// Map to store WebSocket connections with associated user IDs
const clients = new Map();

wss.on('connection', (socket) => {
  console.log('New client connected');

  // Listen for initial message to associate the connection with a user ID
  socket.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message);

      if (parsedMessage.type === 'register') {
        // Register user ID with this socket
        const userId = parsedMessage.userId;
        clients.set(userId, socket);
        console.log(`User registered: ${userId}`);
      } else if (parsedMessage.type === 'data') {
        // Handle data sent by this user
        const { userId, payload } = parsedMessage;

        // Send the data back to the specific user only
        const targetSocket = clients.get(userId);
        if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
          targetSocket.send(JSON.stringify({ type: 'response', payload }));
        } else {
          console.warn(`Target socket not available for user: ${userId}`);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  socket.on('close', () => {
    console.log('Client disconnected');

    // Remove the client from the map
    for (const [userId, clientSocket] of clients.entries()) {
      if (clientSocket === socket) {
        clients.delete(userId);
        console.log(`User disconnected: ${userId}`);
        break;
      }
    }
  });
});

console.log('WebSocket server running on port 8080');
