import Notification from "@/models/Notification";
import User from "@/models/User";
import dbConnect from "@/utils/dbConnet";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, {params}: {params: {userId: string}}) {
    const {userId} = params
    const {follower, followStatus} = await request.json()

    dbConnect()
    const user = await User.findById(userId)

    if(!user) {
        return NextResponse.json({success: false, message: "User not found"}, {status: 404})
    }

    const followerUser = await User.findOne({email: follower})
    
    if(!followerUser) {
        return NextResponse.json({success: false, message: "Kindly signup"}, {status: 400})
    }

    if(followStatus === "true") {
        user.followers.push(followerUser)
        await Notification.create({
            type: "follow",
            notifiedTo: user.id,
            notifiedBy: followerUser.id,
            notifiedByUsername: followerUser.username
        })
    } else {
        user.followers = user.followers.filter((follower) => String(follower) !== followerUser.id)
        await Notification.create({
            type: "unfollow",
            notifiedTo: user.id,
            notifiedBy: followerUser.id,
            notifiedByUsername: followerUser.username
        })
    }
    await user.save()

    revalidatePath(`/user/${userId}`)

    return NextResponse.json({ success: true, message: followStatus === "true" ? `Followed ${user.username}` : `Unfollowed ${user.username}` }, { status: 200 });
}