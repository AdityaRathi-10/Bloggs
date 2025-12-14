import mongoose, { Schema, Document, Model } from "mongoose"
import { TComment } from "./Comment"
import { TUser } from "./User"

export interface TPost extends Document {
    title: string
    description: string
    image?: string
    tags?: string[],
    likes?: number,
    likedBy?: TUser[],
    dislikes?: number,
    dislikedBy?: TUser[],
    comments?: TComment[],
    views?: TUser[],
    createdBy?: TUser
    createdAt: Date
}

const PostSchema: Schema<TPost> = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
    },
    tags: {
        type: [String]
    },
    comments:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    views: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }, 
    likes: {
        type: Number,
        default: 0
    },
    likedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    dislikes: {
        type: Number,
        default: 0
    },
    dislikedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Post = (mongoose.models.Post as Model<TPost>) || mongoose.model("Post", PostSchema)

export default Post