'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function sendFriendRequest(addresseeId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }
  if (user.id === addresseeId) return { error: 'Cannot add yourself' }

  const { error } = await supabase.from('friendships').insert({
    requester_id: user.id,
    addressee_id: addresseeId,
  } as never)

  if (error) {
    if (error.code === '23505') return { error: 'Request already sent' }
    return { error: error.message }
  }

  revalidatePath('/friends')
  return { error: null }
}

export async function acceptFriendRequest(friendshipId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' } as never)
    .eq('id', friendshipId)
    .eq('addressee_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/friends')
  revalidatePath('/dashboard')
  return { error: null }
}

export async function declineFriendRequest(friendshipId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId)
    .eq('addressee_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/friends')
  return { error: null }
}

export async function removeFriend(friendshipId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId)

  if (error) return { error: error.message }

  revalidatePath('/friends')
  revalidatePath('/dashboard')
  return { error: null }
}
