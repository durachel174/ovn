'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function EditProfilePage() {
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (data) {
        setDisplayName(data.display_name ?? '')
        setBio(data.bio ?? '')
        setAvatarUrl(data.avatar_url ?? null)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  async function handleSave() {
    setSaving(true)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    let newAvatarUrl = avatarUrl

    if (avatar) {
      const ext = avatar.name.split('.').pop()
      const path = `${session.user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, avatar, { upsert: true })

      if (uploadError) {
        setError('Avatar upload failed: ' + uploadError.message)
        setSaving(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      newAvatarUrl = publicUrl
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        display_name: displayName,
        bio,
        avatar_url: newAvatarUrl,
      })
      .eq('id', session.user.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    router.push(`/profile/${session.user.id}`)
  }

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <p className="text-stone-400 text-sm">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-serif text-stone-800">Edit profile</h1>
          <p className="text-sm text-stone-400 mt-0.5">Update your baker profile</p>
        </div>

        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 flex flex-col gap-4">

          {/* Avatar preview */}
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-mauve-100 flex items-center justify-center text-xl font-bold font-serif text-mauve-400">
                {displayName ? displayName[0].toUpperCase() : '?'}
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-stone-500 block mb-1">Profile photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setAvatar(e.target.files?.[0] ?? null)}
                className="text-xs text-stone-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1.5">Display name</label>
            <input
              type="text"
              placeholder="Your name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-mauve-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1.5">Bio</label>
            <textarea
              placeholder="Tell the community about your baking..."
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-mauve-400 resize-none"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => router.back()}
              className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-mauve-400 hover:bg-mauve-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              {saving ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}