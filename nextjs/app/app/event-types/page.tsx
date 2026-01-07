'use client'

import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import { useLanguage } from '@/lib/LanguageContext'
import { useTranslation } from '@/lib/useTranslation'

type EventType = {
  eventTypeId: string
  eventCode: string
  eventName: string
  colorHex: string
  isWork: boolean
  isHoliday: boolean
  defaultDurationMinutes: number
  isActive: boolean
}

export default function EventTypesPage() {
  const t = useTranslation()
  const [items, setItems] = useState<EventType[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<EventType | null>(null)
  const [form, setForm] = useState<Partial<EventType>>({
    eventCode: '',
    eventName: '',
    colorHex: '#146C9C',
    isWork: true,
    isHoliday: false,
    defaultDurationMinutes: 0
  })

  async function load() {
    const res = await fetch('/api/event-types')
    const data = await res.json()
    setItems(data.items || [])
  }

  useEffect(() => { load() }, [])

  function startCreate() {
    setEditing(null)
    setForm({ eventCode: '', eventName: '', colorHex: '#146C9C', isWork: true, isHoliday: false, defaultDurationMinutes: 0 })
    setOpen(true)
  }

  function startEdit(x: EventType) {
    setEditing(x)
    setForm({ ...x })
    setOpen(true)
  }

  async function save() {
    const body = {
      eventCode: String(form.eventCode || '').trim(),
      eventName: String(form.eventName || '').trim(),
      colorHex: String(form.colorHex || '#146C9C'),
      isWork: !!form.isWork,
      isHoliday: !!form.isHoliday,
      defaultDurationMinutes: Number(form.defaultDurationMinutes || 0),
      isActive: true
    }
    if (!body.eventCode || !body.eventName) return alert(t.common.missingFields)

    const res = await fetch(editing ? `/api/event-types/${editing.eventTypeId}` : '/api/event-types', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    if (!res.ok) return alert(data?.message || 'Save failed')
    setOpen(false)
    await load()
  }

  async function remove(x: EventType) {
    if (!confirm(t.common.confirmDelete)) return
    const res = await fetch(`/api/event-types/${x.eventTypeId}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) return alert(data?.message || 'Delete failed')
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{t.eventTypes.title}</div>
          <div className="text-white/70 text-sm">{t.eventTypes.subtitle}</div>
        </div>
        <button className="btn-primary" onClick={startCreate}>{t.eventTypes.create}</button>
      </div>

      <div className="mt-4 overflow-auto border border-white/10 rounded-xl2">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr className="text-left">
              <th className="p-3">{t.eventTypes.code}</th>
              <th className="p-3">{t.eventTypes.name}</th>
              <th className="p-3">{t.eventTypes.color}</th>
              <th className="p-3">{t.eventTypes.isWork}</th>
              <th className="p-3">{t.eventTypes.isHoliday}</th>
              <th className="p-3 w-40"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr key={x.eventTypeId} className="border-t border-white/5">
                <td className="p-3">{x.eventCode}</td>
                <td className="p-3">{x.eventName}</td>
                <td className="p-3">
                  <div className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: x.colorHex }} />
                    <span className="text-white/70">{x.colorHex}</span>
                  </div>
                </td>
                <td className="p-3">{x.isWork ? t.common.yes : t.common.no}</td>
                <td className="p-3">{x.isHoliday ? t.common.yes : t.common.no}</td>
                <td className="p-3 text-right">
                  <button className="btn-ghost" onClick={() => startEdit(x)}>{t.common.edit}</button>
                  <button className="btn-ghost" onClick={() => remove(x)}>{t.common.delete}</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td className="p-3 text-white/60" colSpan={6}>{t.common.noData}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} title={editing ? t.eventTypes.edit : t.eventTypes.create} onClose={() => setOpen(false)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="label">{t.eventTypes.code}</label>
            <input className="input mt-1" value={form.eventCode || ''} onChange={(e) => setForm({ ...form, eventCode: e.target.value })} />
          </div>
          <div>
            <label className="label">{t.eventTypes.name}</label>
            <input className="input mt-1" value={form.eventName || ''} onChange={(e) => setForm({ ...form, eventName: e.target.value })} />
          </div>
          <div>
            <label className="label">{t.eventTypes.color}</label>
            <input className="input mt-1" type="color" value={String(form.colorHex || '#146C9C')} onChange={(e) => setForm({ ...form, colorHex: e.target.value })} />
          </div>
          <div>
            <label className="label">{t.eventTypes.defaultDuration}</label>
            <input className="input mt-1" type="number" value={Number(form.defaultDurationMinutes || 0)} onChange={(e) => setForm({ ...form, defaultDurationMinutes: Number(e.target.value) })} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={!!form.isWork} onChange={(e) => setForm({ ...form, isWork: e.target.checked })} />
            <span className="text-sm text-white/80">is_work</span>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={!!form.isHoliday} onChange={(e) => setForm({ ...form, isHoliday: e.target.checked })} />
            <span className="text-sm text-white/80">is_holiday</span>
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
