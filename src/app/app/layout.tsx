'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true) // Default open for desktop

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session')
        const data = await res.json()
        if (!res.ok || !data.ok || !data.session) {
          router.push('/login')
          return
        }
        setSession(data.session)
      } catch (err) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    checkSession()
  }, [router])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <Topbar
        displayName={session.displayName}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
      />
      <div className="min-h-screen px-4 py-4 pt-20">
        <div className="flex gap-4">
          <Sidebar
            roles={session.roles}
            displayName={session.displayName}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          <main className="flex-1 min-h-[calc(100vh-6rem)] card p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
