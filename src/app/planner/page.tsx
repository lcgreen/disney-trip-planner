'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { PluginHeader, Modal, Badge } from '@/components/ui'
import TripPlanner from '@/components/TripPlanner'
import type { StoredTripPlan } from '@/lib/storage'
import { useUser } from '@/hooks/useUser'
import PremiumRestriction from '@/components/PremiumRestriction'
import FeatureGuard from '@/components/FeatureGuard'

export default function PlannerPage() {
  const { userLevel } = useUser()
  const [currentName, setCurrentName] = useState<string>('')
  const [canSave, setCanSave] = useState<boolean>(false)
  const [savedPlans, setSavedPlans] = useState<StoredTripPlan[]>([])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [planToSave, setPlanToSave] = useState<string>('')
  const [activePlan, setActivePlan] = useState<StoredTripPlan | null>(null)

  // Load saved plans from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('disney-plans')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const plans = Array.isArray(parsed) ? parsed : (parsed.plans || [])
        setSavedPlans(plans)
      } catch {
        setSavedPlans([])
      }
    }
  }, [])

  const handleSave = (name: string) => {
    setPlanToSave(name)
    setShowSaveModal(true)
  }

  const confirmSave = (data: Partial<StoredTripPlan>) => {
    if (!planToSave.trim()) return
    const newPlan: StoredTripPlan = {
      id: Date.now().toString(),
      name: planToSave.trim(),
      days: data.days!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const updated = [...savedPlans, newPlan]
    setSavedPlans(updated)
    localStorage.setItem('disney-plans', JSON.stringify({ plans: updated }))
    setCurrentName(newPlan.name)
    setShowSaveModal(false)
    setPlanToSave('')
    setActivePlan(newPlan)
  }

  const handleLoad = () => {
    setShowLoadModal(true)
  }

  const handleSelectLoad = (plan: StoredTripPlan) => {
    setActivePlan(plan)
    setCurrentName(plan.name)
    setShowLoadModal(false)
  }

  const handleNew = () => {
    setCurrentName('')
    setActivePlan(null)
    setPlanToSave('')
    setCanSave(false)
  }

  // Show premium restriction for anonymous users
  if (userLevel === 'anon') {
    return (
              <FeatureGuard feature="planner" requiredLevel="premium">
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
      </FeatureGuard>
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

          {/* Save Modal */}
          <Modal
            isOpen={showSaveModal}
            onClose={() => setShowSaveModal(false)}
            title="Save Trip Plan"
            size="md"
          >
            <div className="space-y-4">
              <p className="text-gray-600">
                Save your current trip plan to access it later. Your plan will be stored locally in your browser.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name</label>
                <input
                  type="text"
                  value={planToSave}
                  onChange={e => setPlanToSave(e.target.value)}
                  placeholder="Enter a name for your trip plan..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-disney-blue"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                {/* The actual save will be triggered from the TripPlanner via a callback */}
              </div>
            </div>
          </Modal>

          {/* Load Modal */}
          <Modal
            isOpen={showLoadModal}
            onClose={() => setShowLoadModal(false)}
            title="Load Trip Plan"
            size="lg"
          >
            <div className="space-y-4">
              {savedPlans.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No saved plans found.</p>
                  <p className="text-sm text-gray-400">Create and save a trip plan to see it here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-600">
                    Select a saved trip plan to load. This will replace your current plan.
                  </p>
                  {savedPlans.map((p) => (
                    <div
                      key={p.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        activePlan?.id === p.id
                          ? 'border-disney-blue bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleSelectLoad(p)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{p.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span>{p.days.length} {p.days.length === 1 ? 'day' : 'days'}</span>
                            <span>•</span>
                            <span>Updated {new Date(p.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {activePlan?.id === p.id && (
                          <Badge variant="success" size="sm">Currently Loaded</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Modal>

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
  )
}