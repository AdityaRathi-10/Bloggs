import Notification from "@/models/Notification";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { notificationId } = await request.json()

    const notification = await Notification.findByIdAndUpdate(notificationId, {
        $set: {
            read: true
        }
    })

    if(!notification) {
        return NextResponse.json({success: false, message: "Notification not found", status: 404})
    }

    return NextResponse.json({success: true, message: "Notification read status updated", status: 200})
}