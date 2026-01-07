'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { useTranslation } from '@/lib/useTranslation'

type Leave = {
  leaveRequestId: string
  employee: { firstName: string; lastName: string; nickName: string | null }
  leaveType: { leaveName: string }
  dateFrom: string
  dateTo: string
  reason: string | null
  status: string
}

export default function ApprovalsPage() {
  const t = useTranslation()
  const [items, setItems] = useState<Leave[]>([])
  const [status, setStatus] = useState('PENDING')

  async function load() {
    const res = await fetch(`/api/leaves?mine=0&status=${status}`)
    const data = await res.json()
    setItems(data.items || [])
  }

  useEffect(() => { load() }, [status])

  async function approve(id: string) {
    const res = await fetch(`/api/leaves/${id}/approve`, { method: 'POST' })
    const data = await res.json()
    if (!res.ok) return alert(data?.message || 'Approve failed')
    await load()
  }

  async function reject(id: string) {
    const note = prompt(t.approvals.rejectReason) || null
    const res = await fetch(`/api/leaves/${id}/reject`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ note })
    })
    const data = await res.json()
    if (!res.ok) return alert(data?.message || 'Reject failed')
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{t.approvals.title}</div>
          <div className="text-white/70 text-sm">{t.approvals.subtitle}</div>
        </div>
        <select className="input w-44" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="PENDING">{t.leaves.pending}</option>
          <option value="APPROVED">{t.leaves.approved}</option>
          <option value="REJECTED">{t.leaves.rejected}</option>
          <option value="CANCELED">{t.leaves.canceled}</option>
        </select>
      </div>

      <div className="mt-4 overflow-auto border border-white/10 rounded-xl2">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr className="text-left">
              <th className="p-3">{t.approvals.employee}</th>
              <th className="p-3">{t.approvals.type}</th>
              <th className="p-3">{t.approvals.from}</th>
              <th className="p-3">{t.approvals.to}</th>
              <th className="p-3">{t.approvals.reason}</th>
              <th className="p-3">{t.approvals.status}</th>
              <th className="p-3 w-48"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr key={x.leaveRequestId} className="border-t border-white/5">
                <td className="p-3">
                  {x.employee.firstName} {x.employee.lastName}
                  {x.employee.nickName ? <span className="text-white/60"> ({x.employee.nickName})</span> : null}
                </td>
                <td className="p-3">{x.leaveType.leaveName}</td>
                <td className="p-3">{x.dateFrom}</td>
                <td className="p-3">{x.dateTo}</td>
                <td className="p-3 text-white/70">{x.reason || '-'}</td>
                <td className="p-3"><span className="px-2 py-1 rounded-xl2 bg-white/10">{x.status}</span></td>
                <td className="p-3 text-right">
                  <button className="btn-ghost" onClick={() => approve(x.leaveRequestId)} disabled={x.status !== 'PENDING'}>{t.approvals.approve}</button>
                  <button className="btn-ghost" onClick={() => reject(x.leaveRequestId)} disabled={x.status !== 'PENDING'}>{t.approvals.reject}</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td className="p-3 text-white/60" colSpan={7}>{t.common.noData}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
