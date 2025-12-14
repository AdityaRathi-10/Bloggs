"use client"

import { Loader2, Send } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Textarea } from "./ui/textarea"
import { useState } from "react"
import axios from "axios"
import { toast } from "sonner"
import { useParams, useRouter } from "next/navigation"

export default function CommentBox() {
    const [comment, setComment] = useState("")
    const [submitting, setIsSubmitting] = useState(false)
    const { postId } = useParams()
    const router = useRouter()

    const handleAddComment = async () => {
        if (comment.trim().length === 0) {
            return toast.warning("Comment is empty!")
        }
        setIsSubmitting(true)
        try {
            const response = await axios.post(
                "/api/comment/add",
                {
                    content: comment,
                    postId: postId,
                },
                {
                    headers: { "Content-Type": "application/json" },
                }
            )
            if (!response.data.success) {
                return toast.error("Error:", response.data.message)
            }
            return toast.success(response.data.message)
        } catch (error) {
            console.error(error)
        } finally {
            router.refresh()
            setIsSubmitting(false)
            setComment("")
        }
    }

    return (
        <Card>
            <CardContent className="p-4">
                <div className="space-y-4">
                    {/* Textarea on top */}
                    <Textarea
                        name="comment"
                        placeholder="Write a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="min-h-[100px] resize-none dark:border-gray-500 relative z-10 bg-transparent"
                    />
                    
                    {/* Submit button */}
                    <div className="flex justify-end">
                        <Button onClick={handleAddComment} disabled={submitting} className="cursor-pointer w-full">
                            {submitting ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Comment
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
