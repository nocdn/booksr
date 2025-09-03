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
    setIsLoading(true)
    fetch("/api/bookmarks", {
      method: "POST",
      body: JSON.stringify({ url, tags }),
    })
      .then((res) => {
        if (!res.ok) {
          console.error("API error:", res.statusText)
          return null
        }
        return res.json()
      })
      .then((data) => {
        if (!data) return
        setBookmarks((prev) => [data, ...prev])
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
    <div className="flex items-center justify-center mt-16 md:mt-36 w-full px-8 flex-col gap-2">
      <Search tags={tags} onSubmit={handleSubmit} isLoading={isLoading} />
      <div className="font-geist-mono mx-0.5 flex items-center justify-between border-b border-gray-200 py-3 text-[13px] text-[#6f6f6f] w-full md:w-[680px]">
        <p className="font-lars">Title</p>
        <p className="font-lars">Created at</p>
      </div>
      <div className="mx-0.5 flex flex-col gap-4 w-full md:w-2xl mt-2.5">
        {bookmarks.map((bookmark, index) => (
          <Bookmark
            key={bookmark.id}
            bookmark={bookmark}
            onDeleteBookmark={() => {
              fetch("/api/bookmarks", {
                method: "DELETE",
                body: JSON.stringify({ id: bookmark.id }),
              })
                .then((res) => {
                  if (!res.ok) {
                    console.error("API error:", res.statusText)
                    return
                  }
                  setBookmarks((prev) =>
                    prev.filter((b) => b.id !== bookmark.id)
                  )
                })
                .catch((err) => {
                  console.error("Request failed:", err)
                })
                .finally(() => {
                  setIsLoading(false)
                })
            }}
            onEditBookmark={(id, title, url, tags) => {
              const previousBookmark = bookmarks.find((b) => b.id === id)

              let computedFavicon = previousBookmark?.favicon
              try {
                const hostname = new URL(url).hostname.replace(/^www\./, "")
                computedFavicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=256`
              } catch {}

              // Optimistic update
              setBookmarks((prev) =>
                prev.map((b) =>
                  b.id === id
                    ? { ...b, title, url, tags, favicon: computedFavicon }
                    : b
                )
              )

              const rollback = () => {
                if (!previousBookmark) return
                setBookmarks((prev) =>
                  prev.map((b) => (b.id === id ? previousBookmark : b))
                )
              }

              fetch("/api/bookmarks", {
                method: "PUT",
                body: JSON.stringify({ id, title, url, tags }),
              })
                .then((res) => {
                  if (!res.ok) {
                    console.error("API error:", res.statusText)
                    rollback()
                  }
                })
                .catch((err) => {
                  console.error("Request failed:", err)
                  rollback()
                })
            }}
            onAddTag={() => {}}
            onRemoveTag={() => {}}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}
