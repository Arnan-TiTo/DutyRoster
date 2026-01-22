'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays, Users, Settings, ClipboardList, ShieldCheck, PartyPopper, Clock, LogOut,
  CalendarOff, UserCog, UserCircle, Menu, FileText, X, Briefcase, MapPin
} from 'lucide-react'
import { useTranslation } from '@/lib/useTranslation'
import LanguageSwitch from './LanguageSwitch'
import Image from 'next/image'

type MenuItem = {
  href: string
  label: string
  icon: React.ReactNode
  show: (roles: string[]) => boolean
}

type MenuGroup = {
  title?: string
  items: MenuItem[]
}

export default function Sidebar({
  roles,
  displayName,
  isOpen,
  onClose
}: {
  roles: string[]
  displayName: string
  isOpen: boolean
  onClose: () => void
}) {
  const pathname = usePathname()
  const t = useTranslation()

  const isAdmin = roles.includes('ADMIN')
  const isSupervisor = roles.includes('SUPERVISOR')

  const menuGroups: MenuGroup[] = [
    {
      items: [
        {
          href: '/app',
          label: t.sidebar.calendar,
          icon: <CalendarDays size={16} />,
          show: () => true
        },
        {
          href: '/app/roster',
          label: t.sidebar.createEntry,
          icon: <ClipboardList size={16} />,
          show: () => isAdmin || isSupervisor
        },
        {
          href: '/app/leaves',
          label: t.sidebar.myLeave,
          icon: <ClipboardList size={16} />,
          show: () => true
        },
        {
          href: '/app/reports',
          label: t.sidebar.reports,
          icon: <FileText size={16} />,
          show: () => true
        }
      ]
    },
    {
      title: t.sidebar.calendar,
      items: [
        {
          href: '/app/event-types',
          label: t.sidebar.eventTypes,
          icon: <PartyPopper size={16} />,
          show: () => isAdmin
        },
        {
          href: '/app/shift-slots',
          label: t.sidebar.shiftSlots,
          icon: <Clock size={16} />,
          show: () => isAdmin
        },
        {
          href: '/app/locations',
          label: t.sidebar.locations,
          icon: <MapPin size={16} />,
          show: () => isAdmin
        },
        {
          href: '/app/company-holidays',
          label: t.sidebar.companyHolidays,
          icon: <Settings size={16} />,
          show: () => isAdmin
        }
      ]
    },
    {
      title: t.sidebar.employees,
      items: [
        {
          href: '/app/employees',
          label: t.sidebar.employees,
          icon: <Users size={16} />,
          show: () => isAdmin
        },
        {
          href: '/app/teams',
          label: t.sidebar.teams,
          icon: <Briefcase size={16} />,
          show: () => isAdmin
        },
        {
          href: '/app/approvals',
          label: t.sidebar.leaveApprovals,
          icon: <ShieldCheck size={16} />,
          show: () => isAdmin || isSupervisor
        },
        {
          href: '/app/leave-types',
          label: t.sidebar.leaveTypes,
          icon: <CalendarOff size={16} />,
          show: () => isAdmin
        }
      ]
    },
    {
      title: t.sidebar.menuSystem,
      items: [
        {
          href: '/app/roles',
          label: t.sidebar.rolesPerms,
          icon: <UserCircle size={16} />,
          show: () => isAdmin
        },
        {
          href: '/app/menus',
          label: t.sidebar.menuSystem,
          icon: <Menu size={16} />,
          show: () => isAdmin
        },
        {
          href: '/app/users',
          label: t.sidebar.users,
          icon: <UserCog size={16} />,
          show: () => isAdmin
        }
      ]
    }
  ]

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        bg-slate-900/50 backdrop-blur-sm border-r border-white/5
        h-screen lg:h-[calc(100vh-5rem)]
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64 lg:w-72' : 'w-64 lg:w-16'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:relative left-0 top-0 lg:top-0 pt-16 lg:pt-0 p-3
        flex flex-col
        overflow-y-auto
        z-40
      `}>
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 transition"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className={`flex items-center gap-2 px-2 py-3 mb-2 ${!isOpen && 'lg:justify-center'}`}>
          <Image src="/bmw-logo.png" alt="BMW" width={32} height={32} className="object-contain flex-shrink-0" />
          <div className={`min-w-0 flex-1 ${!isOpen && 'lg:hidden'}`}>
            <div className="text-sm font-medium truncate">{displayName}</div>
            <div className="text-xs text-white/40 truncate">{roles.join(', ') || '—'}</div>
          </div>
        </div>



        {/* Language Switch */}
        <div className={`px-2 mb-3 ${!isOpen && 'lg:hidden'}`}>
          <LanguageSwitch />
        </div>

        {/* Menu Groups */}
        <nav className="flex-1 overflow-y-auto space-y-4 px-1 min-h-0">
          {menuGroups.map((group, groupIdx) => {
            const visibleItems = group.items.filter(item => item.show(roles))
            if (visibleItems.length === 0) return null

            return (
              <div key={groupIdx}>
                {group.title && (
                  <div className={`px-2 py-1 text-xs font-medium text-white/40 uppercase tracking-wider ${!isOpen && 'lg:hidden'}`}>
                    {group.title}
                  </div>
                )}
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const active = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => {
                          // Close on mobile after click
                          if (window.innerWidth < 1024) {
                            onClose()
                          }
                        }}
                        className={`
                          flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors
                          ${!isOpen && 'lg:justify-center lg:px-0'}
                          ${active
                            ? 'bg-white/10 text-white'
                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                          }
                        `}
                        title={!isOpen ? item.label : undefined}
                      >
                        <span className="flex-shrink-0">{item.icon}</span>
                        <span className={`truncate ${!isOpen && 'lg:hidden'}`}>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Logout - moved inside nav for scrollability */}
          <div className="pt-3 mt-auto border-t border-white/5">
            <button
              onClick={logout}
              className={`
                flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors w-full
                ${!isOpen && 'lg:justify-center lg:px-0'}
              `}
              title={!isOpen ? t.sidebar.logout : undefined}
            >
              <LogOut size={16} />
              <span className={`${!isOpen && 'lg:hidden'}`}>{t.sidebar.logout}</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  )
}
