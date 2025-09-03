import React, { useEffect, useMemo, useRef, useState } from "react"
import { Check, X, SaveAll } from "lucide-react"
import { motion } from "motion/react"

// --- Types ---
export type BookmarkType = {
  id: number
  title: string
  url: string
  tags: string[]
  favicon: string
  createdAt: string // expects format like "DD/MM/YYYY, HH:MM:SS"
}

export type BookmarkProps = {
  bookmark: BookmarkType
  onDeleteBookmark: (id: number) => void
  onEditBookmark: (id: number, title: string, url: string) => void
  onAddTag: (bookmarkId: number, tag: string) => void
  onRemoveTag: (bookmarkId: number, tag: string) => void
  index: number // used for staggered animation delay
}

// --- Utils ---
function getFormattedDate(dateStr: string) {
  const [datePart, timePart] = dateStr.split(", ")
  if (!datePart || !timePart) {
    // Fallback if format is unexpected
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
    })
  }
  const [day, month, year] = datePart.split("/")
  const [hours, minutes, seconds] = timePart.split(":")
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes),
    Number(seconds)
  )
  return date.toLocaleString("en-US", { month: "short", day: "numeric" })
}

function displayUrlOnHover(url: string) {
  const cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, "")
  try {
    const urlObject = new URL(url)
    if (urlObject.pathname === "/" && !cleanUrl.endsWith("/")) {
      return `${cleanUrl}/`
    }
  } catch {
    // ignore invalid URL, return cleaned string as-is
  }
  return cleanUrl
}

// --- Component ---
export default function Bookmark({
  bookmark,
  onDeleteBookmark,
  onEditBookmark,
  onAddTag,
  onRemoveTag,
  index,
}: BookmarkProps) {
  // Derived values
  const formattedDate = useMemo(
    () => getFormattedDate(bookmark.createdAt),
    [bookmark.createdAt]
  )
  const formattedUrl = useMemo(() => {
    try {
      return new URL(bookmark.url).hostname.replace(/^www\./, "") + "/"
    } catch {
      return bookmark.url
    }
  }, [bookmark.url])

  // State
  const [isExpanded, setIsExpanded] = useState(false)
  const [isUrlHovered, setIsUrlHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Handlers
  const handleMouseEnter = () => {
    setIsExpanded(true)
  }
  const handleMouseLeave = () => {
    setIsExpanded(false)
  }

  const [newTitle, setNewTitle] = useState(bookmark.title)
  const [newUrl, setNewUrl] = useState(bookmark.url)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    console.log("bookmark.title", newTitle)
    console.log("bookmark.url", newUrl)
  }, [newTitle, newUrl])

  return (
    <div
      role="button"
      tabIndex={0}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={"select-text motion-opacity-in-0 motion-translate-y-in-[10%]"}
      style={{
        transitionDelay: `${index * 0.035}s`,
        fontFamily: "Lars",
      }}
    >
      {!isEditing ? (
        <motion.div
          layout
          key={0}
          role="button"
          tabIndex={0}
          className="flex items-center gap-2"
          title={Array.isArray(bookmark.tags) ? bookmark.tags.join(", ") : ""}
        >
          <img
            src={bookmark.favicon}
            alt={bookmark.title}
            className="h-4 w-4 cursor-pointer"
            onClick={() => {
              setIsEditing(true)
            }}
          />

          <a
            href={bookmark.url}
            className="truncate text-[15px] font-medium hover:text-[#c11a3f]"
          >
            {bookmark.title}
          </a>

          <div
            role="button"
            tabIndex={0}
            className="font-google-sans-code min-w-0 flex-1 text-sm text-gray-400"
            onMouseEnter={() => setIsUrlHovered(true)}
            onMouseLeave={() => setIsUrlHovered(false)}
          >
            <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
              {isUrlHovered ? displayUrlOnHover(bookmark.url) : formattedUrl}
            </span>
          </div>

          <X
            size={16}
            className="ml-auto cursor-pointer text-red-500 transition-opacity duration-200 hover:text-red-800"
            strokeWidth={2.25}
            style={{
              opacity: isExpanded ? 1 : 0,
              pointerEvents: isExpanded ? "auto" : "none",
            }}
            onClick={() => onDeleteBookmark(bookmark.id)}
          />

          <p className="font-sf-pro-text flex-shrink-0 whitespace-nowrap text-[13.5px] text-gray-400">
            {formattedDate}
          </p>
        </motion.div>
      ) : (
        <div className="flex gap-2 w-full mb-6 motion-opacity-in-0 motion-blur-in-[1px]">
          <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-jetbrains-mono font-semibold">TITLE</p>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    urlInputRef.current?.focus()
                  }
                }}
                ref={titleInputRef}
                className="text-sm w-full font-jetbrains-mono border border-gray-200 rounded-sm px-1.5 py-1 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <p className="text-xs font-jetbrains-mono font-semibold">
                URL
                <span className="text-gray-300 text-[11.35px] ml-1">
                  (PROTOCOL)
                </span>
              </p>
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    onEditBookmark(bookmark.id, newTitle, newUrl)
                    setIsEditing(false)
                  }
                }}
                ref={urlInputRef}
                className="text-sm w-full font-jetbrains-mono border border-gray-200 rounded-sm px-1.5 py-1 focus:outline-none"
              />
            </div>
            <div className="flex gap-2 w-full justify-between md:justify-end mt-1">
              <div className="flex items-center gap-2 text-gray-400 text-[13px] font-jetbrains-mono font-semibold mr-auto ml-0.5">
                EDITING...
              </div>
              <button
                className="text-[13px] font-jetbrains-mono font-semibold border border-gray-200 rounded-sm px-2.5 py-1 text-red-600 cursor-pointer hover:bg-gray-100 transition-all duration-100"
                onClick={() => setIsEditing(false)}
              >
                CANCEL
              </button>
              <button
                className="text-[13px] font-jetbrains-mono font-semibold border border-gray-200 rounded-sm px-2.5 py-1 flex items-center gap-1 text-blue-600 cursor-pointer hover:bg-gray-100 transition-all duration-100"
                onClick={() => {
                  onEditBookmark(bookmark.id, newTitle, newUrl)
                  setIsEditing(false)
                }}
              >
                SAVE <Check size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
