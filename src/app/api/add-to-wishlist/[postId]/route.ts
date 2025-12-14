import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import Post from "@/models/Post";
import dbConnect from "@/utils/dbConnet";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function POST(
    request: NextRequest,
    { params }: { params: { postId: string } }
) {
    const { postId } = params;
    const { isBookmarked } = await request.json()
    const session = await getServerSession(authOptions)

    await dbConnect();
    const user = await User.findById(session?.user._id)
    if(!user) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    const post = await Post.findById(postId)
    if(!post) {
        return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 })
    }
    
    try {
        const userAddToWishlist = await User.findById(user.id)
        
        if (!userAddToWishlist) {
            return NextResponse.json({ success: false, message: "Error adding post to wishlist" }, { status: 404 });
        }

        if(isBookmarked) {
            userAddToWishlist?.wishlist?.push(post.id)
            await userAddToWishlist.save()
            return NextResponse.json({ success: true, message: "Post added to wishlist" }, { status: 200 });
        }
        else {
            userAddToWishlist.wishlist = userAddToWishlist.wishlist?.filter((post_Id) => String(post_Id) !== post.id)
            await userAddToWishlist.save()
            return NextResponse.json({ success: true, message: "Post removed from wishlist" }, { status: 200 });
        }
    
    } catch (error) {
        console.error("Error", error);
        return NextResponse.json({ success: false, message: error }, { status: 500 });
    }
}