import Search from "@/components/Search"

export default function Home() {
  const tags = [
    { value: "fonts", label: "Fonts" },
    { value: "inspiration", label: "Inspiration" },
    { value: "employment", label: "Employment" },
    { value: "animations", label: "Animations" },
    { value: "icons", label: "Icon" },
  ]

  return (
    <div className="grid place-content-center mt-32">
      <Search tags={tags} />
    </div>
  )
}
