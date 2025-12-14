"use client"

import Image from "next/image"
import Link from "next/link"
import { MessageCircle, EllipsisVertical, Trash2, Heart, Eye, Edit2, Link2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import axios, { type AxiosError } from "axios"
import { useParams } from "next/navigation"
import type { APIResponse } from "@/utils/ApiResponse"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Reactions from "./Reactions"
import { useSession } from "next-auth/react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type PostCardProps = {
  id: string
  title: string
  description: string
  tags?: string[]
  image?: string
  likes: number
  dislikes: number
  likedAlready?: boolean
  dislikedAlready?: boolean
  totalComments?: number
  totalViews?: number
  link: string
  isAuthor: boolean
  addedToWishlist: boolean
}

function stripHtml(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html")
  return doc.body.textContent || ""
}

export default function PostCard({
  id,
  title,
  description,
  tags,
  image,
  likes,
  dislikes,
  likedAlready,
  dislikedAlready,
  totalComments,
  totalViews,
  link,
  isAuthor,
  addedToWishlist,
}: PostCardProps) {
  const [openMenu, setOpenMenu] = useState(false)
  const [addedInWishlist, setAddedInWishlist] = useState(addedToWishlist)
  const [copied, setCopied] = useState(false);

  const { data: session } = useSession()
  const router = useRouter()

  const handleMenu = async (e: any) => {
    setOpenMenu((prev) => !prev)
  }

  const handleDeletePost = async (e: any) => {
    try {
      const response = await axios.delete<APIResponse>(`/api/delete-post/${id}?userId=${session?.user._id}`)
      if (!response.data.success) {
        toast.warning("Failed", { description: response.data.message })
      }
      toast.success("Success", { description: response.data.message })
    } catch (error) {
      const axiosError = error as AxiosError<APIResponse>
      toast.success("Error", { description: axiosError.response?.data.message })
      console.error("Axioserror", axiosError)
    } finally {
      setOpenMenu(false)
      router.refresh()
    }
  }

  const handleWishlist = async () => {
    const newWishlistStatus = !addedInWishlist
    setAddedInWishlist(newWishlistStatus)
    try {
      const response = await axios.post(
        `/api/add-to-wishlist/${id}`,
        {
          isBookmarked: newWishlistStatus,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      if (!response.data.success) {
        return toast.error(response.data.message)
      }
      return toast.success(response.data.message)
    } catch (error) {
      console.log("Error:", error)
    } finally {
      router.refresh()
    }
  }

  const handleEditPost = async (postId: string) => {
    router.push(`/create-post?edit=${postId}`)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(`http://localhost:3000/posts/${id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500); // reset after 1.5s
  };

  return (
    <div
      className={`relative w-full h-[400px] bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 ${
        openMenu ? "scale-[1.02]" : "hover:scale-[1.02]"
      } flex flex-col overflow-hidden group`}
      key={id}
    >
      {/* Menu Button */}
      <div className="absolute right-3 top-3 z-10">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 bg-background/80 hover:bg-background/90 backdrop-blur-sm shadow-sm"
          onClick={handleMenu}
        >
          <EllipsisVertical className="h-4 w-4" />
        </Button>

        {openMenu && (
          <div 
            className="absolute right-0 top-full mt-2 w-max-content bg-card rounded-lg shadow-lg border border-border z-50"
          >  
            {isAuthor ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 dark:hover:bg-red-950 rounded-none first:rounded-t-lg last:rounded-b-lg cursor-pointer dark:text-red-500"
                  >
                    <Trash2 className="h-4 w-4"  />
                    Delete Post
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this post from your account.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeletePost} className="bg-red-700 text-white hover:bg-destructive/90 cursor-pointer">
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
            <Button
              variant="ghost"
              className="w-full justify-start rounded-none first:rounded-t-lg last:rounded-b-lg cursor-pointer"
              onClick={handleWishlist}
            >
              <Heart className="h-4 w-4" fill={addedInWishlist ? "currentColor" : "none"} />
              {addedInWishlist ? "Remove from" : "Add to"} Wishlist
            </Button>
            {
              isAuthor ? 
              <Button
                variant="ghost"
                className="w-full justify-start rounded-none first:rounded-t-lg last:rounded-b-lg cursor-pointer"
                onClick={() => handleEditPost(id)}
              >
                <Edit2 className="h-4 w-4" />
                Edit post
              </Button> : null
            }
          </div>
        )}
      </div>

      <Link 
        href={openMenu ? "#" : link} 
        className="block"
      >
        <div className="relative w-full h-[200px] overflow-hidden rounded-t-xl">
          <Image
            src={image || "/default-thumbnail-image.jpg"}
            alt="Thumbnail"
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 min-h-0">
        {/* tags */}
        <div className="flex justify-between items-center">
          {tags ? (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.slice(0, 2).map((tag) =>
                tag.length > 0 ? (
                  <Link
                    href={`/posts?category=${tag.toLowerCase()}`}
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                  >
                    {tag}
                  </Link>
                ) : null,
              )}
              {tags.length > 2 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          ) : null}
          <div className="flex items-center gap-1 text-muted-foreground">
            <Eye className="h-5 w-5" />
            <span className="text-sm font-medium">{totalViews}</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-base font-semibold mb-2 line-clamp-2 leading-tight">{stripHtml(title)}</h2>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">{stripHtml(description)}</p>

        {/* Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-border mt-auto">
          <div className="flex items-center gap-3">
            <Reactions
              likes={likes}
              dislikes={dislikes}
              postId={id}
              likedAlready={likedAlready || false}
              dislikedAlready={dislikedAlready || false}
            />
          </div>

          {/* Comments */}
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="cursor-pointer">
                <TooltipProvider>
                  <Tooltip open={copied} delayDuration={0}>
                    <TooltipTrigger asChild>
                        <div onClick={handleCopy} className="cursor-pointer hover:text-blue-600 transition-colors">
                        <Link2 className="h-4 w-4" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs bg-black text-white dark:bg-white dark:text-black">
                      Copied!
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex gap-1">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{totalComments}</span>
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}
