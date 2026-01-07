'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useTranslation } from '@/lib/useTranslation'

export default function MenusClient() {
    const t = useTranslation()
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<any>(null)

    // Form
    const [code, setCode] = useState('')
    const [name, setName] = useState('')
    const [path, setPath] = useState('')
    const [sortOrder, setSortOrder] = useState(0)
    const [isActive, setIsActive] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        load()
    }, [])

    async function load() {
        setLoading(true)
        try {
            const res = await fetch('/api/menus')
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
        setPath('')
        setSortOrder((items.length + 1) * 10)
        setIsActive(true)
        setShowModal(true)
        openModal()
    }

    function openEdit(item: any) {
        setEditing(item)
        setCode(item.menuCode)
        setName(item.menuName)
        setPath(item.path || '')
        setSortOrder(item.sortOrder)
        setIsActive(item.isActive)
        setShowModal(true)
    }

    // Helper to ensure modal state is clean if needed, but setState is enough
    function openModal() { setShowModal(true) }

    async function save() {
        if (!code || !name) return alert('Missing fields')
        setSaving(true)
        try {
            const url = editing ? `/api/menus/${editing.menuId}` : '/api/menus'
            const method = editing ? 'PUT' : 'POST'
            const res = await fetch(url, {
                method,
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ menuCode: code, menuName: name, path, sortOrder: Number(sortOrder), isActive })
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
        if (!confirm(t.roster.confirmDelete)) return
        try {
            const res = await fetch(`/api/menus/${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed')
            load()
        } catch (e: any) {
            alert(e.message)
        }
    }

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-300 to-white bg-clip-text text-transparent">{t.menus.title}</h1>
                    <p className="text-white/60 mt-1">{t.sidebar.menuSystem}</p>
                </div>
                <button onClick={openNew} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> {t.menus.create}
                </button>
            </div>

            <div className="card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-white/70">
                        <tr>
                            <th className="p-4">{t.menus.sort}</th>
                            <th className="p-4">{t.menus.code}</th>
                            <th className="p-4">{t.menus.name}</th>
                            <th className="p-4">{t.menus.path}</th>
                            <th className="p-4">{t.employees.status}</th>
                            <th className="p-4 text-right">{t.roster.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {loading ? (
                            <tr><td colSpan={6} className="p-4 text-center text-white/50">{t.common.loading}</td></tr>
                        ) : items.map((item) => (
                            <tr key={item.menuId} className="hover:bg-white/5">
                                <td className="p-4 text-sm text-white/50">{item.sortOrder}</td>
                                <td className="p-4 font-mono text-sm">{item.menuCode}</td>
                                <td className="p-4 font-medium">{item.menuName}</td>
                                <td className="p-4 text-sm text-brand-300">{item.path}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs ${item.isActive ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-white/50'}`}>
                                        {item.isActive ? t.employees.active : t.employees.inactive}
                                    </span>
                                </td>
                                <td className="p-4 text-right flex items-center justify-end gap-2">
                                    <button onClick={() => openEdit(item)} className="p-2 hover:bg-white/10 rounded-lg text-blue-300"><Edit size={16} /></button>
                                    <button onClick={() => remove(item.menuId)} className="p-2 hover:bg-white/10 rounded-lg text-red-300"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="card w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">{editing ? t.menus.edit : t.menus.create}</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">{t.menus.code}</label>
                                    <input className="input mt-1 w-full" value={code} onChange={e => setCode(e.target.value)} placeholder="HOME" />
                                </div>
                                <div>
                                    <label className="label">{t.menus.sort}</label>
                                    <input type="number" className="input mt-1 w-full" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} />
                                </div>
                            </div>
                            <div>
                                <label className="label">{t.menus.name}</label>
                                <input className="input mt-1 w-full" value={name} onChange={e => setName(e.target.value)} placeholder="Dashboard" />
                            </div>
                            <div>
                                <label className="label">{t.menus.path}</label>
                                <input className="input mt-1 w-full" value={path} onChange={e => setPath(e.target.value)} placeholder="/app/..." />
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input type="checkbox" className="accent-brand-500 w-5 h-5" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                                <label className="label mb-0">{t.employees.active}</label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="btn-ghost">{t.common.cancel}</button>
                            <button onClick={save} disabled={saving} className="btn-primary">
                                {saving ? t.common.loading : t.common.save}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
