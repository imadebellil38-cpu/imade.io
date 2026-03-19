'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const navigation = [
  { name: 'Nouveau devis', href: '/dashboard/devis/nouveau', icon: '➕' },
  { name: 'Mes devis', href: '/dashboard/historique', icon: '📋' },
  { name: 'Prestations', href: '/dashboard/prestations', icon: '🔧' },
  { name: 'Mon profil', href: '/dashboard/profil', icon: '👤' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header mobile */}
      <header className="bg-primary-700 text-white sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard/devis/nouveau" className="text-xl font-bold">
            QuotiPro
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2"
          >
            <span className="text-2xl">{menuOpen ? '✕' : '☰'}</span>
          </button>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <nav className="md:hidden border-t border-primary-600 pb-3">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-3 text-sm ${
                  pathname === item.href
                    ? 'bg-primary-800 text-accent-400'
                    : 'text-primary-100 hover:bg-primary-600'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-3 text-sm text-primary-200 hover:bg-primary-600"
            >
              <span className="mr-2">🚪</span>
              Déconnexion
            </button>
          </nav>
        )}
      </header>

      <div className="flex">
        {/* Sidebar desktop */}
        <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-56px)]">
          <nav className="flex-1 py-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700 w-full"
            >
              <span className="mr-2">🚪</span>
              Déconnexion
            </button>
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 p-4 md:p-8 max-w-5xl">
          {children}
        </main>
      </div>
    </div>
  )
}
