import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from("bookmarks").select("tags")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const uniqueTags = new Set<string>()
    for (const bookmark of data || []) {
      let bookmarkTags: string[] = []
      const raw = (bookmark as any).tags

      if (Array.isArray(raw)) {
        bookmarkTags = raw
      } else if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            bookmarkTags = parsed
          }
        } catch {}
      }

      for (const tag of bookmarkTags) {
        if (typeof tag === "string" && tag.trim()) {
          uniqueTags.add(tag.trim())
        }
      }
    }

    const sortedLabels = Array.from(uniqueTags).sort((a, b) =>
      a.localeCompare(b)
    )
    const output = sortedLabels.join(", ")

    return new Response(output, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to load tags" },
      { status: 500 }
    )
  }
}
