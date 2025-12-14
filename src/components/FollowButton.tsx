"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { APIResponse } from "@/utils/ApiResponse";
import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";
import axios, { AxiosError } from "axios";
import { Loader } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";

export default function FollowButton({ status, followers, posts }: { status: boolean, followers: number, posts: number }) {
  const [followed, setFollowed] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [follower, setFollower] = useState(followers)

  const { data: session } = useSession();

  const { userId } = useParams();

  useEffect(() => {
    if(session) {
      setFollowed(status)
    }
  }, [session])

  const handleFollow = async () => {
    const newState = !followed
    setFollowed(newState)
    setIsSubmitting(true)
    if(newState) setFollower(follower+1)
    else setFollower(follower-1)
    try {
      const response = await axios.post<APIResponse>(`/api/follow/${userId}`, {
        follower: session?.user.email,
        followStatus: newState ? "true" : "false",
      });
      if (!response.data.success) {
        toast.warning("Action not performed", {description: response.data.message});
      }
      if(response.data.message.startsWith("Followed")) {
        toast.success("Followed", {description: response.data.message});
        setFollowed(true)
      } else {
        toast.success("Unfollowed", {description: response.data.message});
        setFollowed(false)
      }
    } catch (error) {
      const axiosError = error as AxiosError<APIResponse>;
      toast.error("Error", axiosError.response?.data.message);
    } finally {
      setIsSubmitting(false)
    }
  };

  if(followed === null) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] min-w-[40vw]">
        <Skeleton className="rounded-full w-full h-12" />
      </div>
    )
  }

  if (!session || !session.user) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className={`text-lg px-7 py-5 ${status ? "bg-white text-black" : "bg-black text-white"}`}>{status ? "Followed" : "Follow"}</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-semibold text-2xl">
              Unauthenticated user
            </AlertDialogTitle>
            <AlertDialogDescription>
            This action cannot be done as you are not authenticated for it. Kindly signup before performing this action.
          </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>
            <Link href={"/sign-up"}>
                <AlertDialogAction>
                    Sign up
                </AlertDialogAction>
            </Link>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <>
      <div className="flex items-center col-span-1">
          <div className="flex gap-12 text-4xl">
            <Link href={`/dashboard/${userId}`}>
              <div>
                Posts <b>{posts}</b>
              </div>
            </Link>
            <div>
              Followers <b>{follower}</b>
            </div>
          </div>
        </div>
      <div className="flex items-center col-span-1">
        <Button
          onClick={handleFollow}
          className="text-lg shadow-md w-32 h-12 dark:border-white cursor-pointer"
          variant={followed ? "outline" : "default"}
          disabled={isSubmitting}
        >
          {
            followed ? "Followed" : "Follow"
          }
        </Button>
      </div>
    </>
  );
}
