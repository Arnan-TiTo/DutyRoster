'use client'

export default function Modal({
  open,
  title,
  children,
  onClose
}: {
  open: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end lg:items-center justify-center p-3">
      <div className="w-full lg:w-[720px] card p-5">
        <div className="flex items-center justify-between">
          <div className="font-semibold">{title}</div>
          <button className="btn-ghost" onClick={onClose}>ปิด</button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}
