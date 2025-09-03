import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("bookmarks")
    .select("*")
    .order("createdAt", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url, tags } = body as { url?: string; tags?: string[] }

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Derive favicon from domain
    const hostname = new URL(url).hostname.replace(/^www\./, "")
    const favicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=256`

    // Resolve title via Peekalink when possible, fallback to Untitled
    let title = "Untitled"
    try {
      if (process.env.PEEKALINK_API_KEY) {
        const response = await fetch("https://api.peekalink.io/", {
          method: "POST",
          body: JSON.stringify({ link: url }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.PEEKALINK_API_KEY}`,
          },
        })
        const data = await response.json()
        if (response.ok && !data?.error) {
          title = data?.title || "Untitled"
        }
      } else {
        console.warn("PEEKALINK_API_KEY is not set; using fallback title")
      }
    } catch (e) {
      console.error("Peekalink lookup failed, using fallback title:", e)
    }

    // Normalize tags to array
    const tagsArray: string[] = Array.isArray(tags) ? tags : []

    // Insert into Supabase and return the created row
    const { data: inserted, error } = await supabaseAdmin
      .from("bookmarks")
      .insert([
        {
          title,
          url,
          tags: tagsArray,
          favicon,
          createdAt: new Date().toISOString(),
        },
      ])
      .select("*")
      .single()

    if (error) {
      console.error("Supabase insert error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(inserted)
  } catch (error) {
    console.error("Error processing bookmark:", error)
    return NextResponse.json(
      { error: "Failed to process bookmark" },
      { status: 500 }
    )
  }
}
