import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

let io: SocketIOServer;

export const initSocketIO = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: ["https://hyra-six.vercel.app", "http://localhost:5173", "http://localhost:3000"],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Join a room based on userId for targeted notifications
    socket.on("join", (userId: string) => {
      socket.join(userId);
      console.log(`Socket ${socket.id} joined room ${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
