// server.js
const WebSocket = require("ws");
const express = require("express");
const app = express();
const port = process.env.X_ZOHO_CATALYST_LISTEN_PORT || 3000;

// Set up Express server
app.get("/", (req, res) => {
  res.send("hello");
});
const server = app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});

// Attach WebSocket server to the same port as Express
const wss = new WebSocket.Server({ server });
wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    console.log(`Received: ${message}`);
    // Echo the message back to the client
    ws.send(`Server received: ${message}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
