import Comment from "@/models/Comment";
import Post from "@/models/Post";
import User from "@/models/User"
import dbConnect from "@/utils/dbConnet";
import mongoose from "mongoose";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, {params}: {params: {commentId: string}}) {
    const token = await getToken({ req: request })
    const {postId} = await request.json()

    await dbConnect()

    const user = await User.findOne({
        email: token?.email
    })

    if(!user) {
        return NextResponse.json({ success: false, message: "User not found", status: 404 })
    }

    const post = await Post.findById(postId)

    if(!post) {
        return NextResponse.json({ success: false, message: "Post not found", status: 404 })
    }

    post.comments = post.comments?.filter((commentId) => String(commentId) !== params.commentId)
    await post.save();

    const deletedComment = await Comment.findByIdAndDelete(params.commentId)

    if(!deletedComment) {
        return NextResponse.json({ success: false, message: "Error deleting comment", status: 400 })
    }

    return NextResponse.json({ success: true, message: "Comment deleted successfully", status: 201 })
}