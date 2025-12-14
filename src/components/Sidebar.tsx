"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { X, Filter, Calendar, Tag } from "lucide-react"
import { useRouter } from "next/navigation"
import { tags } from "@/lib/tags.json"

interface BlogSidebarProps {
  className?: string
}

export default function BlogSidebar({ className }: BlogSidebarProps) {
  const [filteredTags, setFilteredTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<string>("")
  const router = useRouter()

  const handleTagSelect = (tag: string) => {
    setFilteredTags((prev) => {
      if (prev.includes(tag)) return prev
      return [...prev, tag]
    })
  }

  const handleTagDelete = (tagToDelete: string) => {
    setFilteredTags((prev) => prev.filter((tag) => tag !== tagToDelete))
  }

  const handleApplyFilters = async () => {
    const params = new URLSearchParams()

    if (filteredTags.length > 0) {
      params.set("category", filteredTags.join("+").toLowerCase())
    }

    if (sortBy) {
      params.set("sort", sortBy.toLowerCase())
    }

    const queryString = params.toString()
    router.push(`/posts${queryString ? `?${queryString}` : ""}`)
  }

  const clearFilters = () => {
    setFilteredTags([])
    setSortBy("")
    router.push("/posts")
  }

  return (
    <Card className={`w-full max-w-sm mx-auto lg:max-w-none h-screen ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sort Section */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4" />
            Sort By
          </Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select sorting" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Tags Section */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Tag className="h-4 w-4" />
            Tags
          </Label>
          <Select onValueChange={handleTagSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select tags" />
            </SelectTrigger>
            <SelectContent>
              {
                tags.map((tag) => (
                  <SelectItem value={tag}>{tag}</SelectItem>
                ))
              }
            </SelectContent>
          </Select>

          {/* Selected Tags */}
          {filteredTags.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Selected Tags:</Label>
              <div className="flex flex-wrap gap-2">
                {filteredTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                    <span className="text-xs">{tag}</span>
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors"
                      onClick={() => handleTagDelete(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button onClick={handleApplyFilters} className="w-full" disabled={filteredTags.length === 0 && !sortBy}>
            Apply Filters
          </Button>
          {(filteredTags.length > 0 || sortBy) && (
            <Button onClick={clearFilters} variant="outline" className="w-full">
              Clear All
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
