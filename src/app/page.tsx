"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  ArrowRight,
  BookOpen,
  Users,
  TrendingUp,
  Menu,
  User,
  PenTool,
  Github,
  Twitter,
  Linkedin,
  Mail,
  ArrowUp,
  PenBoxIcon,
  LogOut,
  Sun,
  Moon,
  UserPlus2
} from "lucide-react"
import Link from "next/link"
import {  useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { Skeleton } from "@/components/ui/skeleton"

function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session, status } = useSession()
  const { theme, setTheme } = useTheme()

  if(status === "loading") {
    return (
      <Skeleton className="w-full h-24" />
    )
  }

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Articles", href: "/posts" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/posts" className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 dark:bg-gradient-to-r dark:from-blue-500 dark:to-purple-500 bg-clip-text text-transparent">
            <PenBoxIcon className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Bloggs</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <div>
              {
                theme === "dark" ? 
                <Sun onClick={() => setTheme("light")}/> :
                <Moon onClick={() => setTheme("dark")}/>
              }
            </div>
            <Link href="/create-post">
              <Button variant="outline" size="sm">
                <PenTool className="h-4 w-4" />
                  Write
              </Button>
            </Link>
            {
              session?.user ?
                <Button size="sm" onClick={() => signOut({ redirect: false })}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button> : 
                <Link href="/sign-up">
                  <Button size="sm">
                    <User className="h-4 w-4" />
                    Sign Up
                  </Button>
                </Link> 
            }
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-6 mt-6">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search..." className="pl-8" />
                </div>

                <nav className="flex flex-col space-y-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-lg font-medium hover:text-primary transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                <div className="flex flex-col space-y-3 pt-6 border-t">
                  <Link href="/write">
                    <Button variant="outline" className="w-full justify-start">
                      <PenTool className="h-4 w-4 mr-2" />
                      Write Article
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

// Hero Section Component80
function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20 lg:py-32 min-h-[80vh] flex items-center">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Main Headline */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Discover Amazing
              <span className="text-primary block">Stories & Ideas</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Explore insightful articles on technology, development, AI, and more. Join our community of passionate
              readers and writers sharing knowledge and inspiration.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/posts">
              <Button size="lg" className="px-12 py-6 text-base rounded-full cursor-pointer">
                Explore Articles
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 max-w-3xl mx-auto">
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="p-3 bg-primary/10 rounded-full">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold">500+</div>
              <div className="text-muted-foreground">Articles Published</div>
            </div>
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-muted-foreground">Active Readers</div>
            </div>
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="p-3 bg-primary/10 rounded-full">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-muted-foreground">Monthly Views</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Site Footer Component
function SiteFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const footerLinks = {
    content: [
      { name: "All Articles", href: "/posts" },
      { name: "Categories", href: "/categories" },
      { name: "Featured", href: "/featured" },
      { name: "Popular", href: "/popular" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Write for Us", href: "/write" },
      { name: "Careers", href: "/careers" },
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
  }

  const socialLinks = [
    { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
    { name: "GitHub", icon: Github, href: "https://github.com" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
    { name: "Email", icon: Mail, href: "mailto:hello@bloggs.com" },
  ]

  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <PenBoxIcon className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Bloggs</span>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-md">
              Your go-to destination for insightful articles on technology, development, and innovation. Join our
              community of passionate readers and writers.
            </p>
            <div className="flex space-x-2">
              {socialLinks.map((social) => {
                const IconComponent = social.icon
                return (
                  <Button key={social.name} variant="ghost" size="icon" asChild>
                    <Link href={social.href} target="_blank" rel="noopener noreferrer">
                      <IconComponent className="h-4 w-4" />
                      <span className="sr-only">{social.name}</span>
                    </Link>
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Content</h3>
            <ul className="space-y-2">
              {footerLinks.content.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© 2024 Bloggs. All rights reserved.</p>
          <Button variant="ghost" size="sm" onClick={scrollToTop} className="flex items-center gap-2">
            Back to top
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </footer>
  )
}

// Main Homepage Component
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col dark:bg-gray-900">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
      </main>
      <SiteFooter />
    </div>
  )
}
