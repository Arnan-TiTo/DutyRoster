'use client'

import { useEffect, useState } from 'react'

export type EventFormProps = {
    initialData?: any
    selectedDate?: Date
    canEdit: boolean
    onSuccess: () => void
    onCancel: () => void
    onDelete?: () => void // Optional, only if editing
}

export default function EventForm({
    initialData = {},
    selectedDate,
    canEdit,
    onSuccess,
    onCancel,
    onDelete
}: EventFormProps) {
    // Helper for datetime-local (YYYY-MM-DDTHH:mm)
    const toLocalISOString = (date?: Date | string) => {
        if (!date) return ''
        const d = new Date(date)
        const pad = (n: number) => n < 10 ? '0' + n : n
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    }

    // Default values
    const defaultStart = selectedDate
        ? toLocalISOString(new Date(selectedDate.setHours(9, 0, 0, 0)))
        : toLocalISOString(new Date())

    const defaultEnd = selectedDate
        ? toLocalISOString(new Date(selectedDate.setHours(17, 0, 0, 0)))
        : toLocalISOString(new Date(new Date().setHours(17, 0, 0, 0)))

    const [title, setTitle] = useState(initialData?.title || '')
    const [eventTypeId, setEventTypeId] = useState(initialData?.extendedProps?.eventTypeId || '')
    const [shiftSlotId, setShiftSlotId] = useState(initialData?.extendedProps?.shiftSlotId || '')
    const [note, setNote] = useState(initialData?.extendedProps?.note || '')

    // DateTime inputs
    const [startAt, setStartAt] = useState(initialData?.start ? toLocalISOString(initialData.start) : defaultStart)
    const [endAt, setEndAt] = useState(initialData?.end ? toLocalISOString(initialData.end) : defaultEnd)

    const [employeeIds, setEmployeeIds] = useState<string[]>([])

    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [eventTypes, setEventTypes] = useState<any[]>([])
    const [shiftSlots, setShiftSlots] = useState<any[]>([])
    const [employees, setEmployees] = useState<any[]>([])

    // Load masters
    useEffect(() => {
        ; (async () => {
            try {
                // Determine what to fetch
                const p = [
                    fetch('/api/event-types').then((r) => r.json()),
                    fetch('/api/shift-slots').then((r) => r.json())
                ]
                // Only fetch employees with role_title = 'Sale' if we can edit
                if (canEdit) {
                    p.push(fetch('/api/employees?active=1&simple=1&role=Sale').then((r) => r.json()))
                }

                const res = await Promise.all(p)
                const t = res[0]
                const s = res[1]
                const e = canEdit ? res[2] : { items: [] }

                if (t.error) console.error('Error loading event-types:', t.message)
                if (s.error) console.error('Error loading shift-slots:', s.message)

                setEventTypes(t.items || [])
                setShiftSlots(s.items || [])
                setEmployees(e.items || [])
            } catch (err) {
                console.error('Fatal error loading masters:', err)
            }
        })()
    }, [canEdit])

    // Load details if editing
    useEffect(() => {
        if (!initialData.id) {
            setEmployeeIds([])
            return
        }
        ; (async () => {
            try {
                const r = await fetch(`/api/roster/entries/${initialData.id}`)
                const d = await r.json()
                if (!r.ok) return
                const it = d.item


                if (it?.note !== undefined) setNote(it.note || '')

                // Force update state from fetched details
                if (it?.eventTypeId) setEventTypeId(it.eventTypeId)
                if (it?.shiftSlotId) setShiftSlotId(it.shiftSlotId)

                // Update times from explicit DB fetch (converted to local)
                if (it?.startAt) setStartAt(toLocalISOString(it.startAt))
                if (it?.endAt) setEndAt(toLocalISOString(it.endAt))

                const ids = Array.isArray(it?.assignments) ? it.assignments.map((a: any) => a.employeeId) : []
                setEmployeeIds(ids)
            } catch {
                // ignore
            }
        })()
    }, [initialData?.id])

    async function save() {
        if (!canEdit) return
        setSaving(true)
        setError(null)

        try {
            const body = {
                eventTypeId,
                shiftSlotId: shiftSlotId || null,
                startAt: new Date(startAt).toISOString(),
                endAt: new Date(endAt).toISOString(),
                note: note || null,
                employeeIds
            }

            let res: Response
            if (initialData.id) {
                res = await fetch(`/api/roster/entries/${initialData.id}`, {
                    method: 'PUT',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(body)
                })
            } else {
                res = await fetch('/api/roster/entries', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(body)
                })
            }
            const data = await res.json()
            if (!res.ok) throw new Error(data?.message || 'Save failed')
            onSuccess()
        } catch (e: any) {
            setError(e?.message || 'Save failed')
        } finally {
            setSaving(false)
        }
    }

    // Auto-set time on Shift Slot change
    useEffect(() => {
        if (!shiftSlotId) return
        const slot = shiftSlots.find((x: typeof shiftSlots[0]) => x.shiftSlotId === shiftSlotId)
        if (slot && startAt) {
            // Keep the date part of startAt
            const datePart = startAt.split('T')[0]
            // Use time from slot
            const sRaw = slot.startTime || ''
            const eRaw = slot.endTime || ''
            const sParams = sRaw.includes('T') ? sRaw.split('T')[1].slice(0, 5) : sRaw.slice(0, 5)
            const eParams = eRaw.includes('T') ? eRaw.split('T')[1].slice(0, 5) : eRaw.slice(0, 5)

            setStartAt(`${datePart}T${sParams}`)

            // Handle overnight shift? For now assume same day or use logic
            let endDay = datePart
            if (sParams > eParams) {
                // Next day
                const d = new Date(datePart)
                d.setDate(d.getDate() + 1)
                endDay = d.toISOString().split('T')[0]
            }
            setEndAt(`${endDay}T${eParams}`)
        }
    }, [shiftSlotId, shiftSlots]) // eslint-disable-line react-hooks/exhaustive-deps

    const [unavailableIds, setUnavailableIds] = useState<string[]>([])

    // Check availability when times change
    useEffect(() => {
        if (!startAt || !endAt) return
        const controller = new AbortController()

        const fetchAvailability = async () => {
            try {
                // If editing, exclude current event ID
                const exclusion = initialData.id ? `&excludeEntryId=${initialData.id}` : ''
                const res = await fetch(`/api/roster/availability?start=${encodeURIComponent(startAt)}&end=${encodeURIComponent(endAt)}${exclusion}`, {
                    signal: controller.signal
                })
                if (res.ok) {
                    const data = await res.json()
                    setUnavailableIds(data.unavailableEmployeeIds || [])
                }
            } catch (err: any) {
                if (err.name !== 'AbortError') console.error(err)
            }
        }

        // Debounce slightly or just run
        const timer = setTimeout(fetchAvailability, 300)
        return () => {
            clearTimeout(timer)
            controller.abort()
        }
    }, [startAt, endAt, initialData?.id])

    return (
        <div className="space-y-4">
            {/* ... grids ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ... existing fields ... */}
                <div>
                    <label className="label">Event Type <span className="text-red-400">*</span></label>
                    <select
                        className="input mt-1 w-full"
                        value={eventTypeId}
                        onChange={(e) => setEventTypeId(e.target.value)}
                        disabled={!canEdit}
                    >
                        <option value="">-- Select Type --</option>
                        {eventTypes.map((x) => (
                            <option key={x.eventTypeId} value={x.eventTypeId}>{x.eventName}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="label">Shift Slot</label>
                    <select
                        className="input mt-1 w-full"
                        value={shiftSlotId}
                        onChange={(e) => setShiftSlotId(e.target.value)}
                        disabled={!canEdit}
                    >
                        <option value="">(Manual Time)</option>
                        {shiftSlots.map((x) => (
                            <option key={x.shiftSlotId} value={x.shiftSlotId}>
                                {x.slotName} ({x.startTime?.substring(0, 5)} - {x.endTime?.substring(0, 5)})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="label">Start Time</label>
                    <input
                        type="datetime-local"
                        className="input mt-1 w-full"
                        value={startAt}
                        onChange={(e) => setStartAt(e.target.value)}
                        disabled={!canEdit}
                    />
                </div>

                <div>
                    <label className="label">End Time</label>
                    <input
                        type="datetime-local"
                        className="input mt-1 w-full"
                        value={endAt}
                        onChange={(e) => setEndAt(e.target.value)}
                        disabled={!canEdit}
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="label">Note</label>
                    <input
                        className="input mt-1 w-full"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        disabled={!canEdit}
                        placeholder="Optional details..."
                    />
                </div>

                {canEdit && (
                    <div className="md:col-span-2">
                        <label className="label">Staff Assignments ({employeeIds.length})</label>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto border border-white/10 rounded-xl2 p-2 bg-white/5">
                            {employees
                                .filter((e: typeof employees[0]) => !unavailableIds.includes(e.employeeId) || employeeIds.includes(e.employeeId))
                                .map((e) => {
                                    const name = `${e.firstName} ${e.lastName} (${e.nickName || '-'})`
                                    const checked = employeeIds.includes(e.employeeId)

                                    return (
                                        <label key={e.employeeId} className={`flex items-center gap-2 p-2 rounded-xl2 transition cursor-pointer ${checked ? 'bg-brand-500/20 border border-brand-500/30' : 'hover:bg-white/5 border border-transparent'}`}>
                                            <input
                                                type="checkbox"
                                                className="accent-brand-500"
                                                checked={checked}
                                                onChange={(ev) => {
                                                    const on = ev.target.checked
                                                    setEmployeeIds((prev) => (on ? Array.from(new Set([...prev, e.employeeId])) : prev.filter((x) => x !== e.employeeId)))
                                                }}
                                            />
                                            <div className="min-w-0">
                                                <div className="text-sm text-white/90 truncate">{name}</div>
                                            </div>
                                        </label>
                                    )
                                })}
                            {employees.length === 0 && <div className="text-sm text-white/50 p-2 italic">Loading staff or list empty...</div>}
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="text-sm text-red-200 bg-red-500/10 border border-red-500/20 rounded-xl2 p-3">
                    Error: {error}
                </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                {initialData.id && onDelete && canEdit && (
                    <button
                        onClick={onDelete}
                        className="btn-ghost text-red-300 hover:text-red-200 hover:bg-red-500/20 mr-auto"
                        disabled={saving}
                    >
                        Delete
                    </button>
                )}

                <button className="btn-ghost" onClick={onCancel} disabled={saving}>Cancel</button>

                {canEdit && (
                    <button
                        className="btn-primary"
                        onClick={save}
                        disabled={saving || !eventTypeId || !startAt || !endAt}
                    >
                        {saving ? 'Saving...' : (initialData.id ? 'Save Changes' : 'Create Event')}
                    </button>
                )}
            </div>
        </div>
    )
}
