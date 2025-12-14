import Post from "@/models/Post";
import dbConnect from "@/utils/dbConnet";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import * as cheerio from 'cheerio';
import { tags } from "@/lib/tags.json"

export async function GET(request: NextRequest) {
    const query: string = request.nextUrl.searchParams.get("query") as string

    if(query.length === 0) {
        return NextResponse.json({ success: true, recommendations: [], status: 200 })
    }
    
    await dbConnect()
    const posts = await Post.find({
        $or: [
            { title: { $regex: query, $options: "i" } },
            { tags: { $elemMatch: { $regex: query, $options: "i" } } }
        ]
    })
    .select("title tags createdBy")
    .limit(10)

    const authors = await User.find({
        username: { $regex: query, $options: "i" }
    })
    .select("username")
    .limit(10)

    const recommendations = new Set<string>()

    posts.forEach((post) => {
        const $ = cheerio.load(post.title);
        if($.text().toLowerCase().includes(query.toLowerCase())) {
            recommendations.add($.text())
        }
        post.tags?.forEach((tag) => {
            if(tag.toLowerCase().includes(query.toLowerCase())) {
                recommendations.add(tag)
            }
        })
        authors.forEach((author) => {
            if(author.username.toLowerCase().includes(query.toLowerCase())) {
                recommendations.add(author.username)
            }
        })
    })
    tags.forEach((tag) => {
        if(tag.toLowerCase().includes(query.toLowerCase())) {
            recommendations.add(tag)
        }
    })

    return NextResponse.json({ success: true, recommendations: [...recommendations], status: 200 })
}