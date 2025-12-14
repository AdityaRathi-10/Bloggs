import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import PostCard from "@/components/PostCard"
import Sidebar from "@/components/Sidebar"
import Post from "@/models/Post"
import User from "@/models/User"
import dbConnect from "@/utils/dbConnet"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

type SearchParams = {
  search: string
  category: string | string[]
  sort: string
}

export default async function PostsPage({searchParams}: {searchParams: SearchParams} ) {
  await dbConnect()

  const posts = await Post.find()

  const {search, category, sort} = searchParams

  let filteredPosts = posts

  const session = await getServerSession(authOptions)

  const user = await User.findOne({
    email: session?.user.email,
  })

  if(search) {
    const query = search
    const matchedUsers = await User.find({
      username: { $regex: query, $options: "i" },
    })
    .select("_id");

    const matchedUserIds = matchedUsers.map((user) => user._id);

    const posts = await Post.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $elemMatch: { $regex: query, $options: "i" } } },
        { createdBy: { $in: matchedUserIds } },
      ]
    })
    .populate("createdBy", "username email profileImage")
    .limit(10);

    filteredPosts = posts
  }

  const getFilteredPosts = async (category?: string | string[], sort?: string) => {
    let posts = await Post.find()

    if(category) {
      const categories = typeof category === "string" ? category.split("+") : (Array.isArray(category) ? category : [])

      posts = posts.filter(post =>
        post.tags?.some(tag =>
          categories.some(cat =>
            new RegExp(cat, "i").test(tag)
          )
        )
      )
    }

    if(sort) {
      if(sort === "popular") {
        posts = posts.sort((a, b) => {
          const viewsA = Array.isArray(a.views) ? a.views.length : 0
          const viewsB = Array.isArray(b.views) ? b.views.length : 0
          return viewsB - viewsA
        })
      } else if(sort === "latest") {
        posts = posts.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      } else if(sort === "oldest") {
        posts = posts.sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      }
    }
    return posts
  }

  if(category || sort) {
    filteredPosts = await getFilteredPosts(category, sort)
  }

  return (
    <div className="min-h-screen max-h-max bg-background">
      <div className="flex flex-col sm:flex-row">
        {/* Sidebar */}
        <div className="w-full sm:w-52 xl:w-64 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto shrink-0">
          <div>
            <Sidebar />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6 min-w-0">
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">{category ? "Filtered Posts" : "All Posts"}</h1>
            <p className="text-muted-foreground">
              {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"} found
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 4xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-7">
            {filteredPosts.map((post) => {
              const likedAlready = post.likedBy?.find((userId) => String(userId) === user?.id)
              const dislikedAlready = post.dislikedBy?.find((userId) => String(userId) === user?.id)

              return (
                <div key={post.id} className="w-full">
                  <PostCard
                    id={post.id}
                    title={post.title}
                    description={post.description}
                    tags={post.tags}
                    likes={post.likes || 0}
                    dislikes={post.dislikes || 0}
                    likedAlready={likedAlready ? true : false}
                    dislikedAlready={dislikedAlready ? true : false}
                    totalComments={post.comments?.length}
                    totalViews={post.views?.length}
                    image={post.image}
                    link={`/posts/${post.id}`}
                    isAuthor={user?.id === String(post.createdBy)}
                    addedToWishlist={user?.wishlist?.includes(post.id) ? true : false}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}