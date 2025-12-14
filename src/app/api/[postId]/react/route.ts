import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/utils/dbConnet";
import Post from "@/models/Post";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import Notification from "@/models/Notification";

export async function POST(
    request: NextRequest,
    { params }: { params: { postId: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
        return NextResponse.json(
            { success: false, message: "User not found" },
            { status: 404 }
        );
    }

    await dbConnect();
    const post = await Post.findById(params.postId);
    if (!post) {
        return NextResponse.json(
            { success: false, message: "Post not found" },
            { status: 404 }
        );
    }

    const { reaction } = await request.json();

    post.likedBy = post.likedBy?.filter((id) => id.toString() !== user.id.toString());
    post.dislikedBy = post.dislikedBy?.filter((id) => id.toString() !== user.id.toString());

    switch (reaction) {
        case "like":
            await Notification.create({
                type: "like",
                notifiedTo: post.createdBy,
                notifiedBy: session.user._id,
                notifiedByUsername: session.user.username,
                post: post.id
            })
            post.likedBy?.push(user.id);
            break;
        case "dislike":
            post.dislikedBy?.push(user.id);
            break;
    }

    post.likes = post.likedBy?.length;
    post.dislikes = post.dislikedBy?.length;
    await post.save();

    return NextResponse.json({
        success: true,
        message: reaction,
        likes: post.likes,
        dislikes: post.dislikes,
        liked: post.likedBy?.includes(user.id),
        disliked: post.dislikedBy?.includes(user.id),
    });
}
