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
    const { url, tags } = body as { url?: string; tags?: string[] | string }

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

    // Normalize tags to array (supports array or newline-separated string)
    let tagsArray: string[] = []
    if (Array.isArray(tags)) {
      tagsArray = tags
    } else if (typeof tags === "string") {
      tagsArray = tags
        .split(/\r?\n/)
        .map((t) => t.trim())
        .filter(Boolean)
    }

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

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, title, url, tags } = body as {
      id?: number
      title?: string
      url?: string
      tags?: string[]
    }

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    // Build update object with only provided fields
    const updateData: any = {}

    if (title !== undefined) {
      updateData.title = title
    }

    if (url !== undefined) {
      // Validate URL format if provided
      try {
        new URL(url)
      } catch {
        return NextResponse.json(
          { error: "Invalid URL format" },
          { status: 400 }
        )
      }

      updateData.url = url

      // Update favicon if URL changed
      const hostname = new URL(url).hostname.replace(/^www\./, "")
      updateData.favicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=256`
    }

    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags : []
    }

    // Update in Supabase and return the updated row
    const { data: updated, error } = await supabaseAdmin
      .from("bookmarks")
      .update(updateData)
      .eq("id", id)
      .select("*")
      .single()

    if (error) {
      console.error("Supabase update error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating bookmark:", error)
    return NextResponse.json(
      { error: "Failed to update bookmark" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { id } = body as { id?: number }

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from("bookmarks")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Supabase delete error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting bookmark:", error)
    return NextResponse.json(
      { error: "Failed to delete bookmark" },
      { status: 500 }
    )
  }
}
