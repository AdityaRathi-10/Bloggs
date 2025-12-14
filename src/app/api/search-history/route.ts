import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/utils/dbConnet";
import User from "@/models/User";
import SearchHistory from "@/models/SearchHistory";

export async function POST(request: NextRequest) {
    const { query } = await request.json()

    const session = await getServerSession(authOptions)

    await dbConnect()
    const user = await User.findById(session?.user._id)

    if(!user) {
        return NextResponse.json({success: false, message: "User not found", status: 404})
    }

    const existingQuery = await SearchHistory.findOne({
        query,
        user: user._id
    })

    if(existingQuery) {
        return
    }

    const addQuery = await SearchHistory.create({
        query,
        user: user._id
    })

    console.log("A", addQuery)

    if(!addQuery) {
        return NextResponse.json({success: false, message: "Error adding new query in search history", status: 500})
    }

    return NextResponse.json({success: true, message: "New query added", status: 201})
}

export async function GET() {
    const session = await getServerSession(authOptions)

    await dbConnect()
    const user = await User.findById(session?.user._id)

    if(!user) {
        return NextResponse.json({success: false, message: "User not found", status: 404})
    }
    console.log("se", session?.user._id)
    const searchHistory = await SearchHistory.find({
        user: user._id
    }).sort({ createdAt: -1 }).select("query -_id")

    return NextResponse.json({success: true, searchHistory, status: 200})
}