import express from "express"
import "dotenv/config";
import cors from "cors";
import connectDB from "./lib/db.js";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

const app = express();

const PORT = process.env.PORT || 3000

// initialize socket.io server

export const io = new Server(server, {
    cors: {origin: "*"}
})

// store online users

export const userSocketMap = {}; //{userId: socketId}

// socket.io connection handler

io.on("connection", (socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User connected", userId);

    if(userId){
        userSocketMap[userId] = socket.id;
    }

    // emit online to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("Disconnect", ()=>{
        console.log("User disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })

})

// Middleware Setup
app.use(express.json());
app.use(cors());

// database connection

connectDB();


// Route setup

app.use("/api/status", (req, res)=>{
    res.send("Server is live");
})

app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

app.listen(PORT, ()=>{
    console.log(`Server is listen on ${PORT}`);
})