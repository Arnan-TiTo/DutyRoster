'use client'

import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'
import { useTranslation } from '@/lib/useTranslation'

type LeaveType = {
  leaveTypeId: string
  leaveCode: string
  leaveName: string
}

type Leave = {
  leaveRequestId: string
  dateFrom: string
  dateTo: string
  reason: string | null
  status: string
  leaveType: LeaveType
  requestedAt: string
}

export default function LeavesPage() {
  const t = useTranslation()
  const [types, setTypes] = useState<LeaveType[]>([])
  const [items, setItems] = useState<Leave[]>([])
  const [open, setOpen] = useState(false)
  const [holidayBalance, setHolidayBalance] = useState(0)
  const [form, setForm] = useState({
    leaveTypeId: '',
    dateFrom: '',
    dateTo: '',
    reason: ''
  })

  async function load() {
    const [t, l, h] = await Promise.all([
      fetch('/api/leave-types').then((r) => r.json()),
      fetch('/api/leaves?mine=1').then((r) => r.json()),
      fetch('/api/employees/me/holiday-balance').then((r) => r.json()).catch(() => ({ minutes: 0 }))
    ])
    setTypes(t.items || [])
    setItems(l.items || [])
    setHolidayBalance(h.minutes || 0)
  }

  useEffect(() => { load() }, [])

  function start() {
    const today = new Date()
    const d = today.toISOString().slice(0, 10)
    setForm({ leaveTypeId: types[0]?.leaveTypeId || '', dateFrom: d, dateTo: d, reason: '' })
    setOpen(true)
  }

  async function submit() {
    const body = {
      leaveTypeId: form.leaveTypeId,
      dateFrom: form.dateFrom,
      dateTo: form.dateTo,
      reason: form.reason || null
    }
    const res = await fetch('/api/leaves', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json()
    if (!res.ok) {
      if (data?.message === 'INSUFFICIENT_HOLIDAY_CREDIT') {
        alert(t.leaves.insufficientCredit)
      } else {
        alert(data?.message || t.leaves.createFailed)
      }
      return
    }
    setOpen(false)
    await load()
  }

  async function cancel(x: Leave) {
    if (!confirm(t.leaves.confirmCancel)) return
    const res = await fetch(`/api/leaves/${x.leaveRequestId}/cancel`, { method: 'POST' })
    const data = await res.json()
    if (!res.ok) return alert(data?.message || t.leaves.cancelFailed)
    await load()
  }

  async function deleteLeave(x: Leave) {
    if (!confirm(t.leaves.confirmDelete)) return
    const res = await fetch(`/api/leaves/${x.leaveRequestId}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      return alert(data?.message || t.leaves.deleteFailed)
    }
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{t.leaves.myLeave}</div>
          <div className="text-white/70 text-sm">
            {t.leaves.subtitle}
            {holidayBalance > 0 && (
              <span className="ml-3 text-emerald-400">
                • {t.reports.holidayCredit}: {Math.floor(holidayBalance / 60)} {t.common.hours} {holidayBalance % 60} {t.common.minutes}
              </span>
            )}
          </div>
        </div>
        <button className="btn-primary" onClick={start}>+ {t.leaves.requestLeave}</button>
      </div>

      <div className="mt-4 overflow-auto border border-white/10 rounded-xl2">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr className="text-left">
              <th className="p-3">{t.leaves.leaveType}</th>
              <th className="p-3">{t.leaves.dateFrom}</th>
              <th className="p-3">{t.leaves.dateTo}</th>
              <th className="p-3">{t.leaves.status}</th>
              <th className="p-3">{t.leaves.reason}</th>
              <th className="p-3 w-36"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr key={x.leaveRequestId} className="border-t border-white/5">
                <td className="p-3">{x.leaveType?.leaveName || '-'}</td>
                <td className="p-3">{x.dateFrom}</td>
                <td className="p-3">{x.dateTo}</td>
                <td className="p-3"><span className="px-2 py-1 rounded-xl2 bg-white/10">{(t.leaves as any)[x.status.toLowerCase()] || x.status}</span></td>
                <td className="p-3 text-white/70">{x.reason || '-'}</td>
                <td className="p-3 text-right">
                  {x.status === 'PENDING' && (
                    <button className="btn-ghost text-yellow-400 hover:text-yellow-300" onClick={() => cancel(x)}>{t.common.cancel}</button>
                  )}
                  {(x.status === 'CANCELED' || x.status === 'REJECTED') && (
                    <button className="btn-ghost text-red-400 hover:text-red-300" onClick={() => deleteLeave(x)}>{t.common.delete}</button>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td className="p-3 text-white/60" colSpan={6}>{t.common.noData}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} title={t.leaves.requestLeave} onClose={() => setOpen(false)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="label">{t.leaves.leaveType}</label>
            <select className="input mt-1" value={form.leaveTypeId} onChange={(e) => setForm({ ...form, leaveTypeId: e.target.value })}>
              {types.map((t) => (
                <option key={t.leaveTypeId} value={t.leaveTypeId}>{t.leaveName}</option>
              ))}
            </select>
          </div>
          <div />
          <div>
            <label className="label">{t.leaves.dateFrom}</label>
            <input className="input mt-1" type="date" value={form.dateFrom} onChange={(e) => setForm({ ...form, dateFrom: e.target.value })} />
          </div>
          <div>
            <label className="label">{t.leaves.dateTo}</label>
            <input className="input mt-1" type="date" value={form.dateTo} onChange={(e) => setForm({ ...form, dateTo: e.target.value })} />
          </div>
          <div className="lg:col-span-2">
            <label className="label">{t.leaves.reason}</label>
            <input className="input mt-1" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button className="btn-ghost" onClick={() => setOpen(false)}>{t.common.cancel}</button>
          <button className="btn-primary" onClick={submit} disabled={!form.leaveTypeId}>{t.common.confirm}</button>
        </div>
      </Modal>
    </div>
  )
}
