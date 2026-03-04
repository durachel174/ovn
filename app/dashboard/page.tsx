'use client'

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-stone-800 mb-2">You're in 🍞</h1>
        <p className="text-stone-500 mb-6">Welcome to Ovn. Let's build this out.</p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm bg-stone-200 hover:bg-stone-300 rounded-lg transition-colors"
        >
          Log out
        </button>
      </div>
    </div>
  )
}