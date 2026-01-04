'use client'

import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { FileDown } from 'lucide-react'
import { useTranslation } from '@/lib/useTranslation'

export default function ReportsPage() {
    const t = useTranslation()
    const [view, setView] = useState<'SUMMARY' | 'DAILY'>('DAILY')
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)) // YYYY-MM
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [allShiftTypes, setAllShiftTypes] = useState<string[]>([])
    const [rawDaily, setRawDaily] = useState<{ columns: any[], days: any[] }>({ columns: [], days: [] })

    useEffect(() => {
        loadData()
    }, [month, view])

    async function loadData() {
        setLoading(true)
        try {
            if (view === 'SUMMARY') {
                const res = await fetch(`/api/reports/summary?month=${month}`)
                const d = await res.json()
                if (res.ok) {
                    setData(d.items || [])
                    const types = new Set<string>()
                    d.items?.forEach((i: any) => {
                        Object.keys(i.shiftCounts).forEach((k: string) => types.add(k))
                    })
                    setAllShiftTypes(Array.from(types).sort())
                }
            } else {
                const res = await fetch(`/api/reports/daily?month=${month}`)
                const d = await res.json()
                if (res.ok) {
                    setRawDaily({ columns: d.columns, days: d.days })
                }
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    function exportExcel() {
        const wb = XLSX.utils.book_new()

        if (view === 'SUMMARY') {
            // Prepare Summary Data
            const headers = [t.reports.employee, t.reports.totalHours, ...allShiftTypes, t.reports.leaves, t.reports.holidayCredit]
            const rows = data.map(item => {
                const shifts = allShiftTypes.reduce((acc, t) => ({ ...acc, [t]: item.shiftCounts[t] || '-' }), {})
                return {
                    'Employee': item.name,
                    'Total Hours': item.totalHours,
                    ...shifts,
                    'Leaves (Days)': item.leaveDays,
                    'Holiday Credit (Days)': (item.holidayCreditHours / 8).toFixed(2)
                }
            })
            const ws = XLSX.utils.json_to_sheet(rows, { header: headers })
            XLSX.utils.book_append_sheet(wb, ws, 'Summary')
        } else {
            // Prepare Daily Data
            const headers = [t.reports.date, t.reports.day, ...rawDaily.columns.map((c: any) => c.eventName), t.reports.remark]
            const rows = rawDaily.days.map((d: any) => {
                const shifts = rawDaily.columns.reduce((acc: any, c: any) => {
                    const staff = d.assignments[c.eventTypeId] || []
                    acc[c.eventName] = staff.join(', ')
                    return acc
                }, {})
                return {
                    'Date': d.date,
                    'Day': d.dayOfWeek,
                    ...shifts,
                    'Remark': d.holidayName
                }
            })
            const ws = XLSX.utils.json_to_sheet(rows, { header: headers })
            XLSX.utils.book_append_sheet(wb, ws, 'Daily Roster')
        }

        XLSX.writeFile(wb, `Roster_Report_${month}_${view}.xlsx`)
    }

    return (
        <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">{t.reports.title}</h1>
                    <div className="flex gap-4 mt-2">
                        <button
                            onClick={() => setView('DAILY')}
                            className={`px-3 py-1 rounded-lg text-sm transition ${view === 'DAILY' ? 'bg-brand-500 text-white' : 'text-white/60 hover:bg-white/10'}`}
                        >
                            {t.reports.dailyRoster}
                        </button>
                        <button
                            onClick={() => setView('SUMMARY')}
                            className={`px-3 py-1 rounded-lg text-sm transition ${view === 'SUMMARY' ? 'bg-brand-500 text-white' : 'text-white/60 hover:bg-white/10'}`}
                        >
                            {t.reports.monthlySummary}
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={exportExcel}
                        className="btn-white flex items-center gap-2"
                        disabled={loading}
                    >
                        <FileDown size={18} />
                        {t.reports.exportExcel}
                    </button>
                    <div>
                        <input
                            type="month"
                            className="input"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {view === 'SUMMARY' ? (
                <div className="overflow-x-auto max-h-[80vh]">
                    <table className="table w-full">
                        <thead className="sticky top-0 bg-slate-900 z-10">
                            <tr>
                                <th>{t.reports.employee}</th>
                                <th className="text-right">{t.reports.totalHours}</th>
                                {allShiftTypes.map(t => (
                                    <th key={t} className="text-center bg-white/5">{t}</th>
                                ))}
                                <th className="text-right">{t.reports.leaves}</th>
                                <th className="text-right">{t.reports.holidayCredit}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr><td colSpan={10} className="text-center p-8 text-white/50">{t.common.loading}</td></tr>
                            )}
                            {!loading && data.length === 0 && (
                                <tr><td colSpan={10} className="text-center p-8 text-white/50">{t.common.noData}</td></tr>
                            )}
                            {!loading && data.map((item) => (
                                <tr key={item.employeeId} className="hover:bg-white/5">
                                    <td className="font-medium">{item.name}</td>
                                    <td className="text-right font-bold text-brand-400">{item.totalHours.toFixed(2)}</td>
                                    {allShiftTypes.map(t => (
                                        <td key={t} className="text-center text-white/70">
                                            {item.shiftCounts[t] || '-'}
                                        </td>
                                    ))}
                                    <td className="text-right">{item.leaveDays > 0 ? item.leaveDays : '-'}</td>
                                    <td className={`text-right ${item.holidayCreditHours > 0 ? 'text-green-400' : ''}`}>
                                        {item.holidayCreditHours > 0 ? `+${(item.holidayCreditHours / 8).toFixed(2)}` : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : ( // DAILY VIEW
                <div className="overflow-x-auto max-h-[80vh]">
                    <div className="min-w-max">
                        <div className="border border-white/10 rounded-lg overflow-hidden">
                            <table className="table w-full border-collapse">
                                <thead className="sticky top-0 bg-slate-800 z-10">
                                    <tr>
                                        <th className="w-20 bg-slate-800 text-center border border-white/10">{t.reports.date}</th>
                                        <th className="w-20 bg-slate-800 text-center border border-white/10">{t.reports.day}</th>
                                        {rawDaily.columns.map((c: any) => (
                                            <th key={c.eventTypeId} className="bg-slate-800 text-center border border-white/10 whitespace-nowrap px-2">
                                                {c.eventName} ({c.eventCode})
                                            </th>
                                        ))}
                                        <th className="bg-slate-800 text-left border border-white/10 w-48">{t.reports.remark}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading && <tr><td colSpan={20} className="text-center p-8 text-white/50">{t.common.loading}</td></tr>}
                                    {!loading && rawDaily.days.map((d: any) => (
                                        <tr key={d.date} className={d.isHoliday ? 'bg-red-500/10' : 'hover:bg-white/5'}>
                                            <td className="text-center border border-white/10 text-white/80">
                                                {d.date.slice(8, 10)}
                                            </td>
                                            <td className={`text-center border border-white/10 ${['Sat', 'Sun', 'ส.', 'อา.'].some(x => d.dayOfWeek.includes(x)) ? 'text-red-400' : 'text-white/60'}`}>
                                                {d.dayOfWeek}
                                            </td>
                                            {rawDaily.columns.map((c: any) => {
                                                const staff = d.assignments[c.eventTypeId] || []
                                                return (
                                                    <td key={c.eventTypeId} className="border border-white/10 p-2 align-top text-xs">
                                                        {staff.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {staff.map((s: string, idx: number) => (
                                                                    <span key={idx}>{s}{idx < staff.length - 1 ? ',' : ''}</span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-white/10 text-center">-</div>
                                                        )}
                                                    </td>
                                                )
                                            })}
                                            <td className="border border-white/10 p-2 text-xs text-yellow-200/80">
                                                {d.holidayName}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
