'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

type Message = {
  id: string
  sender_id: string
  body: string
  created_at: string
}

export default function ThreadPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    async function fetchMessages() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setUserId(session.user.id)

      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', params.threadId)
        .order('created_at', { ascending: true })

      setMessages(data ?? [])
      setLoading(false)
    }
    fetchMessages()
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

      // Update last_message_at on thread
      await supabase
        .from('threads')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', params.threadId)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <div className="max-w-lg mx-auto w-full flex flex-col flex-1 py-8 px-4">
        <button
          onClick={() => router.push('/inbox')}
          className="text-sm text-stone-400 hover:text-stone-600 mb-6"
        >
          ← Back to inbox
        </button>

        <div className="flex-1 flex flex-col gap-3 mb-4">
          {loading && <p className="text-stone-400 text-sm">Loading...</p>}
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                msg.sender_id === userId
                  ? 'bg-mauve-400 text-white self-end'
                  : 'bg-white text-stone-800 self-start shadow-sm'
              }`}
            >
              {msg.body}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

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