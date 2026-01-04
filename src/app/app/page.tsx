'use client'

import CalendarView from '@/components/CalendarView'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AppHome() {
  const router = useRouter()
  const [roles, setRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch('/api/auth/session')
        if (!res.ok) {
          router.push('/login')
          return
        }
        const data = await res.json()
        setRoles(data.roles || [])
      } catch (err) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    loadSession()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white/50">Loading...</div>
      </div>
    )
  }

  return <CalendarView roles={roles} />
}
