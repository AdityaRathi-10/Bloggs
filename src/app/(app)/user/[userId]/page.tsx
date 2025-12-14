import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import FollowButton from "@/components/FollowButton"
import User from "@/models/User"
import dbConnect from "@/utils/dbConnet"
import { getServerSession } from "next-auth"
import Image from "next/image"
import { FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Title from "@/components/Title"
import Description from "@/components/Description"
import { formatDate2 } from "@/utils/formatDate"
import Link from "next/link"
import DeleteAccount from "@/components/DeleteAccount"

require("@/models/Post")

export default async function UserAccountPage({ params }: { params: { userId: string } }) {
  await dbConnect()
  const user = await User.findById(params.userId).populate("posts").select("-password")

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">User not found</h1>
      </div>
    )
  }

  const session = await getServerSession(authOptions)
  const follower = await User.findOne({ email: session?.user.email })
  const userAlreadyFollowing = user.followers.find((fol) => fol?.toString() === follower?.id)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8 sm:p-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <Image
                  src={user.profileImage || "/default-profile-image.webp"}
                  alt="Profile"
                  width={300}
                  height={300}
                  className="rounded-full object-cover w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 shadow-lg"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center lg:text-left space-y-6">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold py-2 bg-gradient-to-r from-blue-700 to-purple-700 dark:bg-gradient-to-r dark:from-blue-500 dark:to-purple-500 bg-clip-text text-transparent inline-block">
                  {user.username}
                </h1>

                <FollowButton
                  status={userAlreadyFollowing ? true : false}
                  followers={user.followers.length}
                  posts={user.posts?.length || 0}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
                {user.posts && user.posts.length > 0 ? (
                  <div className="space-y-4">
                    {user.posts.slice(0, 3).map((post, index) => (
                      <div
                        key={index}
                        className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Title 
                          title={post.title}
                          className="font-medium mb-2 line-clamp-2"
                        />
                        <Description 
                          description={post.description}
                          className="text-sm text-muted-foreground line-clamp-3"
                        />
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span>{formatDate2(new Date(post.createdAt).getTime())}</span>
                          <span>•</span>
                          <span>{post.likes || 0} likes</span>
                          <span>•</span>
                          <span>{post.comments?.length || 0} comments</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No posts yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <DeleteAccount />

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activity Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Activity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Posts</span>
                    <span className="font-medium">{user.posts?.length || 0}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Likes</span>
                    <span className="font-medium">
                      {user.posts?.reduce((acc, post) => acc + (post.likes || 0), 0) || 0}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Member Since</span>
                    <span className="font-medium text-sm">
                      {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            {user.email && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Contact</h3>
                  <div className="space-y-3">
                    {user.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Email:</span>
                        <Link href={`mailto:${user.email}`} className="text-primary hover:underline">
                          {user.email}
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
