import mongoose from "mongoose";
import { MONGODB_URL } from "./dotenv.config.js";


const dbConfig=async()=>{
    try {
        const mongoUrl = MONGODB_URL ;
        await mongoose.connect(mongoUrl);
        console.log("Server connected to mongodb successfully");
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
        throw error; 
    }
}

export default dbConfig;