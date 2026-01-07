'use client'

import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import { useLanguage } from '@/lib/LanguageContext'
import { useTranslation } from '@/lib/useTranslation'

type Holiday = {
  holidayId: string
  holidayDate: string
  holidayName: string
  holidayType: string
  isActive: boolean
}

export default function CompanyHolidaysPage() {
  const t = useTranslation()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [items, setItems] = useState<Holiday[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Holiday | null>(null)
  const [form, setForm] = useState<Partial<Holiday>>({ holidayDate: '', holidayName: '', holidayType: 'ORG' })

  async function load(y: number) {
    const res = await fetch(`/api/company-holidays?year=${y}`)
    const data = await res.json()
    setItems(data.items || [])
  }

  useEffect(() => { load(year) }, [year])

  function startCreate() {
    setEditing(null)
    setForm({ holidayDate: `${year}-01-01`, holidayName: '', holidayType: 'ORG' })
    setOpen(true)
  }

  function startEdit(x: Holiday) {
    setEditing(x)
    setForm({ ...x })
    setOpen(true)
  }

  async function save() {
    const body = {
      holidayDate: String(form.holidayDate || ''),
      holidayName: String(form.holidayName || '').trim(),
      holidayType: String(form.holidayType || 'ORG'),
      isActive: true
    }
    if (!body.holidayDate || !body.holidayName) return alert(t.common.missingFields)

    const res = await fetch(editing ? `/api/company-holidays/${editing.holidayId}` : '/api/company-holidays', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    if (!res.ok) return alert(data?.message || 'Save failed')
    setOpen(false)
    await load(year)
  }

  async function remove(x: Holiday) {
    if (!confirm(t.common.confirmDelete)) return
    const res = await fetch(`/api/company-holidays/${x.holidayId}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) return alert(data?.message || 'Delete failed')
    await load(year)
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{t.holidays.title}</div>
          <div className="text-white/70 text-sm">{t.holidays.subtitle}</div>
        </div>
        <div className="flex items-center gap-2">
          <select className="input" value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {Array.from({ length: 5 }).map((_, i) => {
              const y = now.getFullYear() - 2 + i
              return <option key={y} value={y}>{y}</option>
            })}
          </select>
          <button className="btn-primary" onClick={startCreate}>{t.holidays.create}</button>
        </div>
      </div>

      <div className="mt-4 overflow-auto border border-white/10 rounded-xl2">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr className="text-left">
              <th className="p-3">{t.holidays.date}</th>
              <th className="p-3">{t.holidays.name}</th>
              <th className="p-3">{t.holidays.type}</th>
              <th className="p-3 w-40"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr key={x.holidayId} className="border-t border-white/5">
                <td className="p-3">{x.holidayDate}</td>
                <td className="p-3">{x.holidayName}</td>
                <td className="p-3">{x.holidayType}</td>
                <td className="p-3 text-right">
                  <button className="btn-ghost" onClick={() => startEdit(x)}>{t.common.edit}</button>
                  <button className="btn-ghost" onClick={() => remove(x)}>{t.common.delete}</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td className="p-3 text-white/60" colSpan={4}>{t.common.noData}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} title={editing ? t.holidays.edit : t.holidays.create} onClose={() => setOpen(false)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="label">{t.holidays.date}</label>
            <input className="input mt-1" type="date" value={String(form.holidayDate || '')} onChange={(e) => setForm({ ...form, holidayDate: e.target.value })} />
          </div>
          <div>
            <label className="label">{t.holidays.type}</label>
            <input className="input mt-1" value={String(form.holidayType || 'ORG')} onChange={(e) => setForm({ ...form, holidayType: e.target.value })} />
          </div>
          <div className="lg:col-span-2">
            <label className="label">{t.holidays.name}</label>
            <input className="input mt-1" value={String(form.holidayName || '')} onChange={(e) => setForm({ ...form, holidayName: e.target.value })} />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button className="btn-ghost" onClick={() => setOpen(false)}>{t.common.cancel}</button>
          <button className="btn-primary" onClick={save}>{t.common.save}</button>
        </div>
      </Modal>
    </div>
  )
}
