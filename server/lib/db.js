import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`)
        console.log("Database is connected")
    } catch (error) {
        console.log("Database Connection Error", error);
    }
}

export default connectDB;