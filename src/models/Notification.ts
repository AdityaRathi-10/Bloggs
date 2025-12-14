import mongoose, { Document, Model, Schema } from "mongoose";
import { TUser } from "./User";
import { TPost } from "./Post";

export interface TNotification extends Document {
    type: string
    read: boolean,
    notifiedTo: TUser,
    notifiedBy: TUser,
    notifiedByUsername: string,
    post: TPost,
    createdAt: Date,
}

const NotificationSchema: Schema<TNotification> = new Schema({
    type: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        required: true,
        default: false
    },
    notifiedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    notifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    notifiedByUsername: {
        type: String,
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Notification = (mongoose.models.Notification as Model<TNotification>) || mongoose.model<TNotification>("Notification", NotificationSchema)

export default Notification