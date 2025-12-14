import Post from "@/models/Post"
import User from "@/models/User"
import { uploadImageToCloud } from "@/utils/cloudinary"
import dbConnect from "@/utils/dbConnet"
import { getToken } from "next-auth/jwt"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    
    const formData = await request.formData()
    const editPost = request.nextUrl.searchParams.get("edit")

    const token = await getToken({ req: request, secret: process.env.ACCESS_TOKEN_SECRET })

    const title = formData.get("title")
    const description = formData.get("description")
    const file = formData?.get("file")
    const tags = formData?.get("tags") as string

    const tagsArray = tags.split(",")

    let result;
    if(file) {
        result = await uploadImageToCloud(file as File)
        
        if(!result) {
            return NextResponse.json({ success: false, message: "Image upload failed" }, {status: 500})
        }
    }

    await dbConnect()

    const user = await User.findOne({
        email: token?.email
    })

    if(!user) {
        return NextResponse.json({ success: false, message: "User not found" }, {status: 404})
    }

    if(editPost) {
        await Post.findByIdAndUpdate(editPost, {
            $set: {
                title,
                description,
                image: result?.secure_url,
                tags: tagsArray
            }
        })
        return NextResponse.json({  success: true, message: "Post edited successfully" }, {status: 200})
    }

    const post = await Post.create({
        title,
        description,
        image: result?.secure_url,
        tags: tagsArray,
        createdBy: user._id
    })

    user.posts?.push(post)
    await user.save()

    if(!post) {
        return NextResponse.json({ success: false, message: "Post creation failed" }, {status: 500})       
    }

    return NextResponse.json({  success: true, message: "Post created successfully" }, {status: 201})
}