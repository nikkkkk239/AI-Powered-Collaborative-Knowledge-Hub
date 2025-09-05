import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../stores/authStore"; 

const SOCKET_URL = "http://localhost:5000";

type SocketContextType = Socket | null;

const SocketContext = createContext<SocketContextType>(null);

interface Props {
  children: JSX.Element | JSX.Element[];
}

export const SocketProvider = ({ children }: Props) => {
  const [socket, setSocket] = useState<SocketContextType>(null);
  const { user } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (user && user.teamId) {
      // if socket already exists, reuse it
      if (!socketRef.current) {
        socketRef.current = io(SOCKET_URL, {
          transports: ["websocket"],
          autoConnect: false, // 👈 prevent auto connect
        });
      }

      const socketInstance = socketRef.current;

      if (!socketInstance.connected) {
        socketInstance.connect();
      }

      setSocket(socketInstance);

      // prevent duplicate listeners
      socketInstance.off("connect");
      socketInstance.off("disconnect");

      socketInstance.on("connect", () => {
        console.log("✅ Connected to socket:", socketInstance.id);
        socketInstance.emit("joinTeam", user.teamId);
      });

      socketInstance.on("disconnect", () => {
        console.log("❌ Disconnected from socket");
      });

      return () => {
        // clear listeners but keep socketRef alive for reuse
        socketInstance.off("connect");
        socketInstance.off("disconnect");
      };
    } else {
      // if user logs out or has no team
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
    }
  }, [user?.teamId]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export function useSocket() {
  return useContext(SocketContext);
}
