'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, X } from 'lucide-react'
import { useTranslation } from '@/lib/useTranslation'

export default function LocationsPage() {
    const router = useRouter()
    const t = useTranslation()
    const [locations, setLocations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingLocation, setEditingLocation] = useState<any>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    // Form state
    const [locationName, setLocationName] = useState('')
    const [locationCode, setLocationCode] = useState('')
    const [shiftsPerDay, setShiftsPerDay] = useState(1)
    const [isActive, setIsActive] = useState(true)
    const [sortOrder, setSortOrder] = useState(0)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadLocations()
    }, [])

    async function loadLocations() {
        setLoading(true)
        try {
            const res = await fetch('/api/locations')
            if (res.ok) {
                const data = await res.json()
                setLocations(data.items || [])
            }
        } catch (error) {
            console.error('Failed to load locations:', error)
        } finally {
            setLoading(false)
        }
    }

    function handleCreate() {
        setEditingLocation(null)
        setLocationName('')
        setLocationCode('')
        setShiftsPerDay(1)
        setIsActive(true)
        setSortOrder(0)
        setError(null)
        setShowForm(true)
    }

    function handleEdit(location: any) {
        setEditingLocation(location)
        setLocationName(location.locationName)
        setLocationCode(location.locationCode || '')
        setShiftsPerDay(location.shiftsPerDay || 1)
        setIsActive(location.isActive)
        setSortOrder(location.sortOrder || 0)
        setError(null)
        setShowForm(true)
    }

    async function handleSave() {
        if (!locationName.trim()) {
            setError('Location name is required')
            return
        }

        setSaving(true)
        setError(null)

        try {
            const body = {
                locationName: locationName.trim(),
                locationCode: locationCode.trim() || null,
                shiftsPerDay,
                isActive,
                sortOrder
            }

            let res: Response
            if (editingLocation) {
                res = await fetch(`/api/locations/${editingLocation.locationId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                })
            } else {
                res = await fetch('/api/locations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                })
            }

            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Save failed')

            setShowForm(false)
            loadLocations()
        } catch (e: any) {
            setError(e.message || 'Save failed')
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(id: string) {
        try {
            const res = await fetch(`/api/locations/${id}`, {
                method: 'DELETE'
            })
            const data = await res.json()
            if (!res.ok) {
                if (data.message === 'LOCATION_IN_USE') {
                    alert('Cannot delete location that is in use')
                } else {
                    throw new Error(data.message || 'Delete failed')
                }
                return
            }
            await loadLocations()
            setDeleteConfirm(null)
        } catch (error: any) {
            console.error('Failed to delete location:', error)
            alert(error.message || 'Delete failed')
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Locations</h1>
                    <p className="text-white/60 text-sm mt-1">
                        Manage event locations for duty roster
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add Location
                </button>
            </div>

            {/* Locations List */}
            <div className="card p-6">
                {loading ? (
                    <div className="text-center py-8 text-white/50">Loading...</div>
                ) : locations.length === 0 ? (
                    <div className="text-center py-8 text-white/50">
                        No locations found. Create one to get started.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Code</th>
                                    <th>Shifts/Day</th>
                                    <th>Sort Order</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {locations.map((location) => (
                                    <tr key={location.locationId} className="hover:bg-white/5">
                                        <td className="font-medium">{location.locationName}</td>
                                        <td className="text-white/70">{location.locationCode || '-'}</td>
                                        <td className="text-white/70">{location.shiftsPerDay || 1}</td>
                                        <td className="text-white/70">{location.sortOrder}</td>
                                        <td>
                                            <span className={`px-2 py-1 rounded text-xs ${location.isActive ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>
                                                {location.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(location)}
                                                    className="p-2 rounded-lg hover:bg-white/10 transition"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(location.locationId)}
                                                    className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition"
                                                    title="Delete"
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
                    <div className="card p-6 max-w-md w-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">
                                {editingLocation ? 'Edit Location' : 'Add Location'}
                            </h2>
                            <button
                                onClick={() => setShowForm(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="label">Location Name <span className="text-red-400">*</span></label>
                                <input
                                    type="text"
                                    className="input mt-1 w-full"
                                    value={locationName}
                                    onChange={(e) => setLocationName(e.target.value)}
                                    placeholder="e.g., Siam Paragon"
                                />
                            </div>

                            <div>
                                <label className="label">Location Code</label>
                                <input
                                    type="text"
                                    className="input mt-1 w-full"
                                    value={locationCode}
                                    onChange={(e) => setLocationCode(e.target.value)}
                                    placeholder="e.g., SIAM"
                                />
                            </div>

                            <div>
                                <label className="label">Shifts Per Day</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="2"
                                    className="input mt-1 w-full"
                                    value={shiftsPerDay}
                                    onChange={(e) => setShiftsPerDay(Math.min(2, Math.max(1, parseInt(e.target.value) || 1)))}
                                />
                                <p className="text-xs text-white/50 mt-1">Number of shifts to create per day (1-2)</p>
                            </div>

                            <div>
                                <label className="label">Sort Order</label>
                                <input
                                    type="number"
                                    className="input mt-1 w-full"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    className="accent-brand-500"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                />
                                <label htmlFor="isActive" className="label cursor-pointer">Active</label>
                            </div>

                            {error && (
                                <div className="text-sm text-red-200 bg-red-500/10 border border-red-500/20 rounded-xl2 p-3">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="btn-ghost"
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="btn-primary"
                                    disabled={saving || !locationName.trim()}
                                >
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="card p-6 max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
                        <p className="text-white/70 mb-6">
                            Are you sure you want to delete this location? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="btn-ghost"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="btn bg-red-500 hover:bg-red-600 text-white"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
