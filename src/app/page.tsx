'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Clock, DollarSign, Package, MapPin, Star, Crown, Sparkles } from 'lucide-react'
import { PremiumBadge } from '@/components/ui'

interface Tool {
  id: string
  href: string
  title: string
  description: string
  icon: any
  color: string
  requiredLevel?: 'anon' | 'standard' | 'premium'
}

const tools: Tool[] = [
  {
    id: 'countdown',
    href: '/countdown',
    title: 'Disney Countdown',
    description: 'Count down the magical days until your Disney adventure begins!',
    icon: Clock,
    color: 'from-disney-blue to-disney-purple',
    requiredLevel: 'anon',
  },
  {
    id: 'planner',
    href: '/planner',
    title: 'Trip Planner',
    description: 'Plan your daily Disney itinerary and optimize your park experience',
    icon: Calendar,
    color: 'from-park-magic to-park-epcot',
    requiredLevel: 'premium',
  },
  {
    id: 'budget',
    href: '/budget',
    title: 'Budget Tracker',
    description: 'Track your Disney trip expenses and stay within your magical budget',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-500',
    requiredLevel: 'premium',
  },
  {
    id: 'packing',
    href: '/packing',
    title: 'Packing Checklist',
    description: 'Create and manage comprehensive packing lists for your Disney trip',
    icon: Package,
    color: 'from-orange-500 to-amber-500',
    requiredLevel: 'premium',
  },
]

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false)

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-disney-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Enhanced Header */}
      <header className="bg-gradient-to-br from-disney-blue via-disney-purple to-disney-pink p-8 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
                  <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 disney-shadow">
              ✨ Disney Trip Planner ✨
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed">
              Your ultimate suite of magical tools for planning the perfect Disney vacation
            </p>
          </div>
        </div>

        {/* Enhanced floating elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 animate-pulse">
            <Sparkles className="text-disney-gold w-8 h-8" />
          </div>
          <div className="absolute top-20 right-20 animate-bounce" style={{ animationDelay: '1s' }}>
            <Star className="text-disney-pink w-6 h-6" />
          </div>
          <div className="absolute bottom-10 left-1/4 animate-pulse" style={{ animationDelay: '2s' }}>
            <Crown className="text-disney-gold w-10 h-10" />
          </div>
          <div className="absolute top-1/2 right-10 animate-bounce" style={{ animationDelay: '0.5s' }}>
            <Sparkles className="text-disney-pink w-6 h-6" />
          </div>
          <div className="absolute bottom-20 right-1/3 animate-pulse" style={{ animationDelay: '1.5s' }}>
            <Star className="text-disney-gold w-8 h-8" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {tools.map((tool, index) => {
            const canAccess = !tool.requiredLevel || isPremiumUser()

            return (
              <div
                key={tool.id}
                className={`${tool.requiredLevel === 'premium' ? 'tool-card-premium' : 'tool-card'} p-6 md:p-8 relative interactive-card`}
              >
                {tool.requiredLevel === 'premium' && (
                  <div className="absolute top-4 right-4">
                    <PremiumBadge />
                  </div>
                )}

                <div className={`bg-gradient-to-br ${tool.color} p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6`}>
                  <tool.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-gray-800 mb-3">{tool.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{tool.description}</p>

                <div className="mt-auto">
                  {canAccess ? (
                    <Link
                      href={tool.href}
                      className={`btn-${tool.requiredLevel === 'premium' ? 'premium' : 'disney'} inline-block px-6 py-2 text-sm text-center w-full`}
                    >
                      Open Tool
                    </Link>
                  ) : (
                    <button className="btn-premium inline-block px-6 py-2 text-sm text-center w-full">
                      Upgrade to Use
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Features Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border border-white/20">
          <h2 className="text-3xl font-bold text-center mb-8 gradient-text">
            Why Choose Our Disney Planner?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-disney-blue to-disney-purple p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Detailed Planning</h3>
              <p className="text-gray-600">Plan every moment of your Disney adventure with our comprehensive tools</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-disney-gold to-disney-orange p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Magical Experience</h3>
              <p className="text-gray-600">Get the most out of your Disney vacation with insider tips and strategies</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-disney-green to-disney-teal p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Save Money</h3>
              <p className="text-gray-600">Budget effectively and find ways to save on your Disney vacation</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}