import User from "@/models/User"
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get("token")

    if(token) {
        const user = await User.findOne({
            verificationToken: token
        })

        if(!user) {
            return NextResponse.json({ success: false, message: "User not found", status: 404 })
        }

        if(user.verificationToken === token) {
            user.isVerified = true
            await user.save()

            return NextResponse.json({ success: true, message: "Email verified successfully", user, status: 200 })
        }

        const timeElapsed = Number(Date.now() - new Date(user.createdAt.toString()).getTime()) / 1000
        if(timeElapsed > 300) {
            
        }
        if(timeElapsed > 3600) {
            await user.deleteOne()
        }
    }


    return NextResponse.json({ success: false, message: "Token not found", status: 404 })
}