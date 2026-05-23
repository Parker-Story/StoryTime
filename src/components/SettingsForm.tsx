'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { updateProfile, changePassword } from '@/lib/actions/settings-actions'
import { Profile } from '@/types/database'
import { Separator } from '@/components/ui/separator'

export function SettingsForm({ profile }: { profile: Profile }) {
  const [isPending, startTransition] = useTransition()
  const [bio, setBio] = useState(profile.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)

    const supabase = createClient()
    const path = `${profile.id}/avatar`
    const { error, data } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (error) {
      toast.error('Upload failed: ' + error.message)
      setAvatarUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    setAvatarUrl(publicUrl)
    const result = await updateProfile({ avatarUrl: publicUrl })
    if (result.error) toast.error(result.error)
    else toast.success('Avatar updated!')
    setAvatarUploading(false)
  }

  function saveProfile() {
    startTransition(async () => {
      const result = await updateProfile({ bio: bio.trim() })
      if (result.error) toast.error(result.error)
      else toast.success('Profile saved!')
    })
  }

  function savePassword() {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    startTransition(async () => {
      const result = await changePassword(newPassword)
      if (result.error) toast.error(result.error)
      else {
        toast.success('Password changed!')
        setNewPassword('')
        setConfirmPassword('')
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* Profile section */}
      <div className="space-y-4">
        <h2 className="font-semibold">Profile</h2>

        <div className="space-y-2">
          <Label>Username</Label>
          <Input value={profile.username} disabled />
          <p className="text-xs text-muted-foreground">Usernames cannot be changed.</p>
        </div>

        {/* Avatar */}
        <div className="space-y-2">
          <Label>Avatar</Label>
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback>{profile.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <label className="cursor-pointer">
                <span className="text-sm text-primary hover:underline">
                  {avatarUploading ? 'Uploading…' : 'Upload new avatar'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarChange}
                  disabled={avatarUploading}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell people a bit about yourself…"
            rows={3}
            maxLength={300}
          />
          <p className="text-xs text-muted-foreground">{bio.length}/300</p>
        </div>

        <Button onClick={saveProfile} disabled={isPending}>
          {isPending ? 'Saving…' : 'Save Profile'}
        </Button>
      </div>

      <Separator />

      {/* Password section */}
      <div className="space-y-4">
        <h2 className="font-semibold">Change Password</h2>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <Button onClick={savePassword} disabled={isPending || !newPassword}>
            {isPending ? 'Saving…' : 'Change Password'}
          </Button>
        </div>
      </div>
    </div>
  )
}
