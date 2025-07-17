'use client'

import { motion } from 'framer-motion'
import { DollarSign, ArrowLeft } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import BudgetTracker from '@/components/BudgetTracker'
import { WidgetConfigManager } from '@/lib/widgetConfig'
import { useReduxUser } from '@/hooks/useReduxUser'
import PremiumRestriction from '@/components/PremiumRestriction'
import budgetPlugin from '@/plugins/budget'

function NewBudgetContent() {
  const { userLevel } = useReduxUser()
  const searchParams = useSearchParams()
  const router = useRouter()
  const widgetId = searchParams.get('widgetId')
  const editItemId = searchParams.get('editItemId')
  const [isCreating, setIsCreating] = useState(false)
  const [createdItemId, setCreatedItemId] = useState<string | null>(null)

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
        const itemId = await WidgetConfigManager.createAndLinkItem(widgetId, 'budget')
        if (itemId) {
          setCreatedItemId(itemId)
          setIsCreating(false)
        }
      }, 1500)
    }
  }, [widgetId, editItemId, createdItemId, isCreating])

  // Auto-save handler for BudgetTracker
  const handleAutoSave = (data: Partial<any>) => {
    if (createdItemId) {
      budgetPlugin.updateItem(createdItemId, {
        ...data,
        updatedAt: new Date().toISOString()
      })
    }
  }

  // Show premium restriction for anonymous users
  if (userLevel === 'anon') {
    return (
      <PremiumRestriction
        feature="Budget Tracker"
        description="Track your Disney trip expenses and stay within your magical budget. Set spending limits by category and monitor your progress in real-time."
        icon={<DollarSign className="w-12 h-12" />}
        gradient="from-green-500 to-emerald-500"
      />
    )
  }

  // If widget ID is present and we're still creating, show loading (but not for edit mode)
  if (widgetId && isCreating && !editItemId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 max-w-md"
        >
          <div className="bg-gradient-to-r from-disney-gold to-disney-orange p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Creating Your Budget</h2>
          <p className="text-gray-600 mb-6">
            We&apos;re setting up a new budget tracker for your dashboard widget.
          </p>
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-disney-gold"></div>
            <span className="text-disney-gold font-medium">Setting up your budget...</span>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-disney-gold to-disney-orange p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <DollarSign className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    {editItemId ? 'Edit Budget Configuration' :
                     widgetId && createdItemId ? 'Edit Your Budget' :
                     'Create New Budget'}
                  </h1>
                  <p className="text-yellow-100 mt-1">
                    {editItemId
                      ? 'Make changes to your budget configuration and they will be reflected in your dashboard widget.'
                      : widgetId && createdItemId
                      ? 'Your budget has been created and linked to your dashboard widget. Make any changes you\'d like!'
                      : 'Track and manage your Disney vacation spending!'
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
            <BudgetTracker
              createdItemId={createdItemId}
              widgetId={widgetId}
              isEditMode={!!createdItemId || !!editItemId}
              onSave={handleAutoSave}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function NewBudgetPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-disney-gold mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading budget tracker creator...</p>
        </div>
      </div>
    }>
      <NewBudgetContent />
    </Suspense>
  )
}