import dotenv from "dotenv";
dotenv.config();
import http from "http";
import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import { pub, sub, REDIS_CHANNEL, INSTANCE_NAME } from "./redis.js";
import { saveBoard, getLatestBoard } from "./db.js";   // ⬅️ IMPORTANT

const { PORT = 8080 } = process.env;

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", instance: INSTANCE_NAME });
});

const server = http.createServer(app);

// WebSocket server
const wss = new WebSocketServer({ server, path: "/ws" });

const clients = new Set();

wss.on("connection", async (socket) => {
  console.log(`[${INSTANCE_NAME}] New WebSocket connection`);
  clients.add(socket);

  // ⬅️ 1️⃣ When a client connects, load last saved board
  const latest = await getLatestBoard();
  if (latest) {
    socket.send(JSON.stringify({ type: "load", data: latest }));
  }

  socket.on("message", async (data) => {
    let message;

    try {
      message = JSON.parse(data.toString());
    } catch {
      console.warn("Non-JSON WebSocket message ignored");
      return;
    }

    message.source = INSTANCE_NAME;
    const payload = JSON.stringify(message);

    // ⬅️ 2️⃣ Save the latest board state IF message is a tldraw update
    if (message.type === "patch" || message.type === "sync") {
      await saveBoard(message);
    }

    // Broadcast locally
    for (const client of clients) {
      if (client.readyState === client.OPEN) {
        client.send(payload);
      }
    }

    // Publish to other nodes
    await pub.publish(REDIS_CHANNEL, payload);
  });

  socket.on("close", () => {
    clients.delete(socket);
  });
});

// Redis → local WebSocket clients
sub.on("message", (_channel, message) => {
  for (const client of clients) {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  }
});

server.listen(PORT, () => {
  console.log(`[${INSTANCE_NAME}] Whiteboard server listening on port ${PORT}`);
});
