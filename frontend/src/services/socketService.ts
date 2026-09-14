import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (userId: string) => {
  if (socket) return socket;

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  socket = io(API_URL, {
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("Connected to socket server:", socket?.id);
    socket?.emit("join", userId);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from socket server");
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
