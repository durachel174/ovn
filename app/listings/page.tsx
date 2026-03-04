'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const ListingsMap = dynamic(() => import('@/components/ListingsMap'), { ssr: false })

type Listing = {
  id: string
  title: string
  description: string
  price: number | null
  is_free: boolean
  is_sold: boolean
  category: string
  image_url: string | null
  created_at: string
  lat: number | null
  lng: number | null
}

const CATEGORY_LABELS: Record<string, string> = {
  bread: '🍞 Bread',
  pastry: '🥐 Pastry',
  cake: '🎂 Cake',
  cookies: '🍪 Cookies',
  other: '✨ Other',
}

const CATEGORY_EMOJI: Record<string, string> = {
  bread: '🍞',
  pastry: '🥐',
  cake: '🎂',
  cookies: '🍪',
  other: '✨',
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'map'>('grid')
  const [filter, setFilter] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function fetchListings() {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('data:', data, 'error:', error)
      setListings(data ?? [])
      setLoading(false)
    }
    fetchListings()
  }, [])

  const filtered = filter
    ? listings.filter(l => l.category === filter)
    : listings

const PASTEL_COLORS = [
  'bg-rose-50',
  'bg-stone-100',
  'bg-mauve-100',
  'bg-pink-50',
  'bg-neutral-100',
  'bg-slate-100',
  'bg-zinc-100',
  'bg-mauve-50',
]

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 font-serif">Listings</h1>
            <p className="text-sm text-stone-400 mt-0.5">Fresh baked goods near you</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${view === 'grid' ? 'bg-mauve-400 text-white' : 'bg-white text-stone-500 border border-stone-200'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setView('map')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${view === 'map' ? 'bg-mauve-400 text-white' : 'bg-white text-stone-500 border border-stone-200'}`}
            >
              Map
            </button>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 flex-wrap mb-6">
          {['', 'bread', 'pastry', 'cake', 'cookies', 'other'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === cat
                  ? 'bg-stone-800 text-white'
                  : 'bg-white text-stone-500 border border-stone-200 hover:border-stone-400'
              }`}
            >
              {cat === '' ? 'All' : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl aspect-square animate-pulse" />
            ))}
          </div>
        )}

        {view === 'map' ? (
          <ListingsMap listings={filtered} />
        ) : (
          <>
            {filtered.length === 0 && !loading && (
              <div className="text-center py-16">
                <p className="text-stone-400 text-sm">No listings found</p>
                <Link href="/listings/new" className="text-mauve-500 text-sm hover:underline mt-1 block">
                  Be the first to post one →
                </Link>
              </div>
            )}

            {/* Pinterest-style 2-column grid */}
            <div className="columns-2 gap-3 space-y-3">
              {filtered.map(listing => (
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
                            className={`w-full h-full object-cover ${listing.is_sold ? 'opacity-50' : ''}`}
                        />
                        {listing.is_sold && (
                            <div className="absolute top-2 left-2 bg-stone-800 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            Sold
                            </div>
                        )}
                        <div className="absolute bottom-3 left-3 right-3">
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2">
                                <p className="text-stone-800 font-semibold text-sm leading-snug line-clamp-1">
                                {listing.title}
                                </p>
                                {listing.description && (
                                <p className="text-stone-500 text-xs mt-0.5 line-clamp-1">
                                    {listing.description}
                                </p>
                                )}
                                <p className="text-mauve-500 text-xs font-semibold mt-1">
                                {listing.is_free ? <em>Complimentary</em> : `$${listing.price}`}
                                </p>
                            </div>
                        </div>
                    </div>
                  ) : (
                    <div className={`w-full aspect-square flex flex-col items-center justify-center p-4 text-center relative ${PASTEL_COLORS[listing.id.charCodeAt(0) % PASTEL_COLORS.length]} ${listing.is_sold ? 'opacity-50' : ''}`}>
                        {listing.is_sold && (
                            <div className="absolute top-2 left-2 bg-stone-800 text-white text-xs font-semibold px-2 py-1 rounded-full">
                            Sold
                            </div>
                        )}
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
          </>
        )}
      </div>

      {/* Floating new listing button */}
      <Link
        href="/listings/new"
        className="fixed bottom-6 right-6 bg-mauve-400 hover:bg-mauve-500 text-white text-sm font-semibold px-5 py-3 rounded-full shadow-lg transition-colors"
      >
        + New listing
      </Link>
    </div>
  )
}