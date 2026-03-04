'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

type Listing = {
  id: string
  title: string
  description: string
  price: number | null
  is_free: boolean
  category: string
  image_url: string | null
  seller_id: string
}

const CATEGORY_LABELS: Record<string, string> = {
  bread: '🍞 Bread',
  pastry: '🥐 Pastry',
  cake: '🎂 Cake',
  cookies: '🍪 Cookies',
  other: '✨ Other',
}

export default function ListingPage() {
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [messaging, setMessaging] = useState(false)
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    async function fetch() {
      const { data: { session } } = await supabase.auth.getSession()
      setUserId(session?.user.id ?? null)

      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('id', params.id)
        .single()
      setListing(data)
      setLoading(false)
    }
    fetch()
  }, [params.id])

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this listing?')) return
    setDeleting(true)
    await supabase.from('listings').delete().eq('id', listing!.id)
    router.push('/listings')
  }

  async function handleSendMessage() {
    setError('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    const user = session.user
    if (user.id === listing?.seller_id) {
      setError("You can't message yourself")
      return
    }

    let { data: thread } = await supabase
      .from('threads')
      .select('id')
      .eq('listing_id', listing!.id)
      .eq('buyer_id', user.id)
      .single()

    if (!thread) {
      const { data: newThread, error: threadError } = await supabase
        .from('threads')
        .insert({
          listing_id: listing!.id,
          buyer_id: user.id,
          seller_id: listing!.seller_id,
        })
        .select('id')
        .single()

      if (threadError) { setError(threadError.message); return }
      thread = newThread
    }

    const { error: msgError } = await supabase
      .from('messages')
      .insert({
        thread_id: thread!.id,
        sender_id: user.id,
        body: message,
      })

    if (msgError) { setError(msgError.message); return }
    setSent(true)
    setMessage('')
  }

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <p className="text-stone-400 text-sm">Loading...</p>
    </div>
  )

  if (!listing) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <p className="text-stone-400 text-sm">Listing not found</p>
    </div>
  )

  const isSeller = userId === listing.seller_id

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => router.push('/listings')}
          className="text-sm text-stone-400 hover:text-stone-600 mb-6 flex items-center gap-1 transition-colors"
        >
          ← Back to listings
        </button>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-stone-100">
          {listing.image_url ? (
            <img
              src={listing.image_url}
              alt={listing.title}
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-mauve-50 flex items-center justify-center text-5xl">
              {CATEGORY_LABELS[listing.category]?.split(' ')[0] ?? '🍞'}
            </div>
          )}

          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs text-mauve-500 font-medium">
                  {CATEGORY_LABELS[listing.category] ?? listing.category}
                </span>
                <h1 className="text-2xl font-bold text-stone-800 font-serif mt-1">{listing.title}</h1>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xl font-bold text-stone-800">
                  {listing.is_free ? '🎁 Free' : `$${listing.price}`}
                </p>
              </div>
            </div>

            {listing.description && (
              <p className="text-stone-500 text-sm mt-4 leading-relaxed">{listing.description}</p>
            )}

            <div className="mt-6">
              {isSeller ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/listings/${listing.id}/edit`)}
                    className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl text-sm transition-colors"
                  >
                    Edit listing
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-500 font-medium rounded-xl text-sm transition-colors disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete listing'}
                  </button>
                </div>
              ) : sent ? (
                <div className="bg-mauve-50 border border-mauve-200 rounded-2xl p-4">
                  <p className="text-mauve-700 text-sm font-semibold">Message sent! 🎉</p>
                  <p className="text-mauve-500 text-xs mt-0.5">Check your inbox for replies.</p>
                  <button
                    onClick={() => router.push('/inbox')}
                    className="mt-3 text-xs text-mauve-500 hover:underline font-medium"
                  >
                    Go to inbox →
                  </button>
                </div>
              ) : messaging ? (
                <div className="flex flex-col gap-3">
                  <textarea
                    placeholder="Write a message to the seller..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-mauve-400 resize-none"
                  />
                  {error && <p className="text-red-400 text-xs">{error}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      className="flex-1 py-2.5 bg-mauve-400 hover:bg-mauve-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-colors"
                    >
                      Send message
                    </button>
                    <button
                      onClick={() => setMessaging(false)}
                      className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setMessaging(true)}
                  className="w-full py-3 bg-mauve-400 hover:bg-mauve-500 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  Message seller
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}