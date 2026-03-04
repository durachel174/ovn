'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    async function checkSession() {
        const { data: { session } } = await supabase.auth.getSession()
        setLoggedIn(!!session)
        setUserId(session?.user.id ?? null)
    }
    checkSession()
  }, [pathname])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="w-full bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold text-stone-800 tracking-tight">
        ovn
      </Link>

      <div className="flex items-center gap-4">
        {loggedIn ? (
          <>
            <Link
              href="/listings"
              className={`text-sm ${pathname === '/listings' ? 'text-mauve-500 font-medium' : 'text-stone-500 hover:text-stone-800'} transition-colors`}
            >
              Browse
            </Link>
            <Link
              href="/listings/new"
              className={`text-sm ${pathname === '/listings/new' ? 'text-mauve-500 font-medium' : 'text-stone-500 hover:text-stone-800'} transition-colors`}
            >
              Sell
            </Link>
            <Link
              href="/inbox"
              className={`text-sm ${pathname.startsWith('/inbox') ? 'text-mauve-500 font-medium' : 'text-stone-500 hover:text-stone-800'} transition-colors`}
            >
              Inbox
            </Link>
            <Link
                href={`/profile/${userId}`}
                className={`text-sm ${pathname.startsWith('/profile') ? 'text-mauve-500 font-medium' : 'text-stone-500 hover:text-stone-800'} transition-colors`}
                >
                Profile
                </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm text-stone-500 hover:text-stone-800 transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm px-4 py-2 bg-mauve-400 hover:bg-mauve-500 text-white font-medium rounded-lg transition-colors"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}