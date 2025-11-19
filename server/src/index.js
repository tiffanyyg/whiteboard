import http from "http";
import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import { pub, sub, REDIS_CHANNEL, INSTANCE_NAME } from "./redis.js";

const {
  PORT = 8080,          // container/internal port
} = process.env;

const app = express();
app.use(cors());
app.use(express.json());

// Simple health endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", instance: INSTANCE_NAME });
});

// You could add REST endpoints here later if needed

const server = http.createServer(app);

// WebSocket server
const wss = new WebSocketServer({ server, path: "/ws" });

// Keep track of connected clients
const clients = new Set();

wss.on("connection", (socket) => {
  console.log(`[${INSTANCE_NAME}] New WebSocket connection`);
  clients.add(socket);

  socket.on("message", async (data) => {
    // data is expected to be a JSON string describing a drawing event
    let message;
    try {
      message = JSON.parse(data.toString());
    } catch {
      console.warn("Received non-JSON message, ignoring");
      return;
    }

    // Tag the message with this instance (optional, useful for debug)
    message.source = INSTANCE_NAME;

    const payload = JSON.stringify(message);

    // Broadcast locally (to all clients on this instance)
    for (const client of clients) {
      if (client.readyState === client.OPEN) {
        client.send(payload);
      }
    }

    // Publish to Redis so other instances can mirror the change
    await pub.publish(REDIS_CHANNEL, payload);
  });

  socket.on("close", () => {
    clients.delete(socket);
  });
});

// Forward messages coming from Redis to local clients
sub.on("message", (_channel, message) => {
  try {
    const parsed = JSON.parse(message);

    // Optionally ignore messages we originated ourselves
    // if (parsed.source === INSTANCE_NAME) return;

    for (const client of clients) {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    }
  } catch (err) {
    console.error("Failed to handle Redis message:", err);
  }
});

server.listen(PORT, () => {
  console.log(`[${INSTANCE_NAME}] Whiteboard server listening on port ${PORT}`);
});
