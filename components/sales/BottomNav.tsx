'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/sales/dashboard', label: 'Projects', icon: '📋' },
  { href: '/sales/projects/new', label: 'New', icon: '➕' },
  { href: '/sales/profile', label: 'Profile', icon: '👤' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-200 safe-bottom z-50">
      <div className="flex items-center">
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href ||
            (item.href === '/sales/dashboard' && pathname.startsWith('/sales/projects/') && !pathname.endsWith('/new'))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
                isActive ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className={`text-[10px] font-medium ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
