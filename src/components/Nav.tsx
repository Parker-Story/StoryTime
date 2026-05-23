import Link from 'next/link'
import { Search, Tv } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from './ThemeToggle'
import { signOut } from '@/lib/actions/auth-actions'
import { cn } from '@/lib/utils'
import { Profile } from '@/types/database'

export async function Nav() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: Pick<Profile, 'username' | 'avatar_url'> | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', user.id)
      .single()
    profile = data as Pick<Profile, 'username' | 'avatar_url'> | null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 font-bold text-lg">
          <Tv className="h-5 w-5 text-primary" />
          StoryTime
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user && profile ? (
            <>
              <Link
                href="/search"
                className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-9 w-9')}
                aria-label="Search shows"
              >
                <Search className="h-4 w-4" />
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger
                  className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="User menu"
                >
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.username} />
                    <AvatarFallback>
                      {profile.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{profile.username}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem render={<Link href={`/profile/${profile.username}`} />}>
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/friends" />}>
                    Friends
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/settings" />}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">
                    <form action={signOut} className="w-full">
                      <button type="submit" className="w-full text-left">
                        Sign out
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                Log in
              </Link>
              <Link href="/signup" className={buttonVariants({ size: 'sm' })}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
