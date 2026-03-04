'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Thread = {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  last_message_at: string
  listings: { title: string }
}

export default function InboxPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchThreads() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      setUserId(session.user.id)

      const { data } = await supabase
        .from('threads')
        .select('*, listings(title)')
        .or(`buyer_id.eq.${session.user.id},seller_id.eq.${session.user.id}`)
        .order('last_message_at', { ascending: false })

      setThreads(data ?? [])
      setLoading(false)
    }
    fetchThreads()
  }, [])

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-800 font-serif">Inbox</h1>
          <p className="text-sm text-stone-400 mt-0.5">Your conversations</p>
        </div>

        {loading && (
          <div className="flex flex-col gap-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-16 animate-pulse border border-stone-100" />
            ))}
          </div>
        )}

        {!loading && threads.length === 0 && (
          <div className="text-center py-16">
            <p className="text-stone-400 text-sm">No messages yet</p>
            <Link href="/listings" className="text-mauve-500 text-sm hover:underline mt-1 block">
              Browse listings →
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {threads.map(thread => (
            <Link
              key={thread.id}
              href={`/inbox/${thread.id}`}
              className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 hover:shadow-md transition-shadow flex items-center justify-between"
            >
              <div>
                <p className="text-stone-800 font-semibold text-sm">{thread.listings?.title}</p>
                <p className="text-stone-400 text-xs mt-0.5">
                  {userId === thread.buyer_id ? 'You messaged this seller' : 'Someone messaged you'}
                </p>
              </div>
              <span className="text-stone-300 text-sm">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}