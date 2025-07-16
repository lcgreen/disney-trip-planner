'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { UnifiedStorage } from '@/lib/unifiedStorage'
import { PluginHeader, Modal, FeatureGuard } from '@/components/ui'
import TripPlanner from '@/components/TripPlanner'
import { StoredTripPlan } from '@/lib/storage'

export default function PlannerPage() {
  const { userLevel } = useUser()
  const [currentName, setCurrentName] = useState('')
  const [savedPlans, setSavedPlans] = useState<StoredTripPlan[]>([])
  const [activePlan, setActivePlan] = useState<StoredTripPlan | null>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [planToSave, setPlanToSave] = useState('')
  const [canSave, setCanSave] = useState(false)

  // Load saved plans on mount
  useEffect(() => {
    const plans = UnifiedStorage.getPluginItems<StoredTripPlan>('planner')
    setSavedPlans(plans)
  }, [])

  const handleSave = () => {
    if (currentName.trim()) {
      setPlanToSave(currentName.trim())
      setShowSaveModal(true)
    }
  }

  const handleLoad = () => {
    setShowLoadModal(true)
  }

  const handleNew = () => {
    setCurrentName('')
    setActivePlan(null)
    setPlanToSave('')
    setCanSave(false)
  }

  const confirmSave = () => {
    if (planToSave.trim()) {
      const planData: StoredTripPlan = {
        id: `planner-${Date.now()}`,
        name: planToSave.trim(),
        days: activePlan?.days || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      UnifiedStorage.addPluginItem('planner', planData)
      setSavedPlans(prev => [...prev, planData])
      setActivePlan(planData)
      setCurrentName(planData.name)
      setShowSaveModal(false)
      setPlanToSave('')
      setCanSave(false)
    }
  }

  const handleSelectLoad = (plan: StoredTripPlan) => {
    setActivePlan(plan)
    setCurrentName(plan.name)
    setShowLoadModal(false)
  }

  return (
    <FeatureGuard requiredLevel="premium">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
          >
            <PluginHeader
              title="Disney Trip Planner"
              description="Plan your perfect Disney days with our interactive itinerary builder"
              icon={<Calendar className="w-8 h-8" />}
              gradient="bg-gradient-to-r from-park-magic to-park-epcot"
              isPremium={true}
              currentName={currentName}
              onSave={handleSave}
              onLoad={handleLoad}
              onNew={handleNew}
              canSave={canSave}
              placeholder="Name this trip plan..."
              saveButtonText="Save Plan"
              loadButtonText="Load Plan"
              newButtonText="New Plan"
              saveModalTitle="Save Trip Plan"
              saveModalDescription="Save your current trip plan to access it later. Your plan will be stored locally in your browser."
            />

            {/* Content */}
            <div className="p-6">
              <TripPlanner
                name={currentName}
                onNameChange={setCurrentName}
                onSave={confirmSave}
                onLoad={handleSelectLoad}
                onNew={handleNew}
                savedPlans={savedPlans}
                activePlan={activePlan}
                setCanSave={setCanSave}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Save Modal */}
      <Modal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="Save Trip Plan"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Save your current trip plan to access it later. Your plan will be stored locally in your browser.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Name
            </label>
            <input
              type="text"
              value={planToSave}
              onChange={(e) => setPlanToSave(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="My Disney Trip Plan"
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={confirmSave}
              disabled={!planToSave.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Plan
            </button>
            <button
              onClick={() => setShowSaveModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Load Modal */}
      <Modal
        isOpen={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        title="Load Trip Plan"
      >
        <div className="space-y-4">
          {savedPlans.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No saved plans found. Create a new plan to get started!
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {savedPlans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => handleSelectLoad(plan)}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-800">{plan.name}</div>
                  <div className="text-sm text-gray-500">
                    {plan.days.length} days • Last updated {new Date(plan.updatedAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </FeatureGuard>
  )
}