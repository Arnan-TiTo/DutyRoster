'use client'

import { useRouter } from 'next/navigation'
import EventForm from '@/components/EventForm'

export default function CreateEventPage() {
    const router = useRouter()

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8">
            <div className="card p-6 md:p-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-300 to-white bg-clip-text text-transparent">
                        Create New Event
                    </h1>
                    <p className="text-white/60 text-sm mt-1">
                        Add a new shift or event to the roster.
                    </p>
                </div>

                <EventForm
                    canEdit={true}
                    onSuccess={() => {
                        router.push('/app')
                        router.refresh()
                    }}
                    onCancel={() => router.back()}
                />
            </div>
        </div>
    )
}
