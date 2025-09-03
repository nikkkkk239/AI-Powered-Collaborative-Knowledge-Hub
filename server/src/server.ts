import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app"; // your express app
import redisClient from "./client";

async function startServer() {
  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173", // your React frontend
      methods: ["GET", "POST"],
    },
  });

  // Listen for frontend connections
  io.on("connection", (socket) => {
    console.log("⚡ Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  // Redis subscriber
  const subscriber = redisClient.duplicate();
  await subscriber.connect();

  await subscriber.subscribe("document:new", (msg) => {
    io.emit("document:new", JSON.parse(msg));
  });

  await subscriber.subscribe("team:activity", (msg) => {
    io.emit("team:activity", JSON.parse(msg));
  });

  httpServer.listen(5000, () => {
    console.log("🚀 Server running on http://localhost:5000");
  });
}

startServer().catch((err) => {
  console.error("❌ Error starting server:", err);
});
