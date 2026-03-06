import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}

mongoose.connect(process.env.MONGODB_URI!).then(() => {
  console.log("Atlas cluster awake ✅");
});

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
        throw new Error(`Error connecting to database: ${error}`)
    }
}

export default dbConnect