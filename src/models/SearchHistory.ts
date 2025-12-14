import mongoose, { Document, Model, Schema } from "mongoose";
import { TUser } from "./User";
import { TPost } from "./Post";

export interface TSearchHistory extends Document {
    query: string
    user: TUser
    createdAt: Date
}

const SearchHistorySchema: Schema<TSearchHistory> = new Schema({
    query: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const SearchHistory = (mongoose.models.SearchHistory as Model<TPost>) || mongoose.model("SearchHistory", SearchHistorySchema)

export default SearchHistory