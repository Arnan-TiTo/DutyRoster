'use client'

import { useState, useEffect } from 'react'
import { Save, ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RolePermissionsClient({ roleId }: { roleId: string }) {
    const router = useRouter()
    const [role, setRole] = useState<any>(null)
    const [menus, setMenus] = useState<any[]>([])
    const [permissions, setPermissions] = useState<Map<string, { canView: boolean, canEdit: boolean }>>(new Map())
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        load()
    }, [roleId])

    async function load() {
        setLoading(true)
        try {
            const [rRes, mRes] = await Promise.all([
                fetch(`/api/roles/${roleId}`),
                fetch('/api/menus')
            ])
            const rData = await rRes.json()
            const mData = await mRes.json()

            if (rData.item) {
                setRole(rData.item)
                // Initialize permissions map
                const map = new Map()
                rData.item.roleMenus?.forEach((rm: any) => {
                    map.set(rm.menuId, { canView: rm.canView, canEdit: rm.canEdit })
                })
                setPermissions(map)
            }
            setMenus(mData.items || [])
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    function toggle(menuId: string, field: 'canView' | 'canEdit') {
        const prev = permissions.get(menuId) || { canView: false, canEdit: false }
        const next = { ...prev, [field]: !prev[field] }

        // Logic: if edit is enabled, view must normally be enabled? 
        // Or if view is disabled, edit implies nothing.
        // Let's enforce: if canEdit=true, canView=true
        if (field === 'canEdit' && next.canEdit) next.canView = true
        // If canView=false, canEdit=false
        if (field === 'canView' && !next.canView) next.canEdit = false

        setPermissions(new Map(permissions.set(menuId, next)))
    }

    async function save() {
        if (!role) return
        setSaving(true)
        try {
            // Convert map to array
            const permsArray = Array.from(permissions.entries()).map(([menuId, p]) => ({
                menuId,
                canView: p.canView,
                canEdit: p.canEdit
            })).filter(x => x.canView || x.canEdit) // Only send positive permissions? No, we replace all.
            // Actually, we replace all for this role. So we only need to send the ones that exist. 
            // If we remove logic in API is "deleteMany -> createMany". So omitted ones are effectively removed/false.
            // So filtering is fine.

            const res = await fetch(`/api/roles/${roleId}`, {
                method: 'PUT',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    roleCode: role.roleCode,
                    roleName: role.roleName,
                    permissions: permsArray
                })
            })
            if (!res.ok) throw new Error('Failed to save')

            // Success
            alert('Permissions saved successfully')
            router.push('/app/roles')
        } catch (e: any) {
            alert(e.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-10 text-center text-white/50">Loading permissions...</div>
    if (!role) return <div className="p-10 text-center text-red-400">Role not found</div>

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/app/roles" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition"><ArrowLeft size={20} /></Link>
                    <div>
                        <h1 className="text-2xl font-bold">{role.roleName} <span className="text-white/50 text-sm font-normal">({role.roleCode})</span></h1>
                        <p className="text-white/50 text-sm">Configure menu access.</p>
                    </div>
                </div>
                <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
                    {saving ? <span className="animate-spin">...</span> : <Save size={18} />} Save Changes
                </button>
            </div>

            <div className="card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-white/70">
                        <tr>
                            <th className="p-4 w-1/2">Menu Item</th>
                            <th className="p-4 text-center w-32">View</th>
                            <th className="p-4 text-center w-32">Edit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {menus.map(m => {
                            const p = permissions.get(m.menuId) || { canView: false, canEdit: false }
                            return (
                                <tr key={m.menuId} className={`hover:bg-white/5 ${p.canView ? 'bg-brand-500/5' : ''}`}>
                                    <td className="p-4">
                                        <div className="font-medium">{m.menuName}</div>
                                        <div className="text-xs text-white/40 font-mono">{m.menuCode}</div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => toggle(m.menuId, 'canView')} className={`w-6 h-6 rounded border flex items-center justify-center mx-auto transition ${p.canView ? 'bg-green-500 border-green-500 text-white' : 'border-white/20 hover:border-white/50'}`}>
                                            {p.canView && <Check size={14} />}
                                        </button>
                                    </td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => toggle(m.menuId, 'canEdit')} className={`w-6 h-6 rounded border flex items-center justify-center mx-auto transition ${p.canEdit ? 'bg-blue-500 border-blue-500 text-white' : 'border-white/20 hover:border-white/50'}`}>
                                            {p.canEdit && <Check size={14} />}
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
