import Image from "next/image";
import {
    Calendar,
    User
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import dbConnect from "@/utils/dbConnet";
import { formatDate } from "@/utils/formatDate";
import Post, { TPost } from "@/models/Post";
import Title from "@/components/Title";
import Description from "@/components/Description";
import { TComment } from "@/models/Comment";
import CommentBox from "@/components/CommentBox";
import CommentList from "@/components/CommentList";
import Reactions from "@/components/Reactions";
import UserModel from "@/models/User"
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import Link from "next/link";
import Bookmark from "@/components/Bookmark"
import { redirect } from "next/navigation";

require("@/models/Comment")
require("@/models/User")

// type TCommenters = {
//     username: string
//     profileImage: string
//     userId: string
// }

export default async function BlogPostPage({ params }: { params: { postId: string } }) {
    await dbConnect()
    const {postId} = params
    const post: TPost | null = await Post.findById(postId)
        .populate("createdBy")
        .populate({
            path: "comments",
            populate: {
                path: "commentedBy",
                model: "User",
            }
        })

    if (!post) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Post not found</h1>
                    <p className="text-slate-600 dark:text-slate-400">The post you're looking for doesn't exist.</p>
                </div>
            </div>
        );
    }

    const session = await getServerSession(authOptions)

    const user = await UserModel.findOne({
        email: session?.user.email
    })

    if(!user) {
        return redirect("/sign-up")
    }

    const alreadyViewed = await Post.findOne({
        _id: postId,
        views: { $in: [user.id] }
    })

    if(!alreadyViewed) {
        await Post.findByIdAndUpdate(postId, {
            $push: { views: user.id }
        })
    }

    const likedAlready = post.likedBy?.find((userId) => String(userId) === user.id)
    const dislikedAlready = post.dislikedBy?.find((userId) => String(userId) === user.id)

    const addedToWishlist = user.wishlist?.find((post_Id) => String(post_Id) === post.id)

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <article className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    {/* Title Section */}
                    <div className="px-6 sm:px-8 lg:px-12 pt-8 sm:pt-12">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags?.map((tag) => (
                                <Link
                                    key={tag}
                                    href={`/posts?category=${tag.toLowerCase()}`}
                                >
                                    <Badge key={tag} variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                        {tag}
                                    </Badge>
                                </Link>
                            ))}
                        </div>

                        <Title
                            title={post.title}
                            className={"text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-slate-100 leading-tight mb-6"}
                        />
                    </div>

                    {/* Author & Meta Info */}
                    <div className="px-6 sm:px-8 lg:px-12 mb-8">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <Link href={`/user/${post.createdBy?.id}`}>
                                    <Avatar className="w-12 h-12">
                                        <AvatarImage src={post.createdBy?.profileImage} alt={post.createdBy?.username} />
                                        <AvatarFallback>
                                            <User className="w-6 h-6" />
                                        </AvatarFallback>
                                    </Avatar>
                                </Link>
                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                    {post.createdBy?.username}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(post.createdAt.toString())}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Bookmark 
                                    postId={postId}
                                    addedToWishlist={addedToWishlist ? true : false}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Featured Image */}
                    {post.image && (
                        <div className="px-6 sm:px-8 lg:px-12 mb-8">
                            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                                <Image
                                    src={post.image}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="px-6 sm:px-8 lg:px-12 mb-8">
                        <div
                            className=""
                        />
                        <Description
                            description={post.description}
                            className={"prose prose-slate dark:prose-invert max-w-none prose-lg prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-li:text-slate-700 dark:prose-li:text-slate-300"}
                        />
                    </div>

                    {/* Actions */}
                    <div className="px-6 sm:px-8 lg:px-12 mb-8">
                        <Separator className="mb-6" />
                        <div className="flex items-center gap-4">
                            <Reactions 
                                likes={post.likes!}
                                dislikes={post.dislikes!}
                                postId={postId}
                                likedAlready={likedAlready ? true : false}
                                dislikedAlready={dislikedAlready ? true : false}
                            />
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="px-6 sm:px-8 lg:px-12 pb-8">
                        <Separator className="mb-6" />
                        <div className="space-y-6">

                            <CommentBox />

                            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                                Comments ({post.comments?.length})
                            </h3>
                            {/* Comments List */}
                            <div className="space-y-4">
                                {post.comments?.map((comment: TComment) => (
                                    <CommentList
                                        key={comment.id}
                                        id={comment.id}
                                        commentedBy={{
                                            id: comment.commentedBy?.id,
                                            username: comment.commentedBy?.username,
                                            profileImage: comment.commentedBy?.profileImage
                                        }}
                                        content={comment.content}
                                        createdAt={String(comment.createdAt)}
                                        isAuthor={user.id === String(comment.commentedBy.id)}
                                        isEdited={comment.isEdited}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
}