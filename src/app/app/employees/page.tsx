'use client'

import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import { useLanguage } from '@/lib/LanguageContext'
import { useTranslation } from '@/lib/useTranslation'

type Employee = {
  employeeId: string
  empCode: string | null
  firstName: string
  lastName: string
  nickName: string | null
  phone: string | null
  email: string | null
  roleTitle: string | null
  teamId: string | null
  isActive: boolean
}

export default function EmployeesPage() {
  const t = useTranslation()
  const [items, setItems] = useState<Employee[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)

  const [form, setForm] = useState<any>({
    empCode: '',
    firstName: '',
    lastName: '',
    nickName: '',
    phone: '',
    email: '',
    roleTitle: '',
    // User fields
    username: '',
    password: '',
    userRoleId: ''
  })

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [resEmp, resRoles] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/roles')
      ])
      const data = await resEmp.json()
      const roleData = await resRoles.json()

      if (!resEmp.ok) throw new Error(data?.message || 'Load failed')
      setItems(data.items)
      setRoles(roleData.items || [])
    } catch (e: any) {
      setError(e?.message || 'Load failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function startCreate() {
    setEditing(null)
    setForm({ empCode: '', firstName: '', lastName: '', nickName: '', phone: '', email: '', roleTitle: '', username: '', password: '', userRoleId: '' })
    setOpen(true)
  }

  function startEdit(x: Employee) {
    setEditing(x)
    setForm({ ...x, username: '', password: '', userRoleId: '' })
    setOpen(true)
  }

  async function save() {
    const body: any = {
      empCode: (form.empCode || '').trim() || null,
      firstName: (form.firstName || '').trim(),
      lastName: (form.lastName || '').trim(),
      nickName: (form.nickName || '').trim() || null,
      phone: (form.phone || '').trim() || null,
      email: (form.email || '').trim() || null,
      roleTitle: (form.roleTitle || '').trim() || null,
      teamId: null
    }

    // Include user fields if creating
    if (!editing && form.username) {
      body.uUsername = form.username
      body.uPassword = form.password
      body.uRoleId = form.userRoleId
    }

    if (!body.firstName || !body.lastName) {
      alert(t.common.missingFields)
      return
    }

    const res = await fetch(editing ? `/api/employees/${editing.employeeId}` : '/api/employees', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    if (!res.ok) {
      alert(data?.message || 'Save failed')
      return
    }
    setOpen(false)
    await load()
  }

  async function deactivate(x: Employee) {
    if (!confirm(t.employees.confirmDeactivate)) return
    const res = await fetch(`/api/employees/${x.employeeId}/deactivate`, { method: 'PATCH' })
    const data = await res.json()
    if (!res.ok) {
      alert(data?.message || 'Action failed')
      return
    }
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{t.employees.title}</div>
          <div className="text-white/70 text-sm">{t.employees.subtitle}</div>
        </div>
        <button className="btn-primary" onClick={startCreate}>{t.employees.create}</button>
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-200 bg-red-500/10 border border-red-500/20 rounded-xl2 p-3">{error}</div>
      )}

      <div className="mt-4 overflow-auto border border-white/10 rounded-xl2">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr className="text-left">
              <th className="p-3">{t.employees.code}</th>
              <th className="p-3">{t.employees.firstName}</th>
              <th className="p-3">{t.employees.nickName}</th>
              <th className="p-3">{t.employees.phone}</th>
              <th className="p-3">{t.employees.isActive}</th>
              <th className="p-3 w-40"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr key={x.employeeId} className="border-t border-white/5">
                <td className="p-3">{x.empCode || '-'}</td>
                <td className="p-3">{x.firstName} {x.lastName}</td>
                <td className="p-3">{x.nickName || '-'}</td>
                <td className="p-3">{x.phone || '-'}</td>
                <td className="p-3">{x.isActive ? t.common.yes : t.common.no}</td>
                <td className="p-3 text-right">
                  <button className="btn-ghost" onClick={() => startEdit(x)}>{t.common.edit}</button>
                  <button className="btn-ghost" onClick={() => deactivate(x)} disabled={!x.isActive}>{t.employees.deactivate}</button>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr><td className="p-3 text-white/60" colSpan={6}>{t.common.noData}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} title={editing ? t.employees.edit : t.employees.create} onClose={() => setOpen(false)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="label">{t.employees.code}</label>
            <input className="input mt-1" value={form.empCode || ''} onChange={(e) => setForm({ ...form, empCode: e.target.value })} />
          </div>
          <div>
            <label className="label">{t.employees.nickName}</label>
            <input className="input mt-1" value={form.nickName || ''} onChange={(e) => setForm({ ...form, nickName: e.target.value })} />
          </div>
          <div>
            <label className="label">{t.employees.firstName}</label>
            <input className="input mt-1" value={form.firstName || ''} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </div>
          <div>
            <label className="label">{t.employees.lastName}</label>
            <input className="input mt-1" value={form.lastName || ''} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>
          <div>
            <label className="label">{t.employees.phone}</label>
            <input className="input mt-1" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">{t.employees.email}</label>
            <input className="input mt-1" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="lg:col-span-2">
            <label className="label">{t.employees.roleTitle}</label>
            <input className="input mt-1" value={form.roleTitle || ''} onChange={(e) => setForm({ ...form, roleTitle: e.target.value })} />
          </div>

          {!editing && (
            <div className="lg:col-span-2 mt-4 pt-4 border-t border-white/10">
              <h3 className="text-sm font-semibold mb-3 text-brand-300">{t.employees.createUser}</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="label">{t.employees.username}</label>
                  <input className="input mt-1" value={form.username || ''} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                </div>
                <div>
                  <label className="label">{t.employees.password}</label>
                  <input className="input mt-1" type="password" value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="lg:col-span-2">
                  <label className="label">{t.employees.role}</label>
                  <select className="input mt-1" value={form.userRoleId || ''} onChange={(e) => setForm({ ...form, userRoleId: e.target.value })}>
                    <option value="">-- Select Role --</option>
                    {roles.map(r => (
                      <option key={r.roleId} value={r.roleId}>{r.roleName}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button className="btn-ghost" onClick={() => setOpen(false)}>{t.common.cancel}</button>
          <button className="btn-primary" onClick={save}>{t.common.save}</button>
        </div>
      </Modal>
    </div>
  )
}
