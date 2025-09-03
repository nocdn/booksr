import React, { useEffect, useMemo, useRef, useState } from "react"
import { Plus, X } from "lucide-react"
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
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [isOptionHeld, setIsOptionHeld] = useState(false)
  const [editingState, setEditingState] = useState<"none" | "title" | "url">(
    "none"
  )
  const [editableTitle, setEditableTitle] = useState(bookmark.title)
  const [editableUrl, setEditableUrl] = useState(bookmark.url)
  const [isUrlHovered, setIsUrlHovered] = useState(false)

  useEffect(() => {
    // keep local edit buffers in sync if bookmark prop changes
    setEditableTitle(bookmark.title)
    setEditableUrl(bookmark.url)
  }, [bookmark.title, bookmark.url])

  // Track Alt/Option key globally (like Svelte onMount listeners)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) setIsOptionHeld(true)
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.altKey) setIsOptionHeld(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  // Handlers
  const handleMouseEnter = () => {
    console.log("entering index", index)
  }
  const handleMouseLeave = () => {
    if (!isAddingTag) setIsExpanded(false)
  }

  const enterTitleEditMode: React.MouseEventHandler<HTMLAnchorElement> = (
    e
  ) => {
    if (isOptionHeld) {
      e.preventDefault()
      setEditableTitle(bookmark.title)
      setEditableUrl(bookmark.url)
      setEditingState("title")
    }
  }

  const enterUrlEditMode = (e?: React.SyntheticEvent) => {
    e?.preventDefault()
    if (isOptionHeld) {
      setEditableTitle(bookmark.title)
      setEditableUrl(bookmark.url)
      setEditingState("url")
    } else {
      void navigator.clipboard.writeText(bookmark.url)
    }
  }

  const handleEditKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    e
  ) => {
    if (e.key === "Enter") {
      onEditBookmark(bookmark.id, editableTitle, editableUrl)
      setEditingState("none")
    } else if (e.key === "Escape") {
      setEditingState("none")
    }
  }

  const [newTagValue, setNewTagValue] = useState("")
  const newTagRef = useRef<HTMLInputElement | null>(null)

  // Focus the tag input when toggled on
  useEffect(() => {
    if (isAddingTag) newTagRef.current?.focus()
  }, [isAddingTag])

  const handleNewTag = () => {
    const tag = newTagValue.trim()
    if (tag) onAddTag(bookmark.id, tag)
    setNewTagValue("")
    setIsAddingTag(false)
  }

  const tagsRowExpanded =
    isExpanded && (isOptionHeld || isAddingTag) && bookmark.tags.length > 0

  return (
    <div
      role="button"
      tabIndex={0}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="select-text motion-opacity-in-0 motion-translate-y-in-[10%]"
      style={{
        transitionDelay: `${index * 0.035}s`,
      }}
    >
      {/* Top row */}
      <motion.div
        role="button"
        tabIndex={0}
        className="flex items-center gap-2"
      >
        <img src={bookmark.favicon} alt={bookmark.title} className="h-4 w-4" />

        {editingState === "title" ? (
          <input
            type="text"
            value={editableTitle}
            onChange={(e) => setEditableTitle(e.target.value)}
            onKeyDown={handleEditKeyDown}
            onBlur={() => setEditingState("none")}
            autoFocus
            className="font-geist w-full truncate bg-transparent text-[15px] font-medium focus:outline-none"
          />
        ) : editingState === "url" ? (
          <input
            type="text"
            value={editableUrl}
            onChange={(e) => setEditableUrl(e.target.value)}
            onKeyDown={handleEditKeyDown}
            onBlur={() => setEditingState("none")}
            autoFocus
            className="font-google-sans-code w-full bg-transparent py-0.5 text-sm text-gray-400 focus:outline-none"
          />
        ) : (
          <>
            <a
              href={bookmark.url}
              className={`font-geist-sans truncate text-[15px] font-medium ${
                !isOptionHeld ? "hover:text-[#c11a3f]" : "cursor-text"
              }`}
              onClick={enterTitleEditMode}
            >
              {bookmark.title}
            </a>

            <div
              role="button"
              tabIndex={0}
              className="font-google-sans-code min-w-0 flex-1 text-sm text-gray-400"
              onClick={enterUrlEditMode}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") enterUrlEditMode(e)
              }}
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
                opacity: isExpanded && isOptionHeld ? 1 : 0,
                pointerEvents: isExpanded && isOptionHeld ? "auto" : "none",
              }}
              onClick={() => onDeleteBookmark(bookmark.id)}
            />

            <p className="font-sf-pro-text flex-shrink-0 whitespace-nowrap text-[13.5px] text-gray-400">
              {formattedDate}
            </p>
          </>
        )}
      </motion.div>

      {/* Tags row */}
      <div
        className={`flex w-full items-center gap-2 transition-all ${
          tagsRowExpanded ? "h-8" : "h-0"
        }`}
      >
        {bookmark.tags.length > 0 &&
          isExpanded &&
          (isOptionHeld || isAddingTag) && (
            <>
              {bookmark.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onRemoveTag(bookmark.id, tag)}
                  className="font-google-sans-code mt-1 w-fit cursor-pointer rounded-sm bg-[#F1F1F1] px-2 py-1 text-xs font-medium text-[#787879] transition-colors hover:bg-[#FFEEED] hover:text-[#FF574B]"
                >
                  {tag.toUpperCase()}
                </button>
              ))}

              {isAddingTag ? (
                <input
                  type="text"
                  ref={newTagRef}
                  value={newTagValue}
                  onChange={(e) => setNewTagValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleNewTag()
                    } else if (e.key === "Escape") {
                      setIsAddingTag(false)
                      setNewTagValue("")
                    }
                  }}
                  onBlur={() => {
                    setIsAddingTag(false)
                    setNewTagValue("")
                  }}
                  className="font-google-sans-code mt-1 w-fit py-1 pl-1.5 text-xs font-medium uppercase focus:outline-gray-300"
                />
              ) : (
                <div>
                  <Plus
                    size={16}
                    className="cursor-pointer text-[#787879]"
                    onClick={() => setIsAddingTag(true)}
                  />
                </div>
              )}
            </>
          )}
      </div>
    </div>
  )
}
