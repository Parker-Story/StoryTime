import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/SettingsForm'
import { Profile } from '@/types/database'

export const metadata = { title: 'Settings — StoryTime' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>
      <SettingsForm profile={profile as unknown as Profile} />
    </div>
  )
}
