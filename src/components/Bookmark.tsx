"use client"

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Bookmark as AddToWishlist } from "lucide-react"
import axios from "axios";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";

export default function Bookmark({postId, addedToWishlist}: {postId: string, addedToWishlist: boolean}) {

    const [isBookmarked, setIsBookmarked] = useState<boolean | null>(null)

    useEffect(() => {
        setIsBookmarked(addedToWishlist)
    }, [addedToWishlist])

    if(isBookmarked === null) {
        return <Skeleton className="h-4 w-20" />
    }

    const handleBookmark = async () => {
        const newBookmarkStatus = !isBookmarked
        setIsBookmarked(newBookmarkStatus)
        try {
            const response = await axios.post(`/api/add-to-wishlist/${postId}`, {
                isBookmarked: newBookmarkStatus
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
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleBookmark}
            className={isBookmarked ? "bg-slate-100 dark:bg-slate-800" : ""}
        >
            <AddToWishlist className={`${isBookmarked ? "fill-current" : ""}`} />
            {isBookmarked ? "Bookmarked" : "Bookmark"}
        </Button>
    )
}