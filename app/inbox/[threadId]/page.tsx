'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import RatingStars from '@/components/RatingStars'

type Message = {
  id: string
  sender_id: string
  body: string
  created_at: string
}

type Thread = {
  id: string
  buyer_id: string
  seller_id: string
  listing_id: string
  listings: { title: string }
}

export default function ThreadPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [thread, setThread] = useState<Thread | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRating, setShowRating] = useState(false)
  const [stars, setStars] = useState(0)
  const [review, setReview] = useState('')
  const [rated, setRated] = useState(false)
  const [submittingRating, setSubmittingRating] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUserId(session.user.id)

      const { data: threadData } = await supabase
        .from('threads')
        .select('*, listings(title)')
        .eq('id', params.threadId)
        .single()

      setThread(threadData)

      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', params.threadId)
        .order('created_at', { ascending: true })

      setMessages(messagesData ?? [])

      // Check if already rated
      const { data: existingRating } = await supabase
        .from('ratings')
        .select('id')
        .eq('thread_id', params.threadId)
        .eq('reviewer_id', session.user.id)
        .single()

      if (existingRating) setRated(true)

      setLoading(false)
    }
    fetchData()
  }, [params.threadId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!newMessage.trim() || !userId) return

    const { error } = await supabase.from('messages').insert({
      thread_id: params.threadId,
      sender_id: userId,
      body: newMessage,
    })

    if (!error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender_id: userId,
        body: newMessage,
        created_at: new Date().toISOString(),
      }])
      setNewMessage('')

      await supabase
        .from('threads')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', params.threadId)
    }
  }

  async function handleSubmitRating() {
    if (!stars || !userId || !thread) return
    setSubmittingRating(true)

    const revieweeId = userId === thread.buyer_id
      ? thread.seller_id
      : thread.buyer_id

    const { error } = await supabase.from('ratings').insert({
      thread_id: params.threadId,
      reviewer_id: userId,
      reviewee_id: revieweeId,
      stars,
      review,
    })

    if (!error) {
      setRated(true)
      setShowRating(false)
    }
    setSubmittingRating(false)
  }

  const revieweeName = thread
    ? userId === thread.buyer_id ? 'the seller' : 'the buyer'
    : ''

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <div className="max-w-lg mx-auto w-full flex flex-col flex-1 py-8 px-4">
        <button
          onClick={() => router.push('/inbox')}
          className="text-sm text-stone-400 hover:text-stone-600 mb-2 text-left"
        >
          ← Back to inbox
        </button>

        {thread && (
          <p className="text-stone-800 font-semibold font-serif mb-6">
            {thread.listings?.title}
          </p>
        )}

        {/* Messages */}
        <div className="flex-1 flex flex-col gap-3 mb-4">
          {loading && <p className="text-stone-400 text-sm">Loading...</p>}
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                msg.sender_id === userId
                  ? 'bg-mauve-400 text-white self-end'
                  : 'bg-white text-stone-800 self-start shadow-sm border border-stone-100'
              }`}
            >
              {msg.body}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Rate this person */}
        {!rated && !showRating && messages.length > 0 && (
          <button
            onClick={() => setShowRating(true)}
            className="text-xs text-mauve-500 hover:underline mb-3 text-center"
          >
            Rate {revieweeName} →
          </button>
        )}

        {rated && (
          <p className="text-xs text-stone-400 text-center mb-3">You've rated {revieweeName} ✓</p>
        )}

        {showRating && (
          <div className="bg-white rounded-2xl border border-stone-100 p-4 mb-3">
            <p className="text-sm font-semibold text-stone-800 font-serif mb-3">
              Rate {revieweeName}
            </p>
            <RatingStars value={stars} onChange={setStars} />
            <textarea
              placeholder="Leave a review (optional)..."
              value={review}
              onChange={e => setReview(e.target.value)}
              rows={2}
              className="w-full mt-3 px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-mauve-400 resize-none"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setShowRating(false)}
                className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={!stars || submittingRating}
                className="flex-1 py-2 bg-mauve-400 hover:bg-mauve-500 disabled:opacity-50 text-white font-medium rounded-xl text-xs transition-colors"
              >
                {submittingRating ? 'Submitting...' : 'Submit rating'}
              </button>
            </div>
          </div>
        )}

        {/* Message input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Write a message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-2.5 rounded-lg border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-mauve-400"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="px-4 py-2.5 bg-mauve-400 hover:bg-mauve-500 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}