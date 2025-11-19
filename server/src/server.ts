import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app"; // your express app
import redisClient from "./client";

export default async function startServer() {
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

    socket.on("joinTeam" , (teamId : string)=>{
      socket.join(`team:${teamId}`)
    })

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  // Redis subscriber
  const subscriber = redisClient.duplicate();
  await subscriber.connect();

  await subscriber.subscribe("document:new", (msg) => {
    console.log("New documnet emitted.")
    const { teamId, document } = JSON.parse(msg);
    io.to(`team:${teamId}`).emit("document:new", document);
  });

  await subscriber.subscribe("document:update", (msg) => {
    console.log("Update Document emitted.")
    const { teamId, document } = JSON.parse(msg);
    io.to(`team:${teamId}`).emit("document:update", document);
  });

  await subscriber.subscribe("document:delete", (msg) => {
    console.log("Delete Document emitted.")
    const { teamId, documentId } = JSON.parse(msg);
    io.to(`team:${teamId}`).emit("document:delete", documentId);
  });

  await subscriber.subscribe("team:activity", (msg) => {
    const { teamId, activity } = JSON.parse(msg);
    console.log("🔥 New activity for team:", teamId);
    io.to(`team:${teamId}`).emit("team:activity", activity);
  });

  
  await subscriber.subscribe("qna:new", (msg) => {
    const { teamId, qa ,senderId} = JSON.parse(msg);
    console.log("🔥 New QnA for team:", qa);
    io.to(`team:${teamId}`).emit("qna:new", {qa , senderId});
  });

  await subscriber.subscribe("team:remove" , (msg)=>{
    const {teamId, senderId , memberId} = JSON.parse(msg);
    console.log("New Removing event : " , memberId);
    io.to(`team:${teamId}`).emit("team:remove" , {senderId , memberId});
  })

  await subscriber.subscribe("team:join", (msg) => {
    const { teamId, member } = JSON.parse(msg);
    console.log("👥 New member joined team:", teamId);

    io.to(`team:${teamId}`).emit("team:join", member);
  });

  await subscriber.subscribe("team:delete", (msg) => {
    const { teamId } = JSON.parse(msg);
    console.log("Team Deleted:", teamId);

    io.to(`team:${teamId}`).emit("team:delete" , teamId);
  });
  

  httpServer.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
  });
}

(async () => {
  await startServer().catch((err) => {
    console.error("❌ Error starting server:",  err);
  });
})();


