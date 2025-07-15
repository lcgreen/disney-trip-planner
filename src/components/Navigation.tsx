'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, Clock, DollarSign, Package, Home, Menu, X, Crown, Layout } from 'lucide-react'
import { PremiumBadge } from '@/components/ui'

interface NavigationItem {
  href: string
  label: string
  icon: any
  isPremium?: boolean
}

const navigationItems: NavigationItem[] = [
  {
    href: '/',
    label: 'Home',
    icon: Home,
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: Layout,
  },
  {
    href: '/countdown',
    label: 'Countdown',
    icon: Clock,
  },
  {
    href: '/planner',
    label: 'Trip Planner',
    icon: Calendar,
    isPremium: true,
  },
  {
    href: '/budget',
    label: 'Budget Tracker',
    icon: DollarSign,
    isPremium: true,
  },
  {
    href: '/packing',
    label: 'Packing List',
    icon: Package,
  },
]

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const isPremiumUser = () => {
    // This would check actual subscription status
    return true
  }

  // Don't render until mounted to prevent hydration issues
  if (!isMounted) {
    return (
      <div className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg border border-white/20">
        <div className="w-6 h-6"></div>
      </div>
    )
  }

  return (
    <>
      {/* Menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg border border-white/20"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Navigation sidebar */}
      <motion.nav
        initial={false}
        animate={{
          x: isOpen ? 0 : '-100%',
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 h-full w-64 bg-white/95 backdrop-blur-sm shadow-xl border-r border-white/20 z-50"
      >
        <div className="p-4 lg:p-5">
          {/* Logo/Title */}
          <div className="mb-6">
            <Link
              href="/"
              className="text-xl lg:text-2xl font-bold gradient-text block"
              onClick={() => setIsOpen(false)}
            >
              ✨ Disney
            </Link>
          </div>

          {/* Navigation items */}
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              const canAccess = !item.isPremium || isPremiumUser()

              return (
                <li key={item.href}>
                                      <Link
                      href={canAccess ? item.href : '#'}
                      onClick={(e) => {
                        if (!canAccess) {
                          e.preventDefault()
                          // Show premium modal here
                          return
                        }
                        setIsOpen(false)
                      }}
                      className={`
                        flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm
                        ${isActive
                          ? 'bg-gradient-to-r from-disney-blue to-disney-purple text-white shadow-lg'
                          : canAccess
                          ? 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
                          : 'text-gray-400 cursor-not-allowed opacity-50'
                        }
                      `}
                    >
                                          <item.icon className="w-4 h-4" />
                      <span className="font-medium">{item.label}</span>
                    {item.isPremium && !canAccess && (
                      <Crown className="w-4 h-4 text-disney-gold ml-auto" />
                    )}
                                         {item.isPremium && canAccess && (
                       <div className="ml-auto">
                         <PremiumBadge />
                       </div>
                     )}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Premium upgrade section */}
          {!isPremiumUser() && (
            <div className="mt-6 p-3 bg-gradient-to-br from-disney-gold/10 to-disney-orange/10 rounded-lg border border-disney-gold/20">
              <div className="text-center">
                <Crown className="w-6 h-6 text-disney-gold mx-auto mb-2" />
                <h3 className="font-semibold text-gray-800 mb-1 text-sm">Go Premium</h3>
                <p className="text-xs text-gray-600 mb-3">
                  Unlock all tools
                </p>
                <button className="btn-premium text-xs py-1 px-3">
                  Upgrade
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.nav>


    </>
  )
}