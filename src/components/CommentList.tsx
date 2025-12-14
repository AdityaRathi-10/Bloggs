"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Edit, MoreHorizontal, Reply, Save, Trash2, User } from "lucide-react";
import { formatDate } from "@/utils/formatDate";
import { useCallback, useState } from "react";
import { Input } from "./ui/input";
import axios from "axios";
import { toast } from "sonner";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";

interface Comment {
    id: string,
    commentedBy: {
        id: string
        username: string,
        profileImage: undefined | string
    },
    createdAt: string,
    content: string,
    isAuthor: boolean,
    isEdited: boolean
}

export default function CommentList({id, commentedBy, createdAt, content, isAuthor, isEdited}: Comment) {
    const [isEditing, setIsEditing] = useState(false)
    const [comment, setComment] = useState(content)
    const router = useRouter()
    const {postId} = useParams()
    const searchParams = useSearchParams()
    const pathname = usePathname()

    const createQueryString = useCallback((name: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set(name, value)
        return params.toString()
    }, [searchParams])

    const handleEditComment = async (commentId: string) => {
        try {
            setIsEditing(false)
            const response = await axios.post("/api/comment/edit", {
                commentId,
                content: comment
            }, {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if(!response.data.success) {
                return toast.error(response.data.message)
            }
            return toast.success(response.data.message)
        } catch (error) {
            console.log("Error:", error)
        } finally {
            router.refresh()
        }
    }

    const handleDeleteComment = async (commentId: string) => {
        try {
            const response = await axios.post(`/api/comment/delete/${commentId}`, {
                postId
            }, {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if(!response.data.success) {
                return toast(response.data.message)
            }
            return toast(response.data.message)
        } catch (error) {
            console.log("Error:", error)
        } finally {
            router.refresh()
        }
    }

    return (
        <Card>
            <CardContent>
                <div className="flex gap-3">
                    <Link className="cursor-pointer" href={`/user/${commentedBy?.id}`}>
                        <Avatar className="w-8 h-8">
                            <AvatarImage src={commentedBy?.profileImage} alt={commentedBy?.username} />
                            <AvatarFallback>
                                <User className="w-4 h-4" />
                            </AvatarFallback>
                        </Avatar>
                    </Link>
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <p className={`font-medium flex items-center gap-1 ${isAuthor ? "bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-500 dark:to-purple-500 bg-clip-text text-transparent" : ""}`}>
                                {commentedBy?.username}
                            </p>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                {formatDate(createdAt)}
                            </span>
                            <span className="text-xs text-black dark:text-white">
                                {isEdited ? "(Edited)" : ""}
                            </span>
                        </div>
                        {
                            isEditing ? 
                            <Input 
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            /> :
                            (
                                <p className="text-slate-700 dark:text-slate-300">
                                    {comment}
                                </p>
                            )
                        }
                    </div>
                        <div className="flex-shrink-0">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                        <MoreHorizontal className="w-4 h-4 text-slate-500" />
                                    </button>
                                </DropdownMenuTrigger>
                                    {
                                        isAuthor ? 
                                <DropdownMenuContent align="end" className="w-32">
                                    {
                                        isEditing ? 
                                        <DropdownMenuItem
                                            className="cursor-pointer"
                                            onClick={() => handleEditComment(id)}
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            <span>Save</span>
                                        </DropdownMenuItem> :
                                        <DropdownMenuItem
                                            className="cursor-pointer"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            <span>Edit</span>
                                        </DropdownMenuItem>
                                    }
                                    <DropdownMenuItem
                                        onClick={() => handleDeleteComment(id)}
                                        className="cursor-pointer text-red-500 focus:text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" color="red" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent> : 
                                <DropdownMenuContent align="end" className="w-32">
                                    <DropdownMenuItem
                                        onClick={() => console.log("reply")}
                                        className="cursor-pointer"
                                    >
                                        <Reply className="w-4 h-4 mr-2" />
                                        Reply
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                                }
                            </DropdownMenu>
                        </div>
                </div>
            </CardContent>
        </Card>
    )
}