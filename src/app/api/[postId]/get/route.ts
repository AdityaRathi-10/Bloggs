import Post from "@/models/Post";
import dbConnect from "@/utils/dbConnet";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, {params}: {params: {postId: string}}) {
    const {postId} = params

    await dbConnect()
    const editPost = await Post.findById(postId).select("title description image tags")

    if(!editPost) {
        return NextResponse.json({ success: false, message: "Post not found", status: 200 })
    }

    return NextResponse.json({ success: true, editPost, status: 200 })
} 