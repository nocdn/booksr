"use client"
import Search from "@/components/Search"

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
      label: "Icon",
      textColor: "#803300",
      bgColor: "#FFF4EE",
    },
  ]

  const handleSubmit = (tags: string[], url: string) => {
    console.log(tags, url)
  }

  return (
    <div className="grid place-content-center mt-32">
      <Search tags={tags} onSubmit={handleSubmit} />
    </div>
  )
}
