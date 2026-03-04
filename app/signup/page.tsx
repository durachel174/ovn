'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-sm">
        <h1 className="text-2xl font-semibold text-stone-800 font-serif mb-1">Create account</h1>
        <p className="text-sm text-stone-500 mb-6">Join your local baking community</p>

        <div className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-mauve-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-mauve-400"
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full py-2.5 bg-mauve-400 hover:bg-mauve-500 text-white font-medium rounded-lg text-sm transition-colors"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </div>

        <p className="text-xs text-stone-400 mt-4 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-mauve-500 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}