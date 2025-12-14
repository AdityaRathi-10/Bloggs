"use client"

import type React from "react"

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import {
  User,
  LayoutDashboard,
  PlusCircle,
  Heart,
  LogOut,
  Menu,
  Bell,
  PenBoxIcon,
  Sun,
  Moon,
  Search,
  UserPlus,
  UserMinus,
  MessageCircle,
  X,
  Clock
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Link from "next/link"
import { Button } from "./ui/button"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"
import { useEffect, useState } from "react"
import axios, { type AxiosError } from "axios"
import { toast } from "sonner"
import type { APIResponse } from "@/utils/ApiResponse"
import { Skeleton } from "./ui/skeleton"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Badge } from "./ui/badge"
import type { TNotification } from "@/models/Notification"
import { formatDate2 } from "@/utils/formatDate"
import type { TSearchHistory } from "@/models/SearchHistory"
import { useDebounceCallback } from "usehooks-ts"
import { Session } from "next-auth"

export default function Navbar() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<TNotification[] | null>(null)
  const [searchValue, setSearchValue] = useState("")
  const [searchHistory, setSearchHistory] = useState<TSearchHistory[] | null>(null)
  const [filteredHistory, setFilteredHistory] = useState<TSearchHistory[] | null>(null)
  const [recommendations, setRecommendations] = useState<string[] | null>(null)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [userSession, setUserSession] = useState<Session | null>(null)
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.replace("/")
    router.refresh()
  }

  const getSearchRecommendations = async (query: string) => {
    const response = (await axios.get(`/api/search-suggestion?query=${query}`)).data
    setRecommendations(response.recommendations)
  }

  useEffect(() => {
    try {
      const getUserNotifications = async () => {
        const notification = await axios.get(`/api/notifications/get/${session?.user._id}`)
        setNotifications(notification.data.notifications)
      }
      if (session?.user._id) {
        getUserNotifications()
      }
    } catch (error) {
      const axiosError = error as AxiosError<APIResponse>
      toast.error("Error", { description: axiosError.response?.data.message })
    }
  }, [session?.user._id])

  useEffect(() => {
    try {
      const getUserSearchHistory = async () => {
        const queries = (await axios.get("/api/search-history")).data
        setSearchHistory(queries.searchHistory)
      }
      if (session?.user._id) {
        getUserSearchHistory()
      }
    } catch (error) {
      const axiosError = error as AxiosError<APIResponse>
      toast.error("Error", { description: axiosError.response?.data.message })
    }
  }, [session?.user._id])

  useEffect(() => {
    setUserSession(session)
  }, [status])

  const debouncedRecommendations = useDebounceCallback(getSearchRecommendations, 200)

  const user = session?.user

  const menuItems = [
    { href: `/user/${user?._id}`, label: "Profile", icon: User },
    { href: `/dashboard/${user?._id}`, label: "Dashboard", icon: LayoutDashboard },
    { href: "/create-post", label: "Create Post", icon: PlusCircle },
    { href: `/wishlist/${user?._id}`, label: "My Wishlist", icon: Heart },
  ]

  const notificationsConfig = (type: string, notification: TNotification) => {
    if (type == "follow") {
      return {
        icon: <UserPlus color="green" />,
        message: "followed you",
        navigateTo: `/user/${notification.notifiedBy}`,
      }
    } else if (type == "unfollow") {
      return {
        icon: <UserMinus color="gray" />,
        message: "unfollowed you",
      }
    }
    if (type == "comment") {
      return {
        icon: <MessageCircle color="orange" />,
        message: "commented on your post",
        navigateTo: `/posts/${notification.post}`,
      }
    }
    if (type == "like") {
      return {
        icon: <Heart color="red" />,
        message: "liked your post",
        navigateTo: `/posts/${notification.post}`,
      }
    }
  }

  const handleNotificationRead = async (notification: TNotification) => {
    try {
      router.replace(notificationsConfig(notification.type, notification)?.navigateTo!)
      await axios.post(
        `/api/notifications/read`,
        {
          notificationId: String(notification._id),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    } catch (error) {
      console.log("Error:", error)
    } finally {
      setNotifications((prev: any) => {
        if (!prev) return prev
        return prev.map((notif: TNotification) =>
          notif._id === String(notification._id) ? { ...notif, read: true } : notif,
        )
      })
    }
  }

  const handleMarkAllRead = async () => {
    if(notifications?.every((item) => item.read === true)) return
    setNotifications((prev: any) => {
      if(!prev) return
      return prev.map((item: TNotification) => ({...item, read: true}))
    })
    const response = (await axios.patch("/api/notifications/mark-all-read"))
    if(response.data.success) toast(response.data.message)
  }

  const updatedSearchHistory = async (query: any) => {
    setSearchHistory((prev: any) => {
      if (!prev) return [{ query: query }]
      if (Array.isArray(prev) && prev.includes(query)) return prev
      return [{ query: query }, ...prev]
    })
    const response = await axios.post(
      "/api/search-history",
      {
        query,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    if (!response.data.success) {
      return toast(response.data.message)
    }
    return
  }

  const handleSearch = async () => {
    if (searchValue.trim()) {
      router.push(`/posts?search=${encodeURIComponent(searchValue.trim())}`)
    }
  }

  const handleSearchHistoryClick = (query: string) => {
    setSearchValue(query)
    router.push(`/posts?search=${encodeURIComponent(query)}`)
    setIsSearchFocused(false)
  }

  const handleDeleteSearchHistory = async (history: string) => {
    setSearchHistory((prev: any) => prev?.filter((item: TSearchHistory) => item.query !== history))
  }

  const MobileNavItem = ({ href, label, icon: Icon, onClick }: any) => (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      onClick={onClick}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </Link>
  )

  if (status === "loading") {
    return <Skeleton className="w-full h-24" />
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <Link
            href="/posts"
            className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 dark:bg-gradient-to-r dark:from-blue-500 dark:to-purple-500 bg-clip-text text-transparent"
          >
            <PenBoxIcon className="h-6 w-6 text-primary" />
            <span>Bloggs</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 items-center max-w-md mx-8">
            <div className="relative w-full flex items-center gap-3">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  value={searchValue}
                  placeholder="Search articles, authors, topics..."
                  className="pl-10 pr-4 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-full transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch()
                      updatedSearchHistory(e.currentTarget.value.trim())
                      setIsSearchFocused(false)
                    }
                  }}
                  onChange={(e) => {
                    setSearchValue(e.target.value)
                    debouncedRecommendations(e.target.value)
                    const filtered = searchHistory?.map((item) => {
                      if (item.query.toLowerCase().includes(e.target.value.toLowerCase())) return item
                    })
                    if (e.target.value.length > 0 && filtered && filtered.length > 0) {
                      setFilteredHistory(filtered as TSearchHistory[])
                    }
                    else {
                      setFilteredHistory([])
                    }
                  }}
                />

                {/* Search History Dropdown */}
                {isSearchFocused && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                    <div className="p-2">
                      <div className="text-xs text-slate-500 dark:text-slate-400 px-3 py-2 font-medium">
                        {(searchValue && filteredHistory?.every((item) => item === undefined) && recommendations?.length === 0 ? "No results found" : (!searchHistory && recommendations?.length === 0 ? "No recent searches" : (recommendations && recommendations?.length > 0 ? "Results" : "Recent searches")))}
                      </div>
                      {filteredHistory && filteredHistory.length > 0
                        ? filteredHistory.map((item, index) => {
                          if (!item) return null;
                          return (
                            <div
                              key={`filtered-${index}`}
                              className="flex items-center justify-between px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md cursor-pointer group"
                              onClick={() => handleSearchHistoryClick(item.query)}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                                <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{item.query}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSearchHistory(item.query);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          );
                        })
                        : searchHistory && searchHistory.map((item, index) => (
                          <div
                            key={`history-${index}`}
                            className="flex items-center justify-between px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md cursor-pointer group"
                            onClick={() => handleSearchHistoryClick(item.query)}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                              <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{item.query}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSearchHistory(item.query);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        {
                          recommendations && recommendations.length > 0 ? (
                            recommendations.map((rec, index) => (
                              <div
                                key={`rec-${index}`}
                                className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md cursor-pointer group"
                                onClick={() => handleSearchHistoryClick(rec)}
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <Search className="h-4 w-4 text-slate-400 shrink-0" />
                                  <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{rec}</span>
                                </div>
                              </div>
                            ))
                          ) : ""
                        }
                    </div>
                  </div>
                )}
              </div>
              <Button onClick={() => {
                handleSearch()
                updatedSearchHistory(searchValue.trim())
                setIsSearchFocused(false)
              }}
                className="cursor-pointer rounded-full">
                Find
                <Search />
              </Button>
            </div>
          </div>

          {userSession ? (
            <>
              <div className="hidden md:flex items-center gap-6">
                <div>
                  {theme === "dark" ? (
                    <Sun onClick={() => setTheme("light")} />
                  ) : (
                    <Moon onClick={() => setTheme("dark")} />
                  )}
                </div>
                <div className="flex items-center gap-44">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  >
                    <Link href="/create-post" className="flex items-center gap-2">
                      <PlusCircle className="w-4 h-4" />
                      <span className="hidden lg:inline">Create</span>
                    </Link>
                  </Button>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                    >
                      <>
                        <Bell />
                        {/* Notification badge - show when there are notifications */}
                        {notifications && notifications?.filter((notif) => notif.read === false).length > 0 ? (
                          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-2 text-xs dark:bg-blue-300 bg-blue-700">
                            {notifications?.filter((notif) => notif.read === false).length}
                          </Badge>
                        ) : (
                          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-2 text-xs dark:bg-blue-300 bg-blue-700">
                            0
                          </Badge>
                        )}
                      </>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96 p-0 mr-4 max-h-[50vh] overflow-y-auto" align="end">
                    <div className="flex items-center justify-between px-4 py-2 border-b">
                      <h3 className="font-semibold text-base">Notifications</h3>
                      <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground" onClick={handleMarkAllRead}>
                        Mark all read
                      </Button>
                    </div>

                    {/* Empty State */}
                    {notifications?.length ? (
                      ""
                    ) : (
                      <div className="p-6 text-center">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center">
                          <Bell height={48} width={48} color="gray" />
                        </div>
                        <h4 className="font-medium text-sm mb-2">No notifications yet</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          When you get notifications, they'll show up here
                        </p>
                      </div>
                    )}

                    {/* Notification Items Template - Uncomment and modify when you have notifications */}
                    {notifications?.map((notification) => (
                      <div
                        key={String(notification._id)}
                        onClick={() => handleNotificationRead(notification)}
                        className="max-h-96 overflow-y-auto cursor-pointer"
                      >
                        <div className="p-3 hover:bg-muted/50 border-b last:border-b-0">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                              {notificationsConfig(notification.type, notification)?.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{notification.type}</p>
                              <div className="flex justify-between">
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  <Link
                                    href={`/user/${notification.notifiedBy}`}
                                    className="dark:text-gray-300 text-black hover:underline"
                                  >
                                    {notification.notifiedByUsername}
                                  </Link>
                                  <span> {notificationsConfig(notification.type, notification)?.message}</span>
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate2(new Date(notification.createdAt).getTime())}
                                </p>
                              </div>
                            </div>
                            {notification.read ? (
                              ""
                            ) : (
                              <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* <Separator />
                    <div>
                      <Button variant="ghost" size="sm" className="w-full text-xs justify-center py-6">
                        View all notifications
                      </Button>
                    </div> */}
                  </PopoverContent>
                </Popover>

                <Menubar className="border-none bg-transparent">
                  <MenubarMenu>
                    <MenubarTrigger className="p-0 border-none bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent">
                      <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="relative">
                          <Image
                            src={
                              user?.profileImage
                                ? user.profileImage
                                : "/default-profile-image.webp"
                            }
                            alt="Profile"
                            className="object-cover rounded-full w-10 h-10 ring-2 ring-slate-200 dark:ring-slate-700"
                            width={40}
                            height={40}
                          />
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-950 rounded-full"></div>
                        </div>
                        <div className="hidden lg:block text-left">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {user?.username ? user.username : <Skeleton className="w-28 h-4 rounded-md inline-block" />}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {user?.email ? user.email : <Skeleton className="w-40 h-3 rounded-md inline-block" />}
                          </p>
                        </div>
                      </div>
                    </MenubarTrigger>
                    <MenubarContent align="end" className="w-56 mt-2">
                      <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {user?.username ? user.username : <Skeleton className="w-28 h-4 rounded-md inline-block" />}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {user?.email ? user.email : <Skeleton className="w-40 h-3 rounded-md inline-block" />}
                        </p>
                      </div>
                      {menuItems.map((item, index) => (
                        <MenubarItem key={index} className="cursor-pointer">
                          <Link href={item.href} className="flex items-center gap-2 w-full">
                            <item.icon className="w-4 h-4" />
                            {item.label}
                          </Link>
                        </MenubarItem>
                      ))}
                      <MenubarSeparator />
                      <MenubarItem
                        className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-500"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 mr-2" color="red" />
                        Logout
                      </MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                </Menubar>
              </div>

              <div className="md:hidden">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2">
                      <Menu className="w-6 h-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-72">
                    <div className="flex flex-col h-full">
                      {/* Mobile Search */}
                      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                          <Input
                            placeholder="Search..."
                            className="pl-10 pr-4 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                          />
                        </div>
                      </div>

                      {/* Mobile Notifications */}
                      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <Button variant="ghost" className="w-full justify-start gap-3">
                          <Bell className="h-5 w-5" />
                          <span>Notifications</span>
                          {/* <Badge className="ml-auto bg-red-500 hover:bg-red-500 text-white">3</Badge> */}
                        </Button>
                      </div>

                      <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800">
                        <Image
                          src={
                            user && user.profileImage?.startsWith("http")
                              ? user.profileImage
                              : "/default-profile-image.webp"
                          }
                          alt="Profile"
                          className="object-cover rounded-full w-12 h-12 ring-2 ring-slate-200 dark:ring-slate-700"
                          width={48}
                          height={48}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 dark:text-slate-100">{user?.username || "User"}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {user?.email || "user@example.com"}
                          </p>
                        </div>
                      </div>

                      <div className="flex-1 py-4 space-y-1">
                        {menuItems.map((item, index) => (
                          <MobileNavItem
                            key={index}
                            href={item.href}
                            label={item.label}
                            icon={item.icon}
                            onClick={() => setIsOpen(false)}
                          />
                        ))}
                      </div>

                      <div className="border-t border-slate-200 dark:border-slate-800 p-4">
                        <Button
                          onClick={handleLogout}
                          variant="ghost"
                          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                        >
                          <LogOut className="w-5 h-5 mr-3" color="red" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          ) :
            <Link href="/sign-in">
              <Button size="lg" className="bg-slate-700 dark:bg-gray-300 cursor-pointer">
                <User className="h-4 w-4" />
                Sign in
              </Button>
            </Link>
          }
        </div>
      </div>
    </nav>
  )
}