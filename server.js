const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('message', (message) => {
    console.log(`Received: ${message}`);
    const data = JSON.parse(message);

    // Broadcast data to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });

  socket.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server running on port 8080');
