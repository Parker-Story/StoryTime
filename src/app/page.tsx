import Link from 'next/link'
import { Tv, Star, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import { Nav } from '@/components/Nav'

export const metadata = { title: 'StoryTime — Track the shows you love' }

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 gap-6">
        <div className="flex items-center gap-3 mb-2">
          <Tv className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight max-w-2xl">
          Track every show you watch.
          <br />
          <span className="text-primary">Share it with people you love.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-lg">
          StoryTime is a personal TV show tracker for you and your friends. Rate episodes,
          leave reviews, and see what your circle is watching.
        </p>
        <div className="flex gap-3 mt-2">
          <Link href="/signup" className={buttonVariants({ size: 'lg' })}>
            Get started — it&apos;s free
          </Link>
          <Link href="/login" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
            Log in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 px-4 py-20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div className="space-y-3">
            <div className="flex justify-center">
              <Star className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Rate &amp; Review</h3>
            <p className="text-muted-foreground text-sm">
              Score shows and episodes 0–5 stars. Leave written reviews — with a spoiler
              toggle so you never ruin the ending.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-center">
              <Tv className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Track Episodes</h3>
            <p className="text-muted-foreground text-sm">
              Check off episodes as you watch them. Know exactly where you left off in
              every season of every show.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-center">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Friend Activity</h3>
            <p className="text-muted-foreground text-sm">
              Add friends and see what they&apos;re watching, rating, and reviewing in real
              time on your personal dashboard.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t px-4 py-6 text-center text-sm text-muted-foreground">
        StoryTime — built for the shows you love
      </footer>
    </div>
  )
}
