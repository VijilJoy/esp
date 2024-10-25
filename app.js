// server.js
const WebSocket = require("ws");
const port = process.env.port || 3000;

// Set up WebSocket server
const wss = new WebSocket.Server({ port });

wss.on("connection", (ws) => {
  console.log("Client connected");

  // Keep-alive ping every 30 seconds
  const keepAliveInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping(); // Sends a ping to the client to keep the connection active
    }
  }, 30000);

  ws.on("pong", () => {
    console.log("Pong received from client");
  });

  ws.on("message", (message) => {
    console.log(`Received: ${message}`);
    ws.send(`Server received: ${message}`);
  });

  ws.on("close", () => {
    clearInterval(keepAliveInterval);
    console.log("Client disconnected");
  });
});

console.log(`WebSocket server listening on port ${port}`);
