"use client"
import Search from "@/components/Search"
import { useEffect, useState } from "react"
import Bookmark from "@/components/Bookmark"

export default function Home() {
  const tags = [
    {
      value: "fonts",
      label: "Fonts",
      textColor: "#00664F",
      bgColor: "#E1FAE7",
    },
    {
      value: "inspiration",
      label: "Inspiration",
      textColor: "#004D80",
      bgColor: "#E3F4FF",
    },
    {
      value: "employment",
      label: "Employment",
      textColor: "#803300",
      bgColor: "#FEEEED",
    },
    {
      value: "animations",
      label: "Animations",
      textColor: "#004D80",
      bgColor: "#F8F5FF",
    },
    {
      value: "icons",
      label: "Icons",
      textColor: "#803300",
      bgColor: "#FFF4EE",
    },
  ]

  const handleSubmit = (tags: string[], url: string) => {
    console.log(tags, url)
    setIsLoading(true)
    fetch("/api/bookmarks", {
      method: "POST",
      body: JSON.stringify({ url, tags }),
    })
      .then((res) => {
        if (!res.ok) {
          console.error("API error:", res.statusText)
          return
        }
        return res.json()
      })
      .then((data) => {
        console.log(data)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error("Request failed:", err)
        setIsLoading(false)
      })
  }

  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/bookmarks", { cache: "no-store" })
        const json = await res.json()

        if (!res.ok) {
          console.error("API error:", json?.error ?? res.statusText)
          return
        }

        setBookmarks(json)
      } catch (err) {
        console.error("Request failed:", err)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  return (
    <div className="flex items-center justify-center mt-16 md:mt-36 w-full px-8 flex-col gap-4">
      <Search tags={tags} onSubmit={handleSubmit} isLoading={isLoading} />
      <div className="font-geist-mono ml-[3px] flex items-center justify-between border-b border-gray-200 py-3 text-sm text-gray-400 w-full md:w-2xl">
        <p className="font-sans font-[410]">Title</p>
        <p className="font-sans font-[410]">Date</p>
      </div>
      <div className="ml-[3px] flex flex-col gap-3 w-full md:w-2xl">
        {bookmarks.map((bookmark, index) => (
          <Bookmark
            key={bookmark.id}
            bookmark={bookmark}
            onDeleteBookmark={() => {}}
            onEditBookmark={() => {}}
            onAddTag={() => {}}
            onRemoveTag={() => {}}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}
