import Comment from "@/models/Comment";
import Notification from "@/models/Notification";
import Post from "@/models/Post";
import User from "@/models/User"
import dbConnect from "@/utils/dbConnet";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const token = await getToken({ req: request })

    const {content, postId} = await request.json()
    await dbConnect()

    const user = await User.findOne({
        email: token?.email
    })

    if(!user) {
        return NextResponse.json({ success: false, message: "User not found", status: 404 })
    }

    const newComment = await Comment.create({
        content,
        commentedBy: user._id
    })
    if(!newComment) {
        return NextResponse.json({ success: false, message: "Error adding comment", status: 400 })
    }
    const post = await Post.findById(postId)
    
    if(!post) {
        return NextResponse.json({ success: false, message: "Post doesn't exist", status: 400 })
    }

    await Notification.create({
        type: "comment",
        notifiedTo: post.createdBy,
        notifiedBy: user.id,
        notifiedByUsername: user.username,
        post: post.id
    })
    post.comments?.push(newComment)
    await post.save()

    return NextResponse.json({ success: true, message: "Comment added successfully", status: 201 })
}