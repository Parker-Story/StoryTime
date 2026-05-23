'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: {
  bio?: string
  avatarUrl?: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const update: Record<string, string | undefined> = {}
  if (data.bio !== undefined) update.bio = data.bio
  if (data.avatarUrl !== undefined) update.avatar_url = data.avatarUrl

  const { error } = await supabase
    .from('profiles')
    .update(update as never)
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/settings')
  revalidatePath(`/dashboard`)
  return { error: null }
}

export async function changePassword(newPassword: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: error.message }
  return { error: null }
}
