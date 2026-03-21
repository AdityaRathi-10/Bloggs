import User from "@/models/User";
import dbConnect from "@/utils/dbConnet";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const username = request.nextUrl.searchParams.get("username");
    if (!username) {
        return NextResponse.json(
            { success: false, message: "Username is not provided" },
            { status: 400 }
        )
    }
    
    await dbConnect();

    try {
        if(username) {
            const user = await User.findOne({ 
                username: { $regex: `^${username}$`, $options: "i" }
            }).select("username").lean();

            if(user) {
                return NextResponse.json(
                    { success: false, message: "Username is already taken" },
                    { status: 200 }
                )
            }

            return NextResponse.json(
                { success: true, message: "Username is available" },
                { status: 200 }
            )
        }
    } catch (error) {
        void error
        return NextResponse.json(
            { success: false, message: "Error checking username" },
            { status: 500 }
        )
    }
}