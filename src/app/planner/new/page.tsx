'use client'

import { motion } from 'framer-motion'
import { Calendar, ArrowLeft } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import TripPlanner from '@/components/TripPlanner'
import { WidgetConfigManager } from '@/lib/widgetConfig'
import { useReduxUser } from '@/hooks/useReduxUser'
import PremiumRestriction from '@/components/PremiumRestriction'
import plannerPlugin from '@/plugins/planner'

function NewPlannerContent() {
  // All hooks must be called first, before any conditional logic
  const { userLevel } = useReduxUser()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [createdItemId, setCreatedItemId] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Get search params
  const widgetId = searchParams.get('widgetId')
  const editItemId = searchParams.get('editItemId')

  // Wait for hydration to complete
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Handle edit mode - load existing item for editing
  useEffect(() => {
    if (editItemId) {
      setCreatedItemId(editItemId)
      return
    }

    // Auto-create and link item if widgetId is provided (but not editing)
    if (widgetId && !createdItemId && !isCreating) {
      setIsCreating(true)

      // Short delay for smooth UX
      setTimeout(async () => {
        const itemId = await WidgetConfigManager.createAndLinkItem(widgetId, 'planner')
        if (itemId) {
          setCreatedItemId(itemId)
          setIsCreating(false)
        }
      }, 1500)
    }
  }, [widgetId, editItemId, createdItemId, isCreating])

  // Auto-save handler for TripPlanner
  const handleAutoSave = (data: Partial<any>) => {
    if (createdItemId) {
      plannerPlugin.updateItem(createdItemId, {
        ...data,
        updatedAt: new Date().toISOString()
      })
    }
  }

  // Show loading state until hydrated
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading trip planner creator...</p>
        </div>
      </div>
    )
  }

  // Show premium restriction for anonymous users
  if (userLevel === 'anon') {
    return (
      <PremiumRestriction
        feature="Trip Planner"
        description="Create detailed day-by-day itineraries for your Disney adventure. Plan attractions, dining, shows, and more with our interactive timeline builder."
        icon={<Calendar className="w-12 h-12" />}
        gradient="from-purple-500 to-pink-500"
      />
    )
  }

  // If widget ID is present and we're still creating, show loading
  if (widgetId && isCreating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Creating Your Trip Plan</h2>
          <p className="text-gray-600 mb-6">Setting up your personalized Disney itinerary builder...</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5 }}
            />
          </div>
          <p className="text-sm text-gray-500">This will only take a moment...</p>
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
                    {editItemId ? 'Edit Trip Plan Configuration' :
                     widgetId && createdItemId ? 'Edit Your Trip Plan' :
                     'Create New Trip Plan'}
                  </h1>
                  <p className="text-white/90 mt-1">
                    {editItemId ? 'Modify your existing trip plan settings' :
                     widgetId && createdItemId ? 'Update your Disney itinerary' :
                     'Plan your perfect Disney adventure day by day'}
                  </p>
                </div>
              </div>

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
              isEditMode={!!createdItemId || !!editItemId}
              name={editItemId ? 'Edit Trip Plan' : 'New Trip Plan'}
              onSave={handleAutoSave}
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