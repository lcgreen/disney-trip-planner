'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Settings, Crown } from 'lucide-react'
import Link from 'next/link'
import { PremiumBadge } from '@/components/ui'

interface TripPlannerWidgetProps {
  onRemove?: () => void
  onSettings?: () => void
}

interface PlanItem {
  id: string
  time: string
  activity: string
  park: string
}

export default function TripPlannerWidget({ onRemove, onSettings }: TripPlannerWidgetProps) {
  const [todaysPlan, setTodaysPlan] = useState<PlanItem[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')

  useEffect(() => {
    // Set today's date
    const today = new Date().toISOString().split('T')[0]
    setSelectedDate(today)

    // Mock data - in real app this would come from storage
    setTodaysPlan([
      { id: '1', time: '9:00 AM', activity: 'Space Mountain', park: 'Magic Kingdom' },
      { id: '2', time: '11:30 AM', activity: 'Pirates of the Caribbean', park: 'Magic Kingdom' },
      { id: '3', time: '2:00 PM', activity: 'Lunch at Be Our Guest', park: 'Magic Kingdom' },
    ])
  }, [])

  const isPremiumUser = () => {
    // This would check actual subscription status
    return true
  }

  if (!isPremiumUser()) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-disney-gold/10 to-disney-orange/10 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-disney-gold/20 h-full"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-park-magic to-park-epcot p-2 rounded-lg">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
              <span>Trip Planner</span>
              <PremiumBadge />
            </h3>
          </div>
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1 text-gray-400 hover:text-red-500 rounded"
            >
              ×
            </button>
          )}
        </div>

        <div className="text-center py-4">
          <Crown className="w-8 h-8 text-disney-gold mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-3">
            Upgrade to Premium to access trip planning
          </p>
          <button className="btn-premium text-xs py-2 px-4">
            Upgrade Now
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 h-full"
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-br from-park-magic to-park-epcot p-2 rounded-lg">
            <Calendar className="w-4 h-4 text-white" />
          </div>
                     <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
             <span>Today&apos;s Plan</span>
             <PremiumBadge />
           </h3>
        </div>

        <div className="flex items-center space-x-1">
          {onSettings && (
            <button
              onClick={onSettings}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1 text-gray-400 hover:text-red-500 rounded"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="space-y-2 mb-3">
        {todaysPlan.length > 0 ? (
          todaysPlan.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
              <div className="text-xs font-medium text-disney-blue min-w-[3rem]">
                {item.time}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">{item.activity}</div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  <span>{item.park}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No plans for today</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <Link
          href="/planner"
          className="w-full bg-gradient-to-r from-park-magic to-park-epcot text-white text-sm py-2 px-3 rounded-lg hover:shadow-md transition-all duration-200 text-center block"
        >
          Open Planner
        </Link>
      </div>
    </motion.div>
  )
}