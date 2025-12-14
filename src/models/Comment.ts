import mongoose, { Schema, Document, Model } from "mongoose"
import { TUser } from "./User"
import { TPost } from "./Post"

export interface TComment extends Document {
    content: string
    isEdited: boolean
    commentedBy: TUser
    commentPost: TPost
    createdAt: Date
}

const CommentSchema: Schema<TComment> = new Schema({
    content: {
        type: String,
        required: true
    },
    isEdited: {
        type: Boolean,
        default: false
    },
    commentedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    commentPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Comment = (mongoose.models.Comment as Model<TComment>) || mongoose.model<TComment>("Comment", CommentSchema)

export default Comment