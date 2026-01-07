'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import EventForm from '@/components/EventForm'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { useTranslation } from '@/lib/useTranslation'

export default function RosterManagementPage() {
    const router = useRouter()
    const t = useTranslation()
    const [entries, setEntries] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingEntry, setEditingEntry] = useState<any>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [month, setMonth] = useState('') // Will be set in useEffect

    useEffect(() => {
        // Set current month on client side only to avoid hydration mismatch
        if (!month) {
            setMonth(new Date().toISOString().slice(0, 7))
        }
    }, [])

    useEffect(() => {
        if (month) {
            loadEntries()
        }
    }, [month])

    async function loadEntries() {
        setLoading(true)
        try {
            const res = await fetch(`/api/roster/entries?month=${month}`)
            if (res.ok) {
                const data = await res.json()
                setEntries(data.entries || [])
            }
        } catch (error) {
            console.error('Failed to load entries:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id: string) {
        try {
            const res = await fetch(`/api/roster/entries/${id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                await loadEntries()
                setDeleteConfirm(null)
            }
        } catch (error) {
            console.error('Failed to delete entry:', error)
        }
    }

    function handleEdit(entry: any) {
        setEditingEntry(entry)
        setShowForm(true)
    }

    function handleCreate() {
        setEditingEntry(null)
        setShowForm(true)
    }

    function handleFormSuccess() {
        setShowForm(false)
        setEditingEntry(null)
        loadEntries()
    }

    function handleFormCancel() {
        setShowForm(false)
        setEditingEntry(null)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{t.roster?.title || 'Roster Management'}</h1>
                    <p className="text-white/60 text-sm mt-1">
                        {t.roster?.subtitle || 'Manage shift assignments and events'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="month"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="input"
                    />
                    <button
                        onClick={handleCreate}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus size={18} />
                        {t.roster?.createEntry || 'Create Entry'}
                    </button>
                </div>
            </div>

            {/* Entries List */}
            <div className="card p-6">
                {loading ? (
                    <div className="text-center py-8 text-white/50">{t.common?.loading || 'Loading...'}</div>
                ) : entries.length === 0 ? (
                    <div className="text-center py-8 text-white/50">
                        {t.roster?.noEntries || 'No entries found'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>{t.roster?.date || 'Date'}</th>
                                    <th>{t.roster?.eventType || 'Event Type'}</th>
                                    <th>{t.roster?.shiftSlot || 'Shift Slot'}</th>
                                    <th>{t.roster?.timeRange || 'Time'}</th>
                                    <th>{t.roster?.assignedStaff || 'Staff'}</th>
                                    <th className="text-right">{t.roster?.actions || 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-white/5">
                                        <td>{new Date(entry.date).toLocaleDateString('th-TH')}</td>
                                        <td>{entry.eventTypeName}</td>
                                        <td>{entry.shiftSlotName}</td>
                                        <td className="text-sm text-white/70">
                                            {entry.startTime} - {entry.endTime}
                                        </td>
                                        <td className="text-sm text-white/70">
                                            {entry.staffCount || 0} assigned
                                        </td>
                                        <td>
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(entry)}
                                                    className="p-2 rounded-lg hover:bg-white/10 transition"
                                                    title={t.roster?.editEntry || 'Edit'}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(entry.id)}
                                                    className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition"
                                                    title={t.roster?.deleteEntry || 'Delete'}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="card p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold">
                                {editingEntry
                                    ? (t.roster?.editEntry || 'Edit Entry')
                                    : (t.roster?.createEntry || 'Create Entry')}
                            </h2>
                        </div>
                        <EventForm
                            canEdit={true}
                            initialData={editingEntry || undefined}
                            onSuccess={handleFormSuccess}
                            onCancel={handleFormCancel}
                        />
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="card p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">
                            {t.roster?.confirmDelete || 'Confirm Delete'}
                        </h3>
                        <p className="text-white/70 mb-6">
                            {t.roster?.confirmDeleteMessage || 'Are you sure you want to delete this entry? This action cannot be undone.'}
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="btn-ghost"
                            >
                                {t.common?.cancel || 'Cancel'}
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="btn bg-red-500 hover:bg-red-600 text-white"
                            >
                                {t.common?.delete || 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
