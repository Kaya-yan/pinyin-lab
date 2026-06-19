import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-serif font-bold text-primary mb-4">404</h1>
      <p className="text-lg text-text-muted mb-8">Page not found</p>
      <Link
        href="/"
        className="inline-flex items-center justify-center h-12 px-8 bg-primary text-white text-base font-medium rounded-md hover:bg-primary/90 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
