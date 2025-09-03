"use client"
import { useState, useEffect, useRef } from "react"
import { Loader, Plus, X } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { Badge } from "@/components/ui/badge"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover"

type Tag = {
  value: string
  label: string
  textColor: string
  bgColor: string
}

export default function Search({
  tags,
  onSubmit,
  isLoading,
}: {
  tags: Tag[]
  onSubmit: (tags: string[], url: string) => void
  isLoading: boolean
}) {
  const firstInput = useRef<HTMLInputElement>(null)
  const [tagList, setTagList] = useState<string[]>([])
  const [showingCommand, setShowingCommand] = useState<boolean>(false)
  const [availableTags, setAvailableTags] = useState<Tag[]>(tags)
  const [tagSearchValue, setTagSearchValue] = React.useState("")
  const [isMobileViewport, setIsMobileViewport] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/") return

      if (showingCommand) return

      const isMainInputFocused = document.activeElement === firstInput.current

      if (isMainInputFocused) {
        const inputEl = firstInput.current
        const value = inputEl?.value ?? ""
        // Only open tag menu if the slash is preceded by whitespace or at the start
        const caretPos = inputEl?.selectionStart ?? value.length
        const prevChar = caretPos > 0 ? value[caretPos - 1] : ""
        const precededBySpace = caretPos === 0 || /\s/.test(prevChar)

        if (precededBySpace) {
          e.preventDefault()
          setShowingCommand(true)
        }
      } else {
        e.preventDefault()
        firstInput.current?.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showingCommand])

  const removeTag = (label: string) => {
    setTagList((prevTags) => prevTags.filter((t) => t !== label))

    setAvailableTags((prev) => {
      const option = tags.find((t) => t.label === label)
      if (!option) return prev
      if (prev.some((t) => t.value === option.value)) return prev
      return [...prev, option]
    })
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      className="flex flex-col items-center gap-2 md:gap-0 justify-center w-full"
      style={{ touchAction: "manipulation" }}
    >
      <Popover
        open={showingCommand}
        onOpenChange={(open) => {
          setShowingCommand(open)
          if (!open) {
            setTimeout(() => {
              firstInput.current?.focus()
            }, 0)
          }
        }}
      >
        <PopoverAnchor asChild>
          <div
            className="group flex h-10 items-center rounded-sm border border-gray-200 px-2.5 shadow-xs transition-all focus-within:outline-none md:w-[680px] w-full cursor-text bg-white font-lars"
            onClick={() => {
              firstInput.current?.focus()
            }}
          >
            <div className="flex items-center flex-1 min-w-0">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    className="mt-[1px] opacity-40 mx-[1px] mr-[9px]"
                    transition={{
                      duration: 0.3,
                    }}
                  >
                    <div
                      className="spinner mr-[0.5px]"
                      style={{
                        animation: "spin 1s linear infinite",
                      }}
                    >
                      <Loader className="h-3.5 w-3.5" />
                    </div>
                  </motion.div>
                ) : (
                  <Plus
                    size={17}
                    strokeWidth={2}
                    className="mt-[1px] opacity-40 mx-[1px] mr-[7px] cursor-pointer motion-opacity-in-0 motion-blur-in-[2px] motion-scale-in-50"
                  />
                )}
              </AnimatePresence>
              <input
                ref={firstInput}
                type="text"
                placeholder="Insert a link, or just plain text"
                className="[field-sizing:content] font-geist bg-transparent text-base leading-none font-[450] outline-none placeholder:text-gray-500/75 scale-[0.875] origin-left w-full"
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return
                  if (showingCommand) return
                  e.preventDefault()
                  const urlValue = firstInput.current?.value?.trim() ?? ""
                  if (!urlValue) return
                  onSubmit(tagList, urlValue)
                }}
              />
            </div>
            {/* {isMobileViewport && (
              <motion.div
                className="flex items-center gap-1.5 text-sm font-geist max-w-[50%] overflow-x-scroll justify-end"
                style={{ scrollbarWidth: "none" }}
              >
                <AnimatePresence initial={false}>
                  {tagList.map((tag) => (
                    <motion.div
                      key={tag}
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -6 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                        mass: 0.6,
                      }}
                      className="cursor-pointer"
                      onClick={() => removeTag(tag)}
                      title={`Remove tag: ${tag}`}
                    >
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-1 bg-neutral-100 text-neutral-800 hover:text-red-500 hover:bg-red-100 dark:bg-neutral-800 dark:text-neutral-100 transition-colors duration-75"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          aria-label={`Remove ${tag}`}
                          className="rounded p-0.5 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </Badge>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )} */}
          </div>
        </PopoverAnchor>
        <AnimatePresence>
          {showingCommand && (
            <PopoverContent
              asChild
              side="bottom"
              align="start"
              className="w-[200px] p-0 shadow-xs font-medium"
            >
              <motion.div
                style={{ filter: "blur(0px)" }}
                initial={{
                  opacity: 0,
                  filter: "blur(2px)",
                  scale: 0.95,
                  y: 12,
                }}
                animate={{ opacity: 1, filter: "blur(0px)", scale: 1, y: 0 }}
                exit={{ opacity: 0, filter: "blur(3px)", scale: 0.95, y: 12 }}
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 32,
                  mass: 0.7,
                }}
              >
                <Command>
                  <CommandInput
                    autoFocus
                    placeholder="Filter tags"
                    className="h-9 font-semibold"
                  />
                  <CommandList>
                    <CommandEmpty>No tags found.</CommandEmpty>
                    <CommandGroup>
                      {availableTags.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={(currentValue) => {
                            const selected = availableTags.find(
                              (t) => t.value === currentValue
                            )
                            if (!selected) {
                              setShowingCommand(false)
                              return
                            }

                            // Add to tagList if not already present
                            setTagList((prev) => {
                              const next = prev.includes(selected.label)
                                ? prev
                                : [...prev, selected.label]
                              return next
                            })

                            // Remove from availableTags
                            setAvailableTags((prev) =>
                              prev.filter((t) => t.value !== selected.value)
                            )

                            // Clear search highlight and close
                            setTagSearchValue("")
                            setShowingCommand(false)
                            // Return focus to main input after closing
                            setTimeout(() => {
                              firstInput.current?.focus()
                            }, 0)
                          }}
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: option.bgColor,
                            }}
                          />
                          {option.label}
                          <Check
                            className={cn(
                              "ml-auto",
                              tagSearchValue === option.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </motion.div>
            </PopoverContent>
          )}
        </AnimatePresence>
      </Popover>
      <motion.div
        className="flex items-center gap-1.5 text-sm font-geist overflow-x-scroll w-full md:w-2xl md:mt-3"
        style={{ scrollbarWidth: "none" }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {tagList.map((tag) => (
            <motion.div
              key={tag}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -6 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                mass: 0.6,
              }}
              className="cursor-pointer"
              onClick={() => removeTag(tag)}
              title={`Remove tag: ${tag}`}
            >
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-neutral-100 text-neutral-800 hover:text-red-500 hover:bg-red-100 dark:bg-neutral-800 dark:text-neutral-100 transition-colors duration-75"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  aria-label={`Remove ${tag}`}
                  className="rounded p-0.5 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
