'use client'

import { useState } from 'react'

export default function AdminToolsPage() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    async function recalculateHolidayCredit() {
        if (!confirm('คุณต้องการคำนวณ Holiday Credit ใหม่ทั้งหมดหรือไม่?')) return

        setLoading(true)
        setResult(null)

        try {
            const res = await fetch('/api/admin/recalculate-holiday-credit', {
                method: 'POST'
            })
            const data = await res.json()

            if (res.ok) {
                setResult({
                    success: true,
                    ...data
                })
                alert(`สำเร็จ!\n\nประมวลผล: ${data.entriesProcessed} รายการ\nสร้าง Holiday Credit: ${data.creditsCreated} รายการ`)
            } else {
                setResult({
                    success: false,
                    error: data.message || 'เกิดข้อผิดพลาด'
                })
                alert(`ผิดพลาด: ${data.message || 'เกิดข้อผิดพลาด'}`)
            }
        } catch (error) {
            console.error(error)
            setResult({
                success: false,
                error: String(error)
            })
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Admin Tools</h1>
                <p className="text-white/60 text-sm mt-1">
                    เครื่องมือสำหรับผู้ดูแลระบบ
                </p>
            </div>

            <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4">Holiday Credit Management</h2>

                <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-lg">
                        <h3 className="font-medium mb-2">Recalculate Holiday Credit</h3>
                        <p className="text-sm text-white/70 mb-4">
                            คำนวณ Holiday Credit ใหม่ทั้งหมดจาก Roster Entries ที่มีอยู่
                            <br />
                            ระบบจะตรวจสอบว่า Roster Entry ไหนตรงกับวันหยุดบริษัท และสร้าง Holiday Credit ให้อัตโนมัติ
                        </p>

                        <button
                            onClick={recalculateHolidayCredit}
                            disabled={loading}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'กำลังประมวลผล...' : 'คำนวณใหม่'}
                        </button>
                    </div>

                    {result && (
                        <div className={`p-4 rounded-lg ${result.success ? 'bg-green-500/20 border border-green-500/50' : 'bg-red-500/20 border border-red-500/50'}`}>
                            <h4 className="font-medium mb-2">
                                {result.success ? '✅ สำเร็จ' : '❌ ผิดพลาด'}
                            </h4>
                            <pre className="text-sm text-white/90 whitespace-pre-wrap">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
