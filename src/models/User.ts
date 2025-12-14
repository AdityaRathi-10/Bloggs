import mongoose, { Schema, Document, Model } from "mongoose"
import { TPost } from "./Post"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from 'uuid';

export interface TUser extends Document {
    username: string
    email: string
    password: string
    profileImage?: string
    followers: TUser[]
    posts?: TPost[]
    wishlist?: TPost[]
    createdAt: Date
    isVerified: boolean
    verificationToken: string
}

const UserSchema: Schema<TUser> = new Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email should be unique"],
        match: [/.+\@.+\..+/, "please use a valid email address"]
    },
    password: {
        type: String,
    },
    profileImage: {
        type: String
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String
    }
})

UserSchema.pre("save", async function (next) {
    const hashedPassword = await bcrypt.hash(this.password, 10)
    this.password = hashedPassword
    this.verificationToken = uuidv4()
    next()
})

const User = (mongoose.models.User as Model<TUser>) || mongoose.model<TUser>("User", UserSchema)

export default User