"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface ReactionsProps {
    likes: number;
    dislikes: number;
    postId: string;
    likedAlready: boolean;
    dislikedAlready: boolean;
}

export default function Reactions({
    likes,
    dislikes,
    postId,
    likedAlready,
    dislikedAlready,
}: ReactionsProps) {
    const [likeCount, setLikeCount] = useState(likes);
    const [dislikeCount, setDislikeCount] = useState(dislikes);
    const [isLiked, setIsLiked] = useState(likedAlready);
    const [isDisliked, setIsDisliked] = useState(dislikedAlready);

    const handleReaction = async (type: "like" | "dislike") => {
        const prevLiked = isLiked;
        const prevDisliked = isDisliked;

        let newLiked = isLiked;
        let newDisliked = isDisliked;
        let newLikes = likeCount;
        let newDislikes = dislikeCount;

        if (type === "like") {
            if (isLiked) {
                newLiked = false;
                newLikes -= 1;
            } else {
                newLiked = true;
                newLikes += 1;
                if (isDisliked) {
                    newDisliked = false;
                    newDislikes -= 1;
                }
            }
            } else if (type === "dislike") {
            if (isDisliked) {
                newDisliked = false;
                newDislikes -= 1;
            } else {
                newDisliked = true;
                newDislikes += 1;
                if (isLiked) {
                    newLiked = false;
                    newLikes -= 1;
                }
            }
        }

        setIsLiked(newLiked);
        setIsDisliked(newDisliked);
        setLikeCount(Math.max(newLikes, 0));
        setDislikeCount(Math.max(newDislikes, 0));

        const reaction =
            newLiked && !newDisliked
            ? "like"
            : newDisliked && !newLiked
            ? "dislike"
            : "none";

        try {
            const res = await axios.post(`/api/${postId}/react`, { reaction });

            if (!res.data.success) {
                setIsLiked(prevLiked);
                setIsDisliked(prevDisliked);
                setLikeCount(likes);
                setDislikeCount(dislikes);
                return toast.error(res.data.message);
            }

            setLikeCount(res.data.likes);
            setDislikeCount(res.data.dislikes);
            if(res.data.message === "none" && prevLiked !== newLiked) return toast.success("Removed LIKE")
            if(res.data.message === "none" && prevDisliked !== newDisliked) return toast.success("Removed DISLIKE")
            return toast.success(res.data.message.toUpperCase()+"D post")
        } catch (err) {
            setIsLiked(prevLiked);
            setIsDisliked(prevDisliked);
            setLikeCount(likes);
            setDislikeCount(dislikes);
            toast.error("Failed to update reaction.");
        }
    }

    return (
        <div className="flex items-center gap-4">
            <Button
            variant="outline"
            size="sm"
            onClick={() => handleReaction("like")}
            className={`flex items-center gap-2 ${
                isLiked
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                : ""
            }`}
            >
                <ThumbsUp className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                {likeCount}
            </Button>

            <Button
            variant="outline"
            size="sm"
            onClick={() => handleReaction("dislike")}
            className={`flex items-center gap-2 ${
                isDisliked
                ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                : ""
            }`}
            >
                <ThumbsDown className={`w-4 h-4 ${isDisliked ? "fill-current" : ""}`} />
                {dislikeCount}
            </Button>
        </div>
    );
}
