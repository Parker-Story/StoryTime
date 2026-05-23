import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <h2 className="text-2xl font-semibold">Page not found</h2>
      <p className="text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/dashboard" className={buttonVariants()}>
        Go to Dashboard
      </Link>
    </div>
  )
}
