import mongoose from "mongoose";
import logger from "./logger";

type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}

async function dbConnect() {
    if (connection.isConnected) {
        logger.log("Already connected to database")
        return
    }
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || "")
        connection.isConnected = db.connections[0].readyState
        logger.log("Database connected successfully")
    } catch (error) {
        throw new Error(`Error connecting to database: ${error}`)
    }
}

export default dbConnect