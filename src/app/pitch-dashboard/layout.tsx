'use client'

import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { History, Home, LogOut, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (!session?.user) {
        router.push('/login')
      }
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        if (!session?.user && event === 'SIGNED_OUT') {
          router.push('/login')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      router.push('/login')
    }
  }

  const sidebarItems = [
    {
      href: '/pitch-dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Generate new pitches'
    },
    {
      href: '/pitch-dashboard/profile',
      label: 'Profile',
      icon: UserIcon,
      description: 'Manage your profile'
    },
    {
      href: '/pitch-dashboard/history',
      label: 'Pitch History',
      icon: History,
      description: 'View past pitches'
    }
  ]

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex">
      {/* Mobile menu button - only shown on small screens */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-gray-800 text-gray-200 rounded-lg shadow-lg"
        >
          <div className="w-6 h-6 flex flex-col justify-center space-y-1">
            <div className="w-full h-0.5 bg-current"></div>
            <div className="w-full h-0.5 bg-current"></div>
            <div className="w-full h-0.5 bg-current"></div>
          </div>
        </button>
      </div>

      {/* Sidebar */}
      <div className={`w-64 bg-gray-800 shadow-2xl border-r border-gray-700 flex-col ${
        mobileMenuOpen ? 'flex' : 'hidden lg:flex'
      } fixed lg:relative inset-y-0 left-0 z-40`}>
        {/* Logo/Brand */}
        <div className="p-4 sm:p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">PM</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Pitch Maker</h1>
              <p className="text-xs text-gray-400">AI-Powered Pitches</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-gray-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">
                {user.email?.split('@')[0]}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-900/50 text-blue-300 font-medium border border-blue-700/50'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    title={item.description}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Sign Out Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-red-900/50 hover:text-red-300 rounded-xl transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Top Bar */}
        <div className="bg-gray-800 shadow-lg border-b border-gray-700 px-4 py-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="ml-12 lg:ml-0">
              <h2 className="text-lg font-semibold text-white">
                {pathname === '/pitch-dashboard' && 'Dashboard'}
                {pathname === '/pitch-dashboard/profile' && 'Profile Management'}
                {pathname === '/pitch-dashboard/history' && 'Pitch History'}
              </h2>
              <p className="text-sm text-gray-400 hidden sm:block">
                {pathname === '/pitch-dashboard' && 'Create personalized pitches for job applications'}
                {pathname === '/pitch-dashboard/profile' && 'Manage your personal information and background'}
                {pathname === '/pitch-dashboard/history' && 'View and manage your generated pitches'}
              </p>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}