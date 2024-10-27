// const express = require("express");
// const WebSocket = require("ws");
// const http = require("http");
// const cors = require("cors");
// const port = process.env.PORT || 8080;

// let lastData = {};

// const app = express();
// app.use(express.json());
// app.use(cors());
// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });

// app.post("/data", (req, res) => {
//   const data = req.body;
//   res.send(data);
//   console.log(data);

//   wss.clients.forEach((client) => {
//     if (client.readyState === WebSocket.OPEN) {
//       try {
//         client.send(JSON.stringify(data));
//       } catch (e) {
//         console.error("Error sending message to client:", e);
//       }
//     }
//   });
// });

// app.get("/data", (req, res) => {
//   if (lastData) {
//     res.setHeader("Content-Type", "application/json");
//     res.send(JSON.stringify(lastData));
//     res.status(200);
//   } else {
//     res.send("null");
//     res.status(400);
//   }
// });

// const handleMsg = (message) => {
//   try {
//     const val = JSON.parse(message);
//     lastData = val;
//     wss.clients.forEach((client) => {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(JSON.stringify(val));
//       }
//     });
//     console.log(val);
//   } catch (e) {
//     console.error("Error parsing JSON:", e);
//   }
// };

// wss.on("connection", (ws) => {
//   console.log("New Client");

//   // Keep-alive ping every 30 seconds
//   const keepAliveInterval = setInterval(() => {
//     if (ws.readyState === WebSocket.OPEN) {
//       ws.ping();
//     }
//   }, 30000);

//   ws.on("pong", () => {
//     console.log("Pong received from client");
//   });

//   ws.on("message", (message) => {
//     handleMsg(message);
//   });

//   ws.on("close", () => {
//     clearInterval(keepAliveInterval);
//     console.log("Client disconnected");
//   });
// });

// server.listen(port, () => console.log(`Server running on port ${port}`));

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());

let messages = []; // Store chat messages
let clients = []; // Store connected clients

// Route to handle new messages (send to all connected clients)
app.post("/send-message", (req, res) => {
  const { user, message } = req.body;
  if (user && message) {
    // Create a new message object
    const newMessage = { user, message, timestamp: new Date() };
    messages.push(newMessage);

    // Limit message history to 50 for memory management
    if (messages.length > 50) messages.shift();

    // Broadcast to all connected clients
    clients.forEach((client) =>
      client.res.write(`data: ${JSON.stringify(newMessage)}\n\n`)
    );

    res.status(200).json({ success: true });
  } else {
    res
      .status(400)
      .json({ success: false, error: "User and message are required." });
  }
});

// SSE route for clients to receive messages
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // Flush headers to establish SSE connection

  // Add client to the list
  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res,
  };
  clients.push(newClient);

  // Send current message history to the new client
  messages.forEach((msg) => res.write(`data: ${JSON.stringify(msg)}\n\n`));

  // Remove client when connection closes
  req.on("close", () => {
    clients = clients.filter((client) => client.id !== clientId);
    res.end();
  });
});

// Start the server
app.listen(port, () => {
  console.log(`SSE chat server running on http://localhost:${port}`);
});
