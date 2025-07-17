'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, Clock, DollarSign, Package, Home, Menu, X, Crown, Layout, User } from 'lucide-react'
import { useReduxUser } from '@/hooks/useReduxUser'
import { hasFeatureAccess } from '@/lib/userManagement'

interface NavigationItem {
  href: string
  label: string
  icon: any
  requiredLevel?: 'anon' | 'standard' | 'premium'
}

// Simple fallback component for icons that don't work in test environment
const createFallbackIcon = (name: string) => {
  const FallbackIcon = (props: any) => (
    <svg
      {...props}
      data-testid={`lucide-${name.toLowerCase()}`}
      aria-label={name}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="9" x2="15" y2="15" />
      <line x1="15" y1="9" x2="9" y2="15" />
    </svg>
  )
  FallbackIcon.displayName = `FallbackIcon(${name})`
  return FallbackIcon
}

// Helper function to get a working icon component
const getIconComponent = (icon: any, name: string) => {
  // If it's a proper React component function, use it
  if (typeof icon === 'function' && icon.name && icon.prototype) {
    return icon
  }

  // If it's a React element object with render function, try to use the render function
  if (typeof icon === 'object' && icon !== null && 'render' in icon && typeof icon.render === 'function') {
    const renderFunc = icon.render
    // Check if the render function is a proper component
    if (renderFunc.name || renderFunc.prototype) {
      return renderFunc
    }
  }

  // Fallback to a simple SVG component
  return createFallbackIcon(name)
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
    requiredLevel: 'premium',
  },
  {
    href: '/budget',
    label: 'Budget Tracker',
    icon: DollarSign,
    requiredLevel: 'premium',
  },
  {
    href: '/packing',
    label: 'Packing List',
    icon: Package,
    requiredLevel: 'premium',
  },
  {
    href: '/test-user-levels',
    label: 'Test User Levels',
    icon: User,
  },
]

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()
  const { isPremium, isStandard, userLevel, hasFeatureAccess: checkFeatureAccess } = useReduxUser()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const isPremiumUser = () => {
    return isPremium
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
          (() => {
            const XComponent = getIconComponent(X, 'X')
            return <XComponent className="w-6 h-6 text-gray-700" />
          })()
        ) : (
          (() => {
            const MenuComponent = getIconComponent(Menu, 'Menu')
            return <MenuComponent className="w-6 h-6 text-gray-700" />
          })()
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
              // Allow all navigation for anonymous users, but show premium badges
              const canAccess = userLevel === 'anon' || !item.requiredLevel || checkFeatureAccess(item.requiredLevel === 'premium' ? 'tripPlanner' : 'countdown')
              const IconComponent = getIconComponent(item.icon, item.label)
              const CrownComponent = getIconComponent(Crown, 'Crown')

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm
                      ${isActive
                        ? 'bg-gradient-to-r from-disney-blue to-disney-purple text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
                      }
                    `}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                    {item.requiredLevel === 'premium' && userLevel === 'anon' && (
                      <CrownComponent className="w-4 h-4 text-disney-gold ml-auto" data-testid="lucide-crown" />
                    )}
                    {item.requiredLevel === 'premium' && userLevel !== 'anon' && canAccess && (
                      <div className="ml-auto">
                        <CrownComponent className="w-4 h-4 text-disney-gold" data-testid="lucide-crown" />
                      </div>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* User Profile Section */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${userLevel === 'premium' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : userLevel === 'standard' ? 'bg-gradient-to-r from-blue-400 to-purple-500' : 'bg-gray-300'} text-white`}>
                {(() => {
                  const UserComponent = getIconComponent(User, 'User')
                  return <UserComponent className="w-4 h-4" />
                })()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {userLevel === 'premium' ? 'Premium' : userLevel === 'standard' ? 'Standard' : 'Anonymous'}
                </p>
                <p className="text-xs text-gray-600">
                  {userLevel === 'premium' ? 'All features unlocked' : userLevel === 'standard' ? 'Basic features' : 'Limited access'}
                </p>
              </div>
            </div>
          </div>

          {/* Premium upgrade section */}
          {!isPremiumUser() && (
            <div className="mt-4 p-3 bg-gradient-to-br from-disney-gold/10 to-disney-orange/10 rounded-lg border border-disney-gold/20">
              <div className="text-center">
                {(() => {
                  const CrownComponent = getIconComponent(Crown, 'Crown')
                  return <CrownComponent className="w-6 h-6 text-disney-gold mx-auto mb-2" data-testid="lucide-crown" />
                })()}
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