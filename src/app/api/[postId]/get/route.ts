import Post from "@/models/Post";
import dbConnect from "@/utils/dbConnet";
import { NextRequest, NextResponse } from "next/server";

type BlogPostPageProps = {
  params: Promise<{ postId: string }>;
};

export async function GET(request: NextRequest, {params}: BlogPostPageProps) {
    const {postId} = await params

    await dbConnect()
    const editPost = await Post.findById(postId).select("title description image tags")

    if(!editPost) {
        return NextResponse.json({ success: false, message: "Post not found", status: 200 })
    }

    return NextResponse.json({ success: true, editPost, status: 200 })
} 