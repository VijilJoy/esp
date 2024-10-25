// server.js
const WebSocket = require("ws");
const express = require("express");
const app = express();
const port = process.env.X_ZOHO_CATALYST_LISTEN_PORT || 3000;
const server = new WebSocket.Server({
  port: 8081,
});
app.get("/", (req, res) => {
  res.send("hello");
});
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  server.on("connection", (ws) => {
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
});
