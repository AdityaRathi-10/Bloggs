import Notification from "@/models/Notification";
import dbConnect from "@/utils/dbConnet";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function PATCH(request: NextRequest) {
    const session = await getServerSession(authOptions)

    await dbConnect()

    await Notification.updateMany(
        { notifiedTo: session?.user._id},
        { $set: { read: true } }
    )

    return NextResponse.json({ success: true, message: "All notification marked as read", status: 200 })
}