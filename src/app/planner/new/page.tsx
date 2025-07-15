'use client'

import { motion } from 'framer-motion'
import { Calendar, ArrowLeft } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import TripPlanner from '@/components/TripPlanner'
import { WidgetConfigManager } from '@/lib/widgetConfig'

function NewPlannerContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const widgetId = searchParams.get('widgetId')
  const [isCreating, setIsCreating] = useState(false)
  const [createdItemId, setCreatedItemId] = useState<string | null>(null)

  // Auto-create and link item if widgetId is provided
  useEffect(() => {
    if (widgetId && !createdItemId && !isCreating) {
      setIsCreating(true)

      // Short delay for smooth UX
      setTimeout(() => {
        const itemId = WidgetConfigManager.createAndLinkItem(widgetId, 'planner')
        if (itemId) {
          setCreatedItemId(itemId)
          setIsCreating(false)
        }
      }, 1500)
    }
  }, [widgetId, createdItemId, isCreating])

  // If widget ID is present and we're still creating, show loading
  if (widgetId && isCreating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 max-w-md"
        >
          <div className="bg-gradient-to-r from-park-magic to-park-epcot p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Creating Your Trip Plan</h2>
          <p className="text-gray-600 mb-6">
            We&apos;re setting up a new trip planner for your dashboard widget.
          </p>
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
            <span className="text-purple-600 font-medium">Planning your magical days...</span>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-park-magic to-park-epcot p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <Calendar className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    {widgetId && createdItemId ? 'Edit Your Trip Plan' : 'Create New Trip Plan'}
                  </h1>
                  <p className="text-purple-100 mt-1">
                    {widgetId && createdItemId
                      ? 'Your trip plan has been created and linked to your dashboard widget. Make any changes you\'d like!'
                      : 'Plan your perfect Disney days with detailed itineraries!'
                    }
                  </p>
                </div>
              </div>

              {/* Back to Dashboard button */}
              {widgetId && (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <TripPlanner
              createdItemId={createdItemId}
              widgetId={widgetId}
              isEditMode={!!createdItemId}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function NewPlannerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading trip planner creator...</p>
        </div>
      </div>
    }>
      <NewPlannerContent />
    </Suspense>
  )
}