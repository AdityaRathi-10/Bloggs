import Comment from "@/models/Comment"
import Notification from "@/models/Notification"
import Post from "@/models/Post"
import SearchHistory from "@/models/SearchHistory"
import User from "@/models/User"
import dbConnect from "@/utils/dbConnet"
import { NextResponse } from "next/server"

export async function DELETE(_: any, {params}: {params: {userId: string}}) {
    const {userId} = params

    await dbConnect()
    const deletedUser = await User.findByIdAndDelete(userId)
    await Post.deleteMany({
        createdBy: deletedUser?._id
    })
    await Notification.deleteMany({
        notifiedTo: deletedUser?._id
    })
    await SearchHistory.deleteMany({
        user: deletedUser?._id
    })
    await Comment.deleteMany({
        commentedBy: deletedUser?._id
    })

    return NextResponse.json({ success: true, message: "Account deleted successfully", status: 200 })
}