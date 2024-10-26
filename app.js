// server.js
const { json } = require("express");
const WebSocket = require("ws");
const port = process.env.port || 3000;

// Set up WebSocket server
const wss = new WebSocket.Server({ port });

const handleMsg = (req, res) => {
  try {
    val = JSON.parse(req);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(val));
      }
    });
    console.log(val);
  } catch (e) {
    console.log("error parsing json");
  }
};

wss.on("connection", (ws) => {
  console.log("New Client");
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
    handleMsg(message, ws);
  });

  ws.on("close", () => {
    clearInterval(keepAliveInterval);
    console.log("Client disconnected");
  });
});

console.log(`WebSocket server listening on port ${port}`);
