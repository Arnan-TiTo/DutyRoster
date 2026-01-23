'use client'

import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import { useLanguage } from '@/lib/LanguageContext'
import { useTranslation } from '@/lib/useTranslation'

type ShiftSlot = {
  shiftSlotId: string
  slotCode: string | null
  slotName: string
  locationCode: string | null
  startTime: string
  endTime: string
  minStaff: number
  maxStaff: number
  sortOrder: number
  isActive: boolean
}

export default function ShiftSlotsPage() {
  const t = useTranslation()
  const [items, setItems] = useState<ShiftSlot[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ShiftSlot | null>(null)
  const [form, setForm] = useState<Partial<ShiftSlot>>({
    slotCode: '',
    slotName: '',
    locationCode: null,
    startTime: '09:00',
    endTime: '18:00',
    minStaff: 0,
    maxStaff: 0,
    sortOrder: 0
  })

  async function load() {
    const res = await fetch('/api/shift-slots')
    const data = await res.json()
    setItems(data.items || [])
  }

  async function loadLocations() {
    const res = await fetch('/api/locations?active=1')
    const data = await res.json()
    setLocations(data.items || [])
  }

  useEffect(() => {
    load()
    loadLocations()
  }, [])

  function startCreate() {
    setEditing(null)
    setForm({ slotCode: '', slotName: '', locationCode: null, startTime: '09:00', endTime: '18:00', minStaff: 0, maxStaff: 0, sortOrder: 0 })
    setOpen(true)
  }

  function startEdit(x: ShiftSlot) {
    setEditing(x)
    setForm({ ...x })
    setOpen(true)
  }

  async function save() {
    const body = {
      slotCode: String(form.slotCode || '').trim() || null,
      slotName: String(form.slotName || '').trim(),
      locationCode: form.locationCode || null,
      startTime: String(form.startTime || '09:00'),
      endTime: String(form.endTime || '18:00'),
      minStaff: Number(form.minStaff || 0),
      maxStaff: Number(form.maxStaff || 0),
      sortOrder: Number(form.sortOrder || 0),
      isActive: true
    }
    if (!body.slotName) return alert(t.common.missingFields)

    const res = await fetch(editing ? `/api/shift-slots/${editing.shiftSlotId}` : '/api/shift-slots', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    if (!res.ok) return alert(data?.message || 'Save failed')
    setOpen(false)
    await load()
  }

  async function remove(x: ShiftSlot) {
    if (!confirm(t.common.confirmDelete)) return
    const res = await fetch(`/api/shift-slots/${x.shiftSlotId}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) return alert(data?.message || 'Delete failed')
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{t.shiftSlots.title}</div>
          <div className="text-white/70 text-sm">{t.shiftSlots.subtitle}</div>
        </div>
        <button className="btn-primary" onClick={startCreate}>{t.shiftSlots.create}</button>
      </div>

      <div className="mt-4 overflow-auto border border-white/10 rounded-xl2">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr className="text-left">
              <th className="p-3">{t.shiftSlots.code}</th>
              <th className="p-3">{t.shiftSlots.name}</th>
              <th className="p-3">Location</th>
              <th className="p-3">{t.shiftSlots.time}</th>
              <th className="p-3">{t.shiftSlots.minStaff}</th>
              <th className="p-3">{t.shiftSlots.maxStaff}</th>
              <th className="p-3 w-40"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr key={x.shiftSlotId} className="border-t border-white/5">
                <td className="p-3">{x.slotCode || '-'}</td>
                <td className="p-3">{x.slotName}</td>
                <td className="p-3"><span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">{x.locationCode || '-'}</span></td>
                <td className="p-3">{x.startTime} - {x.endTime}</td>
                <td className="p-3">{x.minStaff}</td>
                <td className="p-3">{x.maxStaff}</td>
                <td className="p-3 text-right">
                  <button className="btn-ghost" onClick={() => startEdit(x)}>{t.common.edit}</button>
                  <button className="btn-ghost" onClick={() => remove(x)}>{t.common.delete}</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td className="p-3 text-white/60" colSpan={7}>{t.common.noData}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} title={editing ? t.shiftSlots.edit : t.shiftSlots.create} onClose={() => setOpen(false)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="label">{t.shiftSlots.code}</label>
            <input className="input mt-1" value={form.slotCode || ''} onChange={(e) => setForm({ ...form, slotCode: e.target.value })} />
          </div>
          <div>
            <label className="label">{t.shiftSlots.name}</label>
            <input className="input mt-1" value={form.slotName || ''} onChange={(e) => setForm({ ...form, slotName: e.target.value })} />
          </div>
          <div className="lg:col-span-2">
            <label className="label">Location Code</label>
            <select className="input mt-1" value={form.locationCode || ''} onChange={(e) => setForm({ ...form, locationCode: e.target.value || null })}>
              <option value="">(ไม่ระบุ - ใช้ pattern matching)</option>
              {locations.map((loc) => (
                <option key={loc.locationId} value={loc.locationCode}>
                  {loc.locationCode} - {loc.locationNameEn}
                </option>
              ))}
            </select>
            <div className="text-xs text-white/50 mt1">เลือก Location Code สำหรับ shift นี้ หรือเว้นว่างเพื่อใช้ naming pattern</div>
          </div>
          <div>
            <label className="label">{t.shiftSlots.startTime}</label>
            <input className="input mt-1" type="time" value={String(form.startTime || '09:00')} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
          </div>
          <div>
            <label className="label">{t.shiftSlots.endTime}</label>
            <input className="input mt-1" type="time" value={String(form.endTime || '18:00')} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
          </div>
          <div>
            <label className="label">{t.shiftSlots.minStaff}</label>
            <input className="input mt-1" type="number" value={Number(form.minStaff || 0)} onChange={(e) => setForm({ ...form, minStaff: Number(e.target.value) })} />
          </div>
          <div>
            <label className="label">{t.shiftSlots.maxStaff}</label>
            <input className="input mt-1" type="number" value={Number(form.maxStaff || 0)} onChange={(e) => setForm({ ...form, maxStaff: Number(e.target.value) })} />
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
