import User from "@/models/User";
import { TPost } from "@/models/Post";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import PostCard from "@/components/PostCard";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";

require("@/models/Post");

export default async function WishlistPage({
  params,
}: {
  params: { userId: string };
}) {
  const { userId } = params;

  const user = await User.findById(userId).populate("wishlist");
  const session = await getServerSession(authOptions)

  const SkeletonLoader = () => {
    return (
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-[125px] w-[250px] rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  };

  if(!user) {
    return redirect("/sign-in")
  }

  if(session?.user._id !== user?.id) {
    return (
      <h1 className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] font-bold text-4xl">Unauthorised Access!</h1>
    )
  }

  return (
    <div className="pb-4">
      <h1 className="text-3xl font-bold m-3 ml-10 italic">
        <span className="bg-gradient-to-r from-blue-700 to-purple-700 dark:bg-gradient-to-r dark:from-blue-500 dark:to-purple-500 bg-clip-text text-transparent">{user?.username}'s</span> Wishlist...
      </h1>
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 m-10 gap-y-10 gap-x-10">
        {user?.wishlist && user?.wishlist.length > 0 ? (
          user.wishlist.map((post: TPost) => (
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
                link={`/posts/${post.id}`}
                isAuthor={user?.id === String(post.createdBy)}
                addedToWishlist={user?.wishlist?.includes(post) ? true : false}
              />
            </Suspense>
          ))
        ) : (
          <h1 className="text-xl">No posts!!</h1>
        )}
      </div>
    </div>
  );
}
