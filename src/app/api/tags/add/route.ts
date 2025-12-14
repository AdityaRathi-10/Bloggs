import { NextRequest, NextResponse } from "next/server";
import fs from "fs"
import path from "path";

const filePath = path.join(process.cwd(), 'src/lib/tags.json')

export async function POST(request: NextRequest) {
    console.log("filePath", filePath)
    const { newTag } = await request.json()

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    if(data.tags.some((tag: string) => tag === newTag)) {
        return NextResponse.json({ success: false, message: 'Tag already exists', status: 400 })
    }

    data.tags.push(newTag)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4))
    return NextResponse.json({ success: true, message: 'New tag added 🎉', status: 200 })

}