import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./lib/db.js";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";
import http from "http";

const app = express();

// Create HTTP Server

const server = http.createServer(app);

// initialize socket.io server

export const io = new Server(server, {
  cors: { origin: "*" },
});

// store online users

export const userSocketMap = {}; //{userId: socketId}

// socket.io connection handler

io.on("connection", (socket) => {
  let userId = socket.handshake.query.userId;

  if (!userId) {
    return;
  }

  userId = userId.toString();

  userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Middleware Setup
app.use(express.json());
app.use(cors());

// database connection

connectDB();

// Route setup


app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

app.use("/", (req, res) => {
  res.send("Server is live");
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server is listen on ${PORT}`);
  });
}

// exported for vercel
export default server;
