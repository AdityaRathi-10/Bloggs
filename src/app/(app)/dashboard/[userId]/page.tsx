import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import PostCard from "@/components/PostCard";
import dbConnect from "@/utils/dbConnet";
import Post from "@/models/Post";
import User from "@/models/User";
import { TPost } from "@/models/Post";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

require("@/models/Comment")

export default async function DashboardPage({params}: {params: {userId: string}}) {
  let {userId} = params
  const session = await getServerSession(authOptions)

  if(!session) {
    return (
      <h1 className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] font-bold text-4xl">Unauthorised Access!</h1>
    )
  }

  await dbConnect()
  const userFromSession = await User.findById(session?.user._id)
  const userFromParams = await User.findById(userId)

  if(!userFromSession && !userFromParams) {
    redirect("/sign-in")
  }

  const posts = await Post.find({
    createdBy: userId
  }).populate({
    path: "comments",
    populate: {
      path: "commentedBy",
      select: "username profileImage",
    }
  }).lean()

  const SkeletonLoader = () => {
    return (
      <div className="flex flex-col space-y-3">
      <Skeleton className="h-[125px] w-[250px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
    )
  }

  if(!posts) {
    return <h1>Loading...</h1>
  }
  
  return (
    <div className="pb-4">
      {
        userFromSession?.id === userFromParams?.id ?
        <h1 className="text-4xl font-bold m-3 ml-10">Hello <span className="italic bg-gradient-to-r from-blue-600 to-purple-600 dark:bg-gradient-to-r dark:from-blue-500 dark:to-purple-500 bg-clip-text text-transparent">{userFromSession?.username}</span> 👋</h1> 
        : <div className="flex flex-col items-center justify-center pt-4">
          <Link href={`/user/${userFromParams?.id}`}>
            <Image 
              src={userFromParams?.profileImage as string || "/default-profile-image.webp"}
              alt={userFromParams?.username as string}
              height={48}
              width={48}
              className="object-cover rounded-full w-12 h-12 ring-2 ring-slate-200 dark:ring-slate-700"
            />
          </Link>
          {/* <div> */}
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:bg-gradient-to-r dark:from-blue-500 dark:to-purple-500 bg-clip-text text-transparent">{userFromParams?.username}</h1>
            <div className="flex items-center gap-3 text-sm">
              <p>Posts <span className="font-bold">{userFromParams?.posts?.length}</span></p>
              <p>Followers <span className="font-bold">{userFromParams?.followers?.length}</span></p>
            </div>
          {/* </div> */}
        </div> 
      }
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 m-10 gap-y-10 gap-x-10">
      {posts && posts.length > 0 ? (
        posts.map((post: TPost) => (
          <Suspense fallback={<SkeletonLoader />} key={post.id}>
            <PostCard 
              id={String(post._id)} 
              title={post.title} 
              description={post.description} 
              tags={post.tags} 
              image={post?.image} 
              key={post.id} 
              totalComments={post.comments?.length}
              totalViews={post.views?.length}
              likes={post.likes || 0} 
              dislikes={post.dislikes || 0} 
              link={`/posts/${String(post._id)}`} 
              isAuthor={userFromSession?.id === String(post.createdBy)}
              addedToWishlist={userFromSession?.wishlist?.includes(post.id) ? true : false}
            />
          </Suspense>
        ))
      ) : (
        <h1 className="text-xl">No posts!!</h1>
      )
      }
      </div>
    </div>
  );
}
