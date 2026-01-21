'use client'

import { useEffect, useMemo, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import EventForm from './EventForm'

type CalEvent = {
  id: string
  title: string
  start: string
  end: string
  color?: string
  extendedProps?: any
}

export default function CalendarView({ roles }: { roles: string[] }) {
  const canEdit = roles.includes('ADMIN') || roles.includes('SUPERVISOR')
  const [events, setEvents] = useState<CalEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [active, setActive] = useState<CalEvent | null>(null)
  const [currentMonth, setCurrentMonth] = useState('')
  const [runningRR, setRunningRR] = useState(false)

  async function load(monthIso: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/calendar/month?month=${encodeURIComponent(monthIso)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Load failed')
      setEvents(data.items)
    } catch (e: any) {
      setError(e?.message || 'Load failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const now = new Date()
    const m = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    setCurrentMonth(m)
    load(m)
  }, [])

  async function handleRoundRobin() {
    if (!currentMonth) return
    if (!confirm(`ระบบจะล้างข้อมูล Event เดิมของเดือน ${currentMonth} และสร้างตารางใหม่:\n- 3 สถานที่ต่อวัน\n- 2 กะต่อสถานที่ (10:00-19:00, 13:00-21:00)\n- จัดพนักงาน Staff 8 ท่านให้เท่าเทียมกัน\nยืนยันการดำเนินการ?`)) return

    setRunningRR(true)
    try {
      const res = await fetch('/api/roster/round-robin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: currentMonth })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Round Robin failed')
      alert(`ดำเนินการเสร็จสิ้น: สร้างการจัดเวรใหม่ ${data.assignmentsCreated} รายการ`)
      load(currentMonth)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setRunningRR(false)
    }
  }

  const headerToolbar = useMemo(
    () => ({
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    }),
    []
  )

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className="text-lg font-semibold">Calendar</div>
          <div className="text-white/70 text-sm">ดูตารางเวร/กิจกรรมแบบ Month/Week/Day</div>
        </div>
        <div className="text-xs text-white/60 flex items-center gap-3">
          {canEdit && (
            <button
              onClick={handleRoundRobin}
              disabled={runningRR}
              className="btn-primary py-1 px-3 text-xs flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none"
            >
              {runningRR ? 'กำลังประมวลผล...' : 'Round Robin'}
            </button>
          )}
          {canEdit ? 'คุณสามารถสร้าง/จัดเวรได้' : 'คุณเห็นเฉพาะรายการของคุณ'}
        </div>
      </div>

      {error && (
        <div className="mb-3 text-sm text-red-200 bg-red-500/10 border border-red-500/20 rounded-xl2 p-3">
          {error}
        </div>
      )}

      <div className="rounded-xl2 overflow-hidden border border-white/10 bg-white/5">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={headerToolbar}
          height="auto"
          events={events}
          nowIndicator
          selectable={canEdit}
          datesSet={(arg) => {
            // Use center of the range to determine the "current" month
            // This prevents loading the previous month when the view starts with trailing days
            const center = new Date((arg.start.getTime() + arg.end.getTime()) / 2)
            const m = `${center.getFullYear()}-${String(center.getMonth() + 1).padStart(2, '0')}`
            setCurrentMonth(m)
            load(m)
          }}
          eventClick={(info) => {
            const ev = info.event
            setActive({
              id: ev.id,
              title: ev.title,
              start: ev.start?.toISOString() || '',
              end: ev.end?.toISOString() || '',
              color: ev.backgroundColor,
              extendedProps: ev.extendedProps
            })
          }}
          select={(sel) => {
            if (!canEdit) return
            setActive({
              id: '',
              title: '',
              start: sel.startStr,
              end: sel.endStr,
              color: '#146C9C'
            })
          }}
        />
      </div>

      {loading && <div className="mt-2 text-xs text-white/60">กำลังโหลด...</div>}

      {active && (
        <div className="fixed inset-0 bg-black/50 flex items-end lg:items-center justify-center z-50 p-4">
          <div className="w-full lg:w-[700px] card p-6 max-h-[90vh] overflow-y-auto">
            <div className="text-lg font-semibold mb-4">{active.id ? 'Edit Event' : 'New Event'}</div>
            <EventForm
              initialData={active}
              canEdit={canEdit}
              onSuccess={() => {
                setActive(null)
                const d = new Date(active.start)
                const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
                load(m)
              }}
              onCancel={() => setActive(null)}
              onDelete={async () => {
                if (!confirm('Delete this event?')) return
                try {
                  await fetch(`/api/roster/entries/${active.id}`, { method: 'DELETE' })
                  setActive(null)
                  const d = new Date(active.start)
                  const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
                  load(m)
                } catch (e) {
                  alert('Failed to delete')
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
