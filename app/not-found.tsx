export default function NotFound() {
  return (
    <div className="grid place-content-center min-h-dvh text-center p-8">
      <div>
        <p className="text-sm text-neutral-500">404</p>
        <h1 className="text-2xl font-semibold mt-1">Page not found</h1>
        <p className="text-neutral-600 mt-2">
          The page you are looking for does not exist.
        </p>
      </div>
    </div>
  )
}
