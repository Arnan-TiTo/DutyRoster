'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useTranslation } from '@/lib/useTranslation'

export default function LeaveTypesClient() {
    const t = useTranslation()
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<any>(null)

    // Form
    const [code, setCode] = useState('')
    const [name, setName] = useState('')
    const [isActive, setIsActive] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        load()
    }, [])

    async function load() {
        setLoading(true)
        try {
            const res = await fetch('/api/leave-types')
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
        setIsActive(true)
        setShowModal(true)
    }

    function openEdit(item: any) {
        setEditing(item)
        setCode(item.leaveCode)
        setName(item.leaveName)
        setIsActive(item.isActive)
        setShowModal(true)
    }

    async function save() {
        if (!code || !name) return alert(t.common.missingFields)
        setSaving(true)
        try {
            const url = editing ? `/api/leave-types/${editing.leaveTypeId}` : '/api/leave-types'
            const method = editing ? 'PUT' : 'POST'
            const res = await fetch(url, {
                method,
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ leaveCode: code, leaveName: name, isActive })
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
            const res = await fetch(`/api/leave-types/${id}`, { method: 'DELETE' })
            if (!res.ok) {
                const d = await res.json()
                throw new Error(d.message || 'Failed to delete')
            }
            load()
        } catch (e: any) {
            alert(e.message)
        }
    }

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-300 to-white bg-clip-text text-transparent">{t.leaveTypes.title}</h1>
                    <p className="text-white/60 mt-1">{t.leaveTypes.subtitle}</p>
                </div>
                <button onClick={openNew} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> {t.leaveTypes.create}
                </button>
            </div>

            <div className="card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-white/70">
                        <tr>
                            <th className="p-4">{t.leaveTypes.code}</th>
                            <th className="p-4">{t.leaveTypes.name}</th>
                            <th className="p-4">{t.employees.status}</th>
                            <th className="p-4 text-right">{t.roster?.actions || 'Actions'}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {loading ? (
                            <tr><td colSpan={4} className="p-4 text-center text-white/50">{t.common.loading}</td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan={4} className="p-4 text-center text-white/50">{t.common.noData}</td></tr>
                        ) : items.map((item) => (
                            <tr key={item.leaveTypeId} className="hover:bg-white/5">
                                <td className="p-4 font-mono text-sm">{item.leaveCode}</td>
                                <td className="p-4 font-medium">{item.leaveName}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs ${item.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                        {item.isActive ? t.employees.active : t.employees.inactive}
                                    </span>
                                </td>
                                <td className="p-4 text-right flex items-center justify-end gap-2">
                                    <button onClick={() => openEdit(item)} className="p-2 hover:bg-white/10 rounded-lg text-blue-300"><Edit size={16} /></button>
                                    <button onClick={() => remove(item.leaveTypeId)} className="p-2 hover:bg-white/10 rounded-lg text-red-300"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="card w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">{editing ? t.leaveTypes.edit : t.leaveTypes.create}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="label">{t.leaveTypes.code}</label>
                                <input className="input mt-1 w-full" value={code} onChange={e => setCode(e.target.value)} placeholder="VACATION, SICK" />
                            </div>
                            <div>
                                <label className="label">{t.leaveTypes.name}</label>
                                <input className="input mt-1 w-full" value={name} onChange={e => setName(e.target.value)} placeholder="Vacation Leave" />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" className="accent-brand-500 w-5 h-5" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                                <label className="label mb-0">{t.leaveTypes.active}</label>
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
