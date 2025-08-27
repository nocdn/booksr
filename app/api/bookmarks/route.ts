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
    const { url, tags } = body
    const tagString = tags.join(",")

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Check if API key is configured
    if (!process.env.PEEKALINK_API_KEY) {
      console.error("PEEKALINK_API_KEY environment variable is not set")
      return NextResponse.json({
        url,
        title: "Untitled",
      })
    }

    const response = await fetch("https://api.peekalink.io/", {
      method: "POST",
      body: JSON.stringify({ link: url }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer sk_hnz6xtip2qq8f2fug93c0h4wnxw8xwjn`,
      },
    })

    const data = await response.json()

    // Handle Peekalink API errors
    if (!response.ok || data.error) {
      console.error("Peekalink API error:", data)
      return NextResponse.json({
        url,
        title: "Untitled",
      })
    }

    const title = data.title || "Untitled"

    return NextResponse.json({
      url,
      title,
    })
  } catch (error) {
    console.error("Error processing bookmark:", error)
    return NextResponse.json(
      { error: "Failed to process bookmark" },
      { status: 500 }
    )
  }
}
