'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Shield, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/lib/useTranslation'

export default function RolesClient() {
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
            const res = await fetch('/api/roles')
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
        setCode(item.roleCode)
        setName(item.roleName)
        setShowModal(true)
    }

    async function save() {
        if (!code || !name) return alert('Missing fields')
        setSaving(true)
        try {
            const url = editing ? `/api/roles/${editing.roleId}` : '/api/roles'
            const method = editing ? 'PUT' : 'POST'
            const res = await fetch(url, {
                method,
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ roleCode: code, roleName: name })
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

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-300 to-white bg-clip-text text-transparent">{t.roles.title}</h1>
                    <p className="text-white/60 mt-1">{t.roles.subtitle}</p>
                </div>
                <button onClick={openNew} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> {t.roles.create}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-3 text-center text-white/50 py-10">{t.common.loading}</div>
                ) : items.map((item) => (
                    <div key={item.roleId} className="card p-5 flex flex-col justify-between hover:border-brand-500/50 transition duration-300">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-mono text-xs bg-white/10 px-2 py-1 rounded text-brand-300">{item.roleCode}</span>
                                <button onClick={() => openEdit(item)} className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white"><Edit size={14} /></button>
                            </div>
                            <h3 className="text-xl font-bold">{item.roleName}</h3>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10">
                            <Link href={`/app/roles/${item.roleId}`} className="flex items-center justify-between text-sm group hover:text-brand-300">
                                <span className="flex items-center gap-2"><Shield size={16} /> {t.roles.permissions}</span>
                                <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition" />
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="card w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">{editing ? t.roles.edit : t.roles.create}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="label">{t.roles.code}</label>
                                <input className="input mt-1 w-full" value={code} onChange={e => setCode(e.target.value)} placeholder="ADMIN" />
                            </div>
                            <div>
                                <label className="label">{t.roles.roleName}</label>
                                <select className="input mt-1 w-full" value={name} onChange={e => setName(e.target.value)}>
                                    <option value="">-- Select Role Name --</option>
                                    <option value="Administrator">Administrator</option>
                                    <option value="Supervisor">Supervisor</option>
                                    <option value="Staff">Staff</option>
                                    <option value="Employee">Employee</option>
                                </select>
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
