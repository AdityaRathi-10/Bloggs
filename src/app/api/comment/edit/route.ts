import Comment from "@/models/Comment";
import User from "@/models/User"
import dbConnect from "@/utils/dbConnet";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const token = await getToken({ req: request })

    const {content, commentId} = await request.json()
    await dbConnect()

    const user = await User.findOne({
        email: token?.email
    })

    if(!user) {
        return NextResponse.json({ success: false, message: "User not found", status: 404 })
    }

    const editedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content,
                isEdited: true
            }
        }
    )

    if(!editedComment) {
        return NextResponse.json({ success: false, message: "Error editing comment", status: 400 })
    }

    return NextResponse.json({ success: true, message: "Comment edited successfully", status: 201 })
}