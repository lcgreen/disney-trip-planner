'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { UnifiedStorage } from '@/lib/unifiedStorage'
import { PluginHeader, Modal, FeatureGuard } from '@/components/ui'
import BudgetTracker from '@/components/BudgetTracker'
import { StoredBudgetData } from '@/lib/storage'

export default function BudgetPage() {
  const { userLevel } = useUser()
  const [currentName, setCurrentName] = useState('')
  const [savedBudgets, setSavedBudgets] = useState<StoredBudgetData[]>([])
  const [activeBudget, setActiveBudget] = useState<StoredBudgetData | null>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [budgetToSave, setBudgetToSave] = useState('')
  const [canSave, setCanSave] = useState(false)

  // Load saved budgets on mount
  useEffect(() => {
    const budgets = UnifiedStorage.getPluginItems<StoredBudgetData>('budget')
    setSavedBudgets(budgets)
  }, [])

  const handleSave = () => {
    if (currentName.trim()) {
      setBudgetToSave(currentName.trim())
      setShowSaveModal(true)
    }
  }

  const handleLoad = () => {
    setShowLoadModal(true)
  }

  const handleNew = () => {
    setCurrentName('')
    setActiveBudget(null)
    setBudgetToSave('')
    setCanSave(false)
  }

  const confirmSave = () => {
    if (budgetToSave.trim()) {
      const budgetData: StoredBudgetData = {
        id: `budget-${Date.now()}`,
        name: budgetToSave.trim(),
        totalBudget: activeBudget?.totalBudget || 0,
        categories: activeBudget?.categories || [],
        expenses: activeBudget?.expenses || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      UnifiedStorage.addPluginItem('budget', budgetData)
      setSavedBudgets(prev => [...prev, budgetData])
      setActiveBudget(budgetData)
      setCurrentName(budgetData.name)
      setShowSaveModal(false)
      setBudgetToSave('')
      setCanSave(false)
    }
  }

  const handleSelectLoad = (budget: StoredBudgetData) => {
    setActiveBudget(budget)
    setCurrentName(budget.name)
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
              title="Disney Budget Tracker"
              description="Keep track of your Disney spending and stay within your magical budget"
              icon={<DollarSign className="w-8 h-8" />}
              gradient="bg-gradient-to-r from-disney-gold to-disney-orange"
              isPremium={true}
              currentName={currentName}
              onSave={handleSave}
              onLoad={handleLoad}
              onNew={handleNew}
              canSave={canSave}
              placeholder="Name this budget..."
              saveButtonText="Save Budget"
              loadButtonText="Load Budget"
              newButtonText="New Budget"
              saveModalTitle="Save Budget"
              saveModalDescription="Save your current budget to access it later. Your budget data will be stored locally in your browser."
            />

            {/* Content */}
            <div className="p-6">
              <BudgetTracker
                name={currentName}
                onNameChange={setCurrentName}
                onSave={confirmSave}
                onLoad={handleSelectLoad}
                onNew={handleNew}
                savedBudgets={savedBudgets}
                activeBudget={activeBudget}
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
        title="Save Budget"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Save your current budget to access it later. Your budget data will be stored locally in your browser.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget Name
            </label>
            <input
              type="text"
              value={budgetToSave}
              onChange={(e) => setBudgetToSave(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="My Disney Budget"
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={confirmSave}
              disabled={!budgetToSave.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Budget
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
        title="Load Budget"
      >
        <div className="space-y-4">
          {savedBudgets.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No saved budgets found. Create a new budget to get started!
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {savedBudgets.map((budget) => (
                <button
                  key={budget.id}
                  onClick={() => handleSelectLoad(budget)}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-800">{budget.name}</div>
                  <div className="text-sm text-gray-500">
                    ${budget.totalBudget.toLocaleString()} budget • Last updated {new Date(budget.updatedAt).toLocaleDateString()}
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