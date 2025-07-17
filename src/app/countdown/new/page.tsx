'use client'

import { motion } from 'framer-motion'
import { Clock, ArrowLeft } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import CountdownTimer from '@/components/CountdownTimer'
import { WidgetConfigManager } from '@/lib/widgetConfig'
import countdownPlugin from '@/plugins/countdown'

function NewCountdownContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const widgetId = searchParams.get('widgetId')
  const editItemId = searchParams.get('editItemId')
  const [isCreating, setIsCreating] = useState(false)
  const [createdItemId, setCreatedItemId] = useState<string | null>(null)
  const [activeCountdown, setActiveCountdown] = useState<any>(null)

  // Handle edit mode - load existing item for editing
  useEffect(() => {
    if (editItemId) {
      setCreatedItemId(editItemId)
      // Load the existing countdown data for editing
      const countdownData = WidgetConfigManager.getSelectedItemData('countdown', editItemId)
      console.log('[Edit Mode] Loading countdown data for editItemId:', editItemId, countdownData)
      if (countdownData) {
        setActiveCountdown(countdownData)
      } else {
        console.warn('[Edit Mode] No countdown data found for editItemId:', editItemId)
      }
      return
    }

    // Auto-create and link item if widgetId is provided (but not editing)
    if (widgetId && !createdItemId && !isCreating) {
      setIsCreating(true)

      // Short delay for smooth UX
      setTimeout(async () => {
        const itemId = await WidgetConfigManager.createAndLinkItem(widgetId, 'countdown')
        if (itemId) {
          setCreatedItemId(itemId)
          setIsCreating(false)

          // Load the created item in the countdown component
          // This will be handled by the CountdownTimer component detecting the created item
          window.dispatchEvent(new CustomEvent('loadCreatedItem', {
            detail: { itemId, widgetId }
          }))
        }
      }, 1500)
    }
  }, [widgetId, editItemId, createdItemId, isCreating])

  // Auto-save handler for CountdownTimer
  const handleAutoSave = (data: Partial<any>) => {
    if (createdItemId) {
      countdownPlugin.updateItem(createdItemId, {
        ...data,
        updatedAt: new Date().toISOString()
      })
    }
  }

  // If widget ID is present and we're still creating, show loading (but not for edit mode)
  if (widgetId && isCreating && !editItemId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 max-w-md"
        >
          <div className="bg-gradient-to-r from-disney-blue to-disney-purple p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Creating Your Countdown</h2>
          <p className="text-gray-600 mb-6">
            We&apos;re setting up a new Disney countdown for your dashboard widget.
          </p>
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-disney-blue"></div>
            <span className="text-disney-blue font-medium">Setting up your magical countdown...</span>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-disney-blue to-disney-purple p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    {editItemId ? 'Edit Disney Countdown Configuration' :
                     widgetId && createdItemId ? 'Edit Your Disney Countdown' :
                     'Create New Disney Countdown'}
                  </h1>
                  <p className="text-blue-100 mt-1">
                    {editItemId
                      ? 'Make changes to your countdown configuration and they will be reflected in your dashboard widget.'
                      : widgetId && createdItemId
                      ? 'Your countdown has been created and linked to your dashboard widget. Make any changes you\'d like!'
                      : 'Set up a countdown to your magical Disney adventure!'
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
            <CountdownTimer
              createdItemId={createdItemId}
              widgetId={widgetId}
              isEditMode={!!createdItemId || !!editItemId}
              activeCountdown={activeCountdown}
              onSave={handleAutoSave}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function NewCountdownPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-disney-blue mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading countdown creator...</p>
        </div>
      </div>
    }>
      <NewCountdownContent />
    </Suspense>
  )
}