const { WebSocketServer } = require('ws'); // Import WebSocketServer

// Create the WebSocket server
const wss = new WebSocketServer({ port: 8080 }); // Port 8080 or attach to an HTTP server

// Map to associate user IDs with WebSocket connections
const clients = new Map();

wss.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message);

      if (parsedMessage.type === 'register') {
        // Register the client with a user ID
        const userId = "asad";
        clients.set(userId, socket);
        console.log(`User registered: ${userId}`);
      } else if (parsedMessage.type === 'data') {
        // Handle data and send it to the specific user
        const { userId, payload } = parsedMessage;

        // Get the target socket for this user
        const targetSocket = clients.get(userId);

        if (targetSocket && targetSocket.readyState === targetSocket.OPEN) {
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

    // Remove the client from the map
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
