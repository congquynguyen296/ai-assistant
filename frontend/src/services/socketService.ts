import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (userId: string) => {
  // Sử dụng chung VITE_API_BASE_URL giống Axios, sau đó cắt bỏ /api/v1 để lấy domain gốc
  const rawUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
  const API_URL = rawUrl.replace("/api/v1", "");

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
