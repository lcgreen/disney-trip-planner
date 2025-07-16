'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign } from 'lucide-react'
import BudgetTracker from '@/components/BudgetTracker'
import { PluginHeader, Modal, Badge } from '@/components/ui'
import { type BudgetCategory as ConfigBudgetCategory } from '@/config'
import { useUser } from '@/hooks/useUser'

interface Expense {
  id: string
  category: string
  description: string
  amount: number
  date: string
  isEstimate: boolean
}

interface BudgetCategory {
  id: string
  name: string
  budget: number
  color: string
  icon: string
}

interface StoredBudgetData {
  id: string
  name: string
  totalBudget: number
  categories: BudgetCategory[]
  expenses: Expense[]
  createdAt: string
  updatedAt: string
}

export default function BudgetPage() {
  const { hasFeatureAccess } = useUser()
  const [currentName, setCurrentName] = useState<string>('')
  const [canSave, setCanSave] = useState<boolean>(false)
  const [savedBudgets, setSavedBudgets] = useState<StoredBudgetData[]>([])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [budgetToSave, setBudgetToSave] = useState<string>('')
  const [activeBudget, setActiveBudget] = useState<StoredBudgetData | null>(null)

  // Load saved budgets from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('disney-budgets')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const budgets = Array.isArray(parsed) ? parsed : (parsed.budgets || [])
        setSavedBudgets(budgets)
      } catch {
        setSavedBudgets([])
      }
    }
  }, [])

  const handleSave = (name: string) => {
    setBudgetToSave(name)
    setShowSaveModal(true)
  }

  const confirmSave = async (data: Partial<StoredBudgetData>) => {
    if (!budgetToSave.trim()) return

    // Check if user has save permissions
    if (!hasFeatureAccess('saveData')) {
      console.warn('Save blocked: User does not have save permissions')
      return
    }

    const newBudget: StoredBudgetData = {
      id: Date.now().toString(),
      name: budgetToSave.trim(),
      totalBudget: data.totalBudget!,
      categories: data.categories!,
      expenses: data.expenses!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const updated = [...savedBudgets, newBudget]
    setSavedBudgets(updated)
    localStorage.setItem('disney-budgets', JSON.stringify({ budgets: updated }))
    setCurrentName(newBudget.name)
    setShowSaveModal(false)
    setBudgetToSave('')
    setActiveBudget(newBudget)
  }

  const handleLoad = () => {
    setShowLoadModal(true)
  }

  const handleSelectLoad = (budget: StoredBudgetData) => {
    setActiveBudget(budget)
    setCurrentName(budget.name)
    setShowLoadModal(false)
  }

  const handleNew = () => {
    setCurrentName('')
    setActiveBudget(null)
    setBudgetToSave('')
    setCanSave(false)
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

          {/* Save Modal */}
          <Modal
            isOpen={showSaveModal}
            onClose={() => setShowSaveModal(false)}
            title="Save Budget"
            size="md"
          >
            <div className="space-y-4">
              <p className="text-gray-600">
                Save your current budget to access it later. Your budget data will be stored locally in your browser.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Name</label>
                <input
                  type="text"
                  value={budgetToSave}
                  onChange={e => setBudgetToSave(e.target.value)}
                  placeholder="Enter a name for your budget..."
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
                {/* The actual save will be triggered from the BudgetTracker via a callback */}
              </div>
            </div>
          </Modal>

          {/* Load Modal */}
          <Modal
            isOpen={showLoadModal}
            onClose={() => setShowLoadModal(false)}
            title="Load Budget"
            size="lg"
          >
            <div className="space-y-4">
              {savedBudgets.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No saved budgets found.</p>
                  <p className="text-sm text-gray-400">Create and save a budget to see it here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-600">
                    Select a saved budget to load. This will replace your current budget data.
                  </p>
                  {savedBudgets.map((b) => (
                    <div
                      key={b.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        activeBudget?.id === b.id
                          ? 'border-disney-blue bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleSelectLoad(b)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{b.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span>£{b.totalBudget.toLocaleString()} total budget</span>
                            <span>•</span>
                            <span>{b.expenses.length} {b.expenses.length === 1 ? 'expense' : 'expenses'}</span>
                            <span>•</span>
                            <span>Updated {new Date(b.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {activeBudget?.id === b.id && (
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
  )
}