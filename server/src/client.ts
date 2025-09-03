import { createClient } from "redis";

const client = createClient({
  username: "default",
  password: "1s6y3SW8VzyQ6EyVA62nUhso1ekKjgPT",
  socket: {
    host: "redis-13681.crce206.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 13681,
  },
});

client.on("error", (err) => console.error("Redis Client Error", err));

// Async function to connect once
export const connectRedis = async () => {
  if (!client.isOpen) {
    await client.connect();
    console.log("✅ Connected to Redis");
  }
};

export default client;