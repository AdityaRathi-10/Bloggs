import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import User from "@/models/User";
import Post from "@/models/Post";
import dbConnect from "@/utils/dbConnet";
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import mongoose from "mongoose";

export async function DELETE(request: NextRequest, {params}: {params: {postId: string}}) {
    const {postId} = params
    const queryParams = request.nextUrl.searchParams
    
    const userId = queryParams.get("userId")
    const session = await getServerSession(authOptions)

    if(!session?.user._id) {
        return NextResponse.json({ success: false, message: "User is unauthenticated" }, { status: 400 })
    }

    await dbConnect()
    try {
        const postDeleted = await Post.findByIdAndDelete(new mongoose.Types.ObjectId(postId))
    
        if(!postDeleted) {
            return NextResponse.json({ success: false, message: "Error deleting post" }, { status: 400 })
        }
    
        const deleteUserPost = await User.findByIdAndUpdate(userId, {
            $pull: {
                posts: postDeleted._id
            }
        })
    
        if(!deleteUserPost) {
            return NextResponse.json({ success: false, message: "Error deleting post" }, { status: 404 })
        }

        return NextResponse.json({ success: true, message: "Post deleted successfully" }, { status: 200 })
    } catch (error) {
        console.error("Error", error)
        return NextResponse.json({ success: false, message: error }, { status: 500 })
    }
}