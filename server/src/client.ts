import { createClient } from "redis";
import dotenv from "dotenv"

dotenv.config();

const client = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD, // move to process.env.REDIS_PASSWORD in prod!
  socket: {
    host: process.env.REDIS_HOST,
    port: 13681,
    reconnectStrategy: (retries) => {
      console.warn(`🔄 Redis reconnect attempt #${retries}`);
      return Math.min(retries * 100, 5000); // retry up to 5s
    },
    keepAlive: true, 
  },
});

// ---- Event logging ----
client.on("connect", () => console.log("🟡 Connecting to Redis..."));
client.on("ready", () => console.log("✅ Redis client ready"));
client.on("end", () => console.warn("⚠️ Redis connection closed"));
client.on("reconnecting", () => console.log("🔄 Redis reconnecting..."));
client.on("error", (err) => console.error("❌ Redis Client Error:", err));

let heartbeatInterval: NodeJS.Timeout | null = null;

// Async connect function
export const connectRedis = async () => {
  if (!client.isOpen) {
    try {
      await client.connect();
      console.log("🚀 Connected to Redis");
      if (!heartbeatInterval) {
        heartbeatInterval = setInterval(async () => {
          try {
            await client.ping();
            console.log("💓 Redis heartbeat OK");
          } catch (err) {
            console.error("💔 Redis heartbeat failed:", err);
          }
        }, 30000); 
      }
    } catch (err) {
      console.error("❌ Failed to connect to Redis:", err);
    }
  }
};

export default client;
