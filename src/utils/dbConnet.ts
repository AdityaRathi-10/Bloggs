import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}

async function dbConnect() {
    if (connection.isConnected) {
        console.log("Already connected to database")
        return
    }
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || "")
        connection.isConnected = db.connections[0].readyState
        console.log("Database connected successfully")
    } catch (error) {
        throw new Error("Error connecting to database")
    }
}

export default dbConnect