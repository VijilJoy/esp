const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const cors = require("cors");
const port = process.env.PORT || 3000;

let lastData = {};

const app = express();
app.use(express.json());
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.post("/data", (req, res) => {
  const data = req.body;
  res.send(data);
  console.log(data);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(data));
      } catch (e) {
        console.error("Error sending message to client:", e);
      }
    }
  });
  res.status(200);
});
app.post("/mobileData", (req, res) => {
  const data = req.body;
  res.send(data);
  console.log(data);
  lastData = data;
  res.status(200);
});

app.get("/data", (req, res) => {
  if (lastData) {
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(lastData));
    res.status(200);
  } else {
    res.send("null");
    res.status(400);
  }
});

const handleMsg = (message) => {
  try {
    const val = JSON.parse(message);
    lastData = val;
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(val));
      }
    });
    console.log(val);
  } catch (e) {
    console.error("Error parsing JSON:", e);
  }
};

wss.on("connection", (ws) => {
  console.log("New Client");

  // Keep-alive ping every 30 seconds
  const keepAliveInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 30000);

  ws.on("pong", () => {
    console.log("Pong received from client");
  });

  ws.on("message", (message) => {
    handleMsg(message);
  });

  ws.on("close", () => {
    clearInterval(keepAliveInterval);
    console.log("Client disconnected");
  });
});

server.listen(port, () => console.log(`Server running: port ${port}`));
