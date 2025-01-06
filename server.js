const { WebSocketServer } = require('ws');

// Create a WebSocket server
const wss = new WebSocketServer({ port: 8080 }); // Port 8080, or attach to an HTTP server

// Map to store WebSocket connections with associated user IDs
const clients = new Map();

wss.on('connection', (socket) => {
  console.log('New client connected');

  // Listen for messages from the client
  socket.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message);

      if (parsedMessage.type === 'register') {
        // Register the client with a user ID
        const userId = parsedMessage.userId;
        clients.set(userId, socket);
        console.log(`User registered: ${userId}`);
      } else if (parsedMessage.type === 'data') {
        // Handle data messages and send response to the specific user
        const { userId, payload } = parsedMessage;
        const targetSocket = clients.get(userId);

        if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
          targetSocket.send(JSON.stringify({ type: 'response', payload }));
          console.log(`Response sent to user ${userId}`);
        } else {
          console.warn(`No active connection for user: ${userId}`);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  socket.on('close', () => {
    console.log('Client disconnected');

    // Remove disconnected client from the clients map
    for (const [userId, clientSocket] of clients.entries()) {
      if (clientSocket === socket) {
        clients.delete(userId);
        console.log(`User removed: ${userId}`);
        break;
      }
    }
  });
});

console.log('WebSocket server running on port 8080');
