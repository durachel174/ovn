'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type Profile = {
  id: string
  email: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
}

type Listing = {
  id: string
  title: string
  description: string
  price: number | null
  is_free: boolean
  category: string
  image_url: string | null
}

const CATEGORY_EMOJI: Record<string, string> = {
  bread: '🍞',
  pastry: '🥐',
  cake: '🎂',
  cookies: '🍪',
  other: '✨',
}

const PASTEL_COLORS = [
  'bg-rose-50',
  'bg-stone-100',
  'bg-pink-50',
  'bg-neutral-100',
  'bg-slate-100',
  'bg-zinc-100',
]

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user.id === params.userId) setIsOwner(true)

      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', params.userId)
        .single()

      const { data: listingsData } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', params.userId)
        .order('created_at', { ascending: false })

      setProfile(profileData)
      setListings(listingsData ?? [])
      setLoading(false)
    }
    fetchProfile()
  }, [params.userId])

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <p className="text-stone-400 text-sm">Loading...</p>
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <p className="text-stone-400 text-sm">Profile not found</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Profile header */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 mb-6 flex items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name ?? 'Profile'}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-mauve-100 flex items-center justify-center text-2xl font-bold font-serif text-mauve-400">
                {(profile.display_name ?? profile.email)[0].toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold font-serif text-stone-800">
              {profile.display_name ?? profile.email.split('@')[0]}
            </h1>
            <p className="text-stone-400 text-sm mt-0.5">{profile.email}</p>
            {profile.bio && (
              <p className="text-stone-500 text-sm mt-3 leading-relaxed">{profile.bio}</p>
            )}
            {isOwner && (
              <button
                onClick={() => router.push('/profile/edit')}
                className="mt-4 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-medium rounded-full transition-colors"
              >
                Edit profile
              </button>
            )}
          </div>
        </div>

        {/* Listings */}
        <div className="mb-4">
          <h2 className="text-lg font-bold font-serif text-stone-800">
            {isOwner ? 'Your listings' : `Listings by ${profile.display_name ?? profile.email.split('@')[0]}`}
          </h2>
          <p className="text-stone-400 text-xs mt-0.5">{listings.length} listing{listings.length !== 1 ? 's' : ''}</p>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-100">
            <p className="text-stone-400 text-sm">No listings yet</p>
            {isOwner && (
              <Link href="/listings/new" className="text-mauve-500 text-sm hover:underline mt-1 block">
                Post your first listing →
              </Link>
            )}
          </div>
        ) : (
          <div className="columns-2 gap-3 space-y-3">
            {listings.map(listing => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="break-inside-avoid block bg-white rounded-2xl overflow-hidden border border-stone-100 hover:shadow-md transition-shadow"
              >
                {listing.image_url ? (
                  <div className="w-full aspect-square overflow-hidden relative">
                    <img
                      src={listing.image_url}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2">
                        <p className="text-stone-800 font-semibold text-sm leading-snug line-clamp-1">
                          {listing.title}
                        </p>
                        <p className="text-mauve-500 text-xs font-semibold mt-1">
                          {listing.is_free ? <em>Complimentary</em> : `$${listing.price}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`w-full aspect-square flex flex-col items-center justify-center p-4 text-center ${PASTEL_COLORS[listing.id.charCodeAt(0) % PASTEL_COLORS.length]}`}>
                    <p className="text-stone-800 font-bold text-lg font-serif leading-snug line-clamp-3">
                      {listing.title}
                    </p>
                    {listing.description && (
                      <p className="text-stone-400 text-xs mt-2 line-clamp-3 leading-relaxed">
                        {listing.description}
                      </p>
                    )}
                    <p className="text-mauve-500 text-xs font-semibold mt-3">
                      {listing.is_free ? <em>Complimentary</em> : `$${listing.price}`}
                    </p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}