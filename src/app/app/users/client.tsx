'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Key } from 'lucide-react'
import { useTranslation } from '@/lib/useTranslation'

export default function UsersClient() {
    const t = useTranslation()
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<any>(null)

    // Dependencies
    const [roles, setRoles] = useState<any[]>([])
    const [employees, setEmployees] = useState<any[]>([])

    // Form
    const [username, setUsername] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [password, setPassword] = useState('')
    const [employeeId, setEmployeeId] = useState('')
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
    const [isActive, setIsActive] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        load()
        loadDeps()
    }, [])

    async function load() {
        setLoading(true)
        try {
            const res = await fetch('/api/users')
            const data = await res.json()
            setItems(data.items || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    async function loadDeps() {
        try {
            const [rRes, eRes] = await Promise.all([
                fetch('/api/roles'),
                fetch('/api/employees')
            ])
            const rData = await rRes.json()
            const eData = await eRes.json()
            setRoles(rData.items || [])
            setEmployees(eData.items || [])
        } catch (e) { console.error('Deps error', e) }
    }

    function openNew() {
        setEditing(null)
        setUsername('')
        setDisplayName('')
        setPassword('')
        setEmployeeId('')
        setSelectedRoleIds([])
        setIsActive(true)
        setShowModal(true)
    }

    function openEdit(item: any) {
        setEditing(item)
        setUsername(item.username)
        setDisplayName(item.displayName)
        setPassword('') // Don't show hash
        setEmployeeId(item.employeeId || '')
        setSelectedRoleIds(item.roles?.map((r: any) => r.roleId) || [])
        setIsActive(item.isActive)
        setShowModal(true)
    }

    async function save() {
        if (!username || !displayName) return alert('Missing fields')
        if (!editing && !password) return alert(t.users.passwordRequired)

        setSaving(true)
        try {
            const url = editing ? `/api/users/${editing.userId}` : '/api/users'
            const method = editing ? 'PUT' : 'POST'

            const payload: any = {
                username,
                displayName,
                employeeId: employeeId || null,
                roleIds: selectedRoleIds,
                isActive
            }
            if (password) payload.password = password

            const res = await fetch(url, {
                method,
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(payload)
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
        if (!confirm(t.users.confirmDelete)) return
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
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
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-300 to-white bg-clip-text text-transparent">{t.users.title}</h1>
                    <p className="text-white/60 mt-1">{t.users.subtitle}</p>
                </div>
                <button onClick={openNew} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> {t.users.create}
                </button>
            </div>

            <div className="card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-white/70">
                        <tr>
                            <th className="p-4">{t.users.username}</th>
                            <th className="p-4">{t.users.displayName}</th>
                            <th className="p-4">{t.users.assignedTo}</th>
                            <th className="p-4">{t.users.role}</th>
                            <th className="p-4">{t.employees.status}</th>
                            <th className="p-4 text-right">{t.roster.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {loading ? (
                            <tr><td colSpan={6} className="p-4 text-center text-white/50">{t.common.loading}</td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan={6} className="p-4 text-center text-white/50">{t.common.noData}</td></tr>
                        ) : items.map((item) => {
                            const emp = item.employee ? `${item.employee.firstName} ${item.employee.lastName}` : '-'
                            const roleNames = item.roles?.map((r: any) => r.role?.roleName).join(', ')
                            return (
                                <tr key={item.userId} className="hover:bg-white/5">
                                    <td className="p-4 font-mono text-sm text-brand-300">{item.username}</td>
                                    <td className="p-4 font-medium">{item.displayName}</td>
                                    <td className="p-4 text-sm opacity-70">{emp}</td>
                                    <td className="p-4 text-sm">{roleNames}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs ${item.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                            {item.isActive ? t.employees.active : t.employees.inactive}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right flex items-center justify-end gap-2">
                                        <button onClick={() => openEdit(item)} className="p-2 hover:bg-white/10 rounded-lg text-blue-300"><Edit size={16} /></button>
                                        <button onClick={() => remove(item.userId)} className="p-2 hover:bg-white/10 rounded-lg text-red-300"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="card w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{editing ? t.users.edit : t.users.create}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">{t.users.username}</label>
                                <input className="input mt-1 w-full" value={username} onChange={e => setUsername(e.target.value)} disabled={!!editing} />
                            </div>
                            <div>
                                <label className="label">{t.users.displayName}</label>
                                <input className="input mt-1 w-full" value={displayName} onChange={e => setDisplayName(e.target.value)} />
                            </div>

                            <div className="md:col-span-2">
                                <label className="label flex items-center gap-2">
                                    <Key size={14} /> {t.login.password} {editing && <span className="text-white/40 font-normal">(Leave blank to keep current)</span>}
                                </label>
                                <input className="input mt-1 w-full" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                            </div>

                            <div className="md:col-span-2">
                                <label className="label">{t.users.employeeLink} (Optional)</label>
                                <select className="input mt-1 w-full" value={employeeId} onChange={e => setEmployeeId(e.target.value)}>
                                    <option value="">-- No Employee --</option>
                                    {employees.map((e: typeof employees[0]) => (
                                        <option key={e.employeeId} value={e.employeeId}>{e.firstName} {e.lastName} ({e.nickName})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="label">{t.users.role}</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {roles.map(r => {
                                        const active = selectedRoleIds.includes(r.roleId)
                                        return (
                                            <button
                                                key={r.roleId}
                                                onClick={() => setSelectedRoleIds(prev => active ? prev.filter((x: string) => x !== r.roleId) : [...prev, r.roleId])}
                                                className={`px-3 py-1 rounded-full text-sm border transition ${active ? 'bg-brand-500 border-brand-400 text-white' : 'border-white/20 hover:bg-white/10'}`}
                                            >
                                                {r.roleName}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="md:col-span-2 pt-2">
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" className="accent-brand-500 w-5 h-5" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                                    <label className="label mb-0">Active Account</label>
                                </div>
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
