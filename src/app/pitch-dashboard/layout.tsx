'use client'

import { createBrowserClient } from '@supabase/ssr'
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
  const pathname = usePathname()
  const router = useRouter()

  // Create Supabase client for browser
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

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
  }, [router, supabase.auth])

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
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-xl border-r border-gray-200 flex flex-col">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">PM</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Pitch Maker</h1>
              <p className="text-xs text-gray-500">AI-Powered Pitches</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.email?.split('@')[0]}
              </p>
              <p className="text-xs text-gray-500 truncate">
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
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {pathname === '/pitch-dashboard' && 'Dashboard'}
                {pathname === '/pitch-dashboard/profile' && 'Profile Management'}
                {pathname === '/pitch-dashboard/history' && 'Pitch History'}
              </h2>
              <p className="text-sm text-gray-500">
                {pathname === '/pitch-dashboard' && 'Create personalized pitches for job applications'}
                {pathname === '/pitch-dashboard/profile' && 'Manage your personal information and background'}
                {pathname === '/pitch-dashboard/history' && 'View and manage your generated pitches'}
              </p>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  )
}