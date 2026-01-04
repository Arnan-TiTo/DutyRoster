'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTranslation } from '@/lib/useTranslation'

export default function LoginPage() {
  const router = useRouter()
  const t = useTranslation()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('Admin@9999')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Login failed')
      router.push('/app')
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-3">
            <div className="p-1 bg-white/10 rounded-xl2">
              <Image src="/logo.png" alt="BMW" width={40} height={40} className="object-contain rounded-xl" />
            </div>
            <div className="text-xl font-semibold">Duty Roster</div>
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-4">
            <div className="text-lg font-semibold">{t.login.title}</div>
          </div>

          <div className="mb-4 border border-white/10 bg-white/95 rounded-xl2 flex items-center justify-center overflow-hidden">
            <Image src="/bmw-motorrad-logo.png" alt="BMW Motorrad" width={400} height={64} className="w-full h-auto" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="label">{t.login.username}</label>
              <input className="input mt-1" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
              <label className="label">{t.login.password}</label>
              <input className="input mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            {error && (
              <div className="text-sm text-red-200 bg-red-500/10 border border-red-500/20 rounded-xl2 p-3">
                {error}
              </div>
            )}

            <button disabled={loading} className="btn-primary w-full">
              {loading ? t.login.loggingIn : t.login.loginButton}
            </button>
          </form>
        </div>

        <div className="text-center mt-4 text-xs text-white/50">
          © {new Date().getFullYear()} Duty Roster
        </div>
      </div>
    </div>
  )
}
