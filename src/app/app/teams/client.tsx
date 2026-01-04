'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useTranslation } from '@/lib/useTranslation'

export default function TeamsClient() {
    const t = useTranslation()
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<any>(null)

    // Form
    const [code, setCode] = useState('')
    const [name, setName] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        load()
    }, [])

    async function load() {
        setLoading(true)
        try {
            const res = await fetch('/api/teams')
            const data = await res.json()
            setItems(data.items || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    function openNew() {
        setEditing(null)
        setCode('')
        setName('')
        setShowModal(true)
    }

    function openEdit(item: any) {
        setEditing(item)
        setCode(item.teamCode)
        setName(item.teamName)
        setShowModal(true)
    }

    async function save() {
        if (!code || !name) return alert(t.common.missingFields)
        setSaving(true)
        try {
            const url = editing ? `/api/teams/${editing.teamId}` : '/api/teams'
            const method = editing ? 'PUT' : 'POST'
            const res = await fetch(url, {
                method,
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ teamCode: code, teamName: name })
            })
            if (!res.ok) {
                const d = await res.json()
                throw new Error(d.message || 'Failed')
            }
            setShowModal(false)
            load()
        } catch (e: any) {
            alert(e.message)
        } finally {
            setSaving(false)
        }
    }

    async function remove(id: string) {
        if (!confirm(t.common.confirmDelete)) return
        try {
            const res = await fetch(`/api/teams/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete')
            load()
        } catch (e: any) {
            alert(e.message)
        }
    }

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-300 to-white bg-clip-text text-transparent">{t.teams.title}</h1>
                    <p className="text-white/60 mt-1">{t.teams.subtitle}</p>
                </div>
                <button onClick={openNew} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> {t.teams.create}
                </button>
            </div>

            <div className="card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-white/70">
                        <tr>
                            <th className="p-4">{t.teams.code}</th>
                            <th className="p-4">{t.teams.name}</th>
                            <th className="p-4 text-right">{t.roster?.actions || 'Actions'}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {loading ? (
                            <tr><td colSpan={3} className="p-4 text-center text-white/50">{t.common.loading}</td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan={3} className="p-4 text-center text-white/50">{t.common.noData}</td></tr>
                        ) : items.map((item) => (
                            <tr key={item.teamId} className="hover:bg-white/5">
                                <td className="p-4 font-mono text-sm">{item.teamCode}</td>
                                <td className="p-4 font-medium">{item.teamName}</td>
                                <td className="p-4 text-right flex items-center justify-end gap-2">
                                    <button onClick={() => openEdit(item)} className="p-2 hover:bg-white/10 rounded-lg text-blue-300"><Edit size={16} /></button>
                                    <button onClick={() => remove(item.teamId)} className="p-2 hover:bg-white/10 rounded-lg text-red-300"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="card w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">{editing ? t.teams.edit : t.teams.create}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="label">{t.teams.code}</label>
                                <input className="input mt-1 w-full" value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. IT, HR" />
                            </div>
                            <div>
                                <label className="label">{t.teams.name}</label>
                                <input className="input mt-1 w-full" value={name} onChange={e => setName(e.target.value)} placeholder="Department Name" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="btn-ghost">{t.common.cancel}</button>
                            <button onClick={save} disabled={saving || !code || !name} className="btn-primary">
                                {saving ? t.common.loading : t.common.save}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
