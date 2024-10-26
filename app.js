const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const cors = require("cors");
const port = process.env.PORT || 3000; // Use environment variable or default to 3000

const app = express();
app.use(express.json());
app.use(cors());

let lastData = {};

// Create an HTTP server
const server = http.createServer(app);

// Set up WebSocket server using the same HTTP server
const wss = new WebSocket.Server({ server });

app.post("/data", (req, res) => {
  const data = req.body; // Get the data from the request body
  res.send(data); // Send back the same data as response
  console.log(data);

  // Send the data to all WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(data)); // Send data to WebSocket clients
      } catch (e) {
        console.error("Error sending message to client:", e);
      }
    }
  });
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
    const val = JSON.parse(message); // Parse incoming message
    lastData = val; // Store the last received data
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(val));
      }
    });
    console.log(val); // Log the received value
  } catch (e) {
    console.error("Error parsing JSON:", e); // Log any JSON parsing errors
  }
};

wss.on("connection", (ws) => {
  console.log("New Client connected");

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
    handleMsg(message); // Handle incoming messages
  });

  ws.on("close", () => {
    clearInterval(keepAliveInterval);
    console.log("Client disconnected");
  });
});

// Start the HTTP server and WebSocket server on the same port
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
