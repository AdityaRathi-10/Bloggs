import Notification from "@/models/Notification"
import dbConnect from "@/utils/dbConnet"
import mongoose from "mongoose"
import { NextResponse } from "next/server"

export async function GET(_: any, {params}: {params: {userId: string}}) {
    const {userId} = params

    await dbConnect()
    const notifications = await Notification.find({
        notifiedTo: new mongoose.Types.ObjectId(userId)
    }).sort({ createdAt: -1 })

    if(!notifications) {
        return NextResponse.json({success: true, message: "No notifications", status: 200})
    }

    return NextResponse.json({success: true, notifications, status: 200})
}