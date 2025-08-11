import React, { useEffect, useLayoutEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"

export default function SmoothCaretInputDemo() {
  const [value, setValue] = useState("")
  const [focused, setFocused] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const mirrorRef = useRef<HTMLSpanElement>(null)

  // Animated caret x-position in px (relative to the input's left edge)
  const [caretX, setCaretX] = useState(0)

  // Keep these in sync with the input's padding classes (px-5 -> 1.25rem = 20px)
  const PADDING_LEFT = 20 // pl-5
  const PADDING_RIGHT = 20 // pr-5

  // Convert plain spaces so the mirror preserves trailing/duplicate spaces
  const toMirrorText = (s: string) =>
    s.length ? s.replace(/ /g, "\u00A0") : ""

  const placeNativeCaretAtEnd = () => {
    const el = inputRef.current
    if (!el) return
    // Defer to ensure the browser has processed the input event first
    requestAnimationFrame(() => {
      const end = el.value.length
      try {
        el.setSelectionRange(end, end)
      } catch {}
    })
  }

  const measure = () => {
    const input = inputRef.current
    const mirror = mirrorRef.current
    if (!input || !mirror) return

    mirror.textContent = toMirrorText(input.value)

    // Width of: left padding + text width
    const rawWidth = mirror.offsetWidth // includes pl-5 from mirror

    // Subtract the input's internal horizontal scroll (when text overflows)
    const scrolledX = rawWidth - input.scrollLeft

    // Clamp caret inside the visible input (account for right padding)
    const maxX = input.clientWidth - PADDING_RIGHT
    const clamped = Math.max(PADDING_LEFT, Math.min(scrolledX, maxX))

    setCaretX(clamped)
  }

  // Measure on first mount, value changes, focus/blur, and resize
  useLayoutEffect(() => {
    measure()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  useEffect(() => {
    const handle = () => measure()
    window.addEventListener("resize", handle)
    return () => window.removeEventListener("resize", handle)
  }, [])

  // Keep the caret aligned when the input scrolls horizontally
  const handleScroll = () => measure()

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setValue(e.target.value)
    placeNativeCaretAtEnd()
  }

  const handleFocus: React.FocusEventHandler<HTMLInputElement> = () => {
    setFocused(true)
    placeNativeCaretAtEnd()
    measure()
  }

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = () => {
    setFocused(false)
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <label className="mb-3 block text-slate-700/90 text-sm font-medium">
          Smooth custom-caret input
        </label>

        <div className="relative">
          {/* The actual input. Native caret hidden via caret-transparent */}
          <input
            ref={inputRef}
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onScroll={handleScroll}
            placeholder="Type something…"
            aria-label="Smooth custom caret input"
            className="w-full rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm px-5 py-4 text-lg text-slate-900 shadow-sm outline-none transition [caret-color:transparent]
                       focus:ring-4 focus:ring-slate-200/70 focus:border-slate-300
                       placeholder:text-slate-400"
          />

          {/* Decorative chrome: subtle inset top light and bottom shadow */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)]" />

          {/* Hidden mirror for measuring the rendered text width */}
          <span
            ref={mirrorRef}
            aria-hidden
            className="invisible pointer-events-none absolute left-0 top-0 whitespace-pre pl-5 pr-0 py-4 text-lg font-sans tracking-normal"
          />

          {/* Custom animated caret */}
          <AnimatePresence>
            {focused && (
              <motion.div
                key="caret-wrapper"
                className="pointer-events-none absolute left-0 top-0 h-full"
                // Move horizontally with a spring for smoothness
                animate={{ x: caretX }}
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 700,
                  damping: 30,
                  mass: 0.25,
                }}
              >
                <motion.div
                  key="caret"
                  className="absolute top-1/2 -translate-y-1/2 h-6 w-[2px] bg-slate-900 rounded-full"
                  // Blink by animating opacity in a loop
                  animate={{ opacity: [1, 1, 0, 0, 1] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "linear",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Helper text */}
        <p className="mt-3 text-sm text-slate-500">
          The native caret is hidden. The custom caret always glides to the end
          of your text and stays aligned even when the content overflows.
        </p>
      </div>
    </div>
  )
}
