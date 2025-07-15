'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Plus, Trash2, PiggyBank, Target, TrendingUp, AlertTriangle, Save, FolderOpen } from 'lucide-react'
import {
  Modal,
  StatCard,
  BudgetStat,
  BudgetProgress,
  Badge,
  Select,
  Checkbox,
  Button
} from '@/components/ui'
import { getSafeTextColor } from '@/lib/utils'
import {
  getAllBudgetCategories,
  getBudgetCategoryOptions,
  getBudgetSettings,
  getBudgetTips,
  type BudgetCategory as ConfigBudgetCategory
} from '@/config'
import {
  budgetStorage,
  storageUtils,
  type StoredBudgetData,
  type BudgetStorage
} from '@/lib/storage'

// Color mappings for Tailwind classes to hex values
const colorMap: Record<string, string> = {
  'bg-blue-500': '#3b82f6',
  'bg-green-500': '#22c55e',
  'bg-red-500': '#ef4444',
  'bg-yellow-500': '#eab308',
  'bg-purple-500': '#a855f7',
  'bg-pink-500': '#ec4899',
  'bg-gray-500': '#6b7280',
  'bg-indigo-500': '#6366f1',
  'bg-orange-500': '#f97316',
  'bg-teal-500': '#14b8a6'
}

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

export default function BudgetTracker() {
  // Get configuration data
  const configCategories = getAllBudgetCategories()
  const budgetSettings = getBudgetSettings()
  const budgetTips = getBudgetTips()

  // Convert config categories to component format
  const defaultCategories: BudgetCategory[] = configCategories.map(cat => ({
    id: cat.id,
    name: cat.name,
    budget: 0,
    color: cat.color,
    icon: cat.icon
  }))

  const [totalBudget, setTotalBudget] = useState<number>(0)
  const [categories, setCategories] = useState<BudgetCategory[]>(defaultCategories)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [newExpense, setNewExpense] = useState({
    category: 'tickets',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    isEstimate: true
  })

  // Local storage state
  const [savedBudgets, setSavedBudgets] = useState<StoredBudgetData[]>([])
  const [currentBudgetName, setCurrentBudgetName] = useState<string>('')
  const [activeBudgetId, setActiveBudgetId] = useState<string | null>(null)
  const [showSaveBudget, setShowSaveBudget] = useState(false)
  const [showLoadBudget, setShowLoadBudget] = useState(false)
  const [budgetToSave, setBudgetToSave] = useState<string>('')

  // Load saved budgets on component mount
  useEffect(() => {
    const storage = storageUtils.initializeBudgetStorage()
    setSavedBudgets(storage.budgets)

    // Load active budget if exists
    if (storage.activeBudgetId) {
      const activeBudget = storage.budgets.find(budget => budget.id === storage.activeBudgetId)
      if (activeBudget) {
        loadBudget(activeBudget)
      }
    }
  }, [])

  // Auto-save current budget when data changes (if we have an active budget)
  useEffect(() => {
    if (activeBudgetId && currentBudgetName && (totalBudget > 0 || expenses.length > 0 || categories.some(cat => cat.budget > 0))) {
      saveCurrentBudget(false) // Silent save without showing modal
    }
  }, [totalBudget, categories, expenses, activeBudgetId, currentBudgetName])

  const addExpense = () => {
    if (newExpense.description && newExpense.amount) {
      const expense: Expense = {
        id: Date.now().toString(),
        category: newExpense.category,
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        date: newExpense.date,
        isEstimate: newExpense.isEstimate
      }
      setExpenses([...expenses, expense])
      setNewExpense({
        category: 'tickets',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        isEstimate: true
      })
      setShowAddExpense(false)
    }
  }

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id))
  }

  const updateCategoryBudget = (categoryId: string, budget: number) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId ? { ...cat, budget } : cat
    ))
  }

  const getTotalSpent = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0)
  }

  const getCategorySpent = (categoryId: string) => {
    return expenses
      .filter(e => e.category === categoryId)
      .reduce((total, expense) => total + expense.amount, 0)
  }

  const getCategoryProgress = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    if (!category || category.budget === 0) return 0
    return (getCategorySpent(categoryId) / category.budget) * 100
  }

  const getRemainingBudget = () => {
    return totalBudget - getTotalSpent()
  }

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown'
  }

  const getOverallProgress = () => {
    if (totalBudget === 0) return 0
    return (getTotalSpent() / totalBudget) * 100
  }

  const categoryOptions = getBudgetCategoryOptions()

  // Storage functions
  const saveCurrentBudget = (showModal: boolean = true) => {
    if (!budgetToSave.trim() && showModal) {
      setShowSaveBudget(true)
      return
    }

    const budgetName = showModal ? budgetToSave.trim() : currentBudgetName
    if (!budgetName) return

    const budgetData: StoredBudgetData = {
      id: activeBudgetId || storageUtils.generateId(),
      name: budgetName,
      totalBudget,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        budget: cat.budget,
        color: cat.color,
        icon: cat.icon
      })),
      expenses: expenses.map(expense => ({
        id: expense.id,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        isEstimate: expense.isEstimate
      })),
      createdAt: activeBudgetId ? savedBudgets.find(b => b.id === activeBudgetId)?.createdAt || storageUtils.getCurrentTimestamp() : storageUtils.getCurrentTimestamp(),
      updatedAt: storageUtils.getCurrentTimestamp()
    }

    budgetStorage.update(storage => {
      const budgets = storage?.budgets || []
      const existingIndex = budgets.findIndex(budget => budget.id === budgetData.id)

      if (existingIndex >= 0) {
        budgets[existingIndex] = budgetData
      } else {
        budgets.push(budgetData)
      }

      return {
        budgets,
        activeBudgetId: budgetData.id
      }
    })

    // Update local state
    const storage = budgetStorage.get()!
    setSavedBudgets(storage.budgets)
    setActiveBudgetId(budgetData.id)
    setCurrentBudgetName(budgetData.name)

    if (showModal) {
      setBudgetToSave('')
      setShowSaveBudget(false)
    }
  }

  const loadBudget = (budget: StoredBudgetData) => {
    setTotalBudget(budget.totalBudget)
    setCategories(budget.categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      budget: cat.budget,
      color: cat.color,
      icon: cat.icon
    })))
    setExpenses(budget.expenses.map(expense => ({
      id: expense.id,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      isEstimate: expense.isEstimate
    })))

    setActiveBudgetId(budget.id)
    setCurrentBudgetName(budget.name)
    setShowLoadBudget(false)

    // Update active budget in storage
    budgetStorage.update(storage => ({
      ...storage,
      budgets: storage?.budgets || [],
      activeBudgetId: budget.id
    }))
  }

  const deleteBudget = (budgetId: string) => {
    budgetStorage.update(storage => {
      const budgets = storage?.budgets?.filter(budget => budget.id !== budgetId) || []
      const activeBudgetId = storage?.activeBudgetId === budgetId ? undefined : storage?.activeBudgetId

      return { budgets, activeBudgetId }
    })

    const storage = budgetStorage.get()!
    setSavedBudgets(storage.budgets)

    if (activeBudgetId === budgetId) {
      setActiveBudgetId(null)
      setCurrentBudgetName('')
      setTotalBudget(0)
      setCategories(defaultCategories)
      setExpenses([])
    }
  }

  const startNewBudget = () => {
    setTotalBudget(0)
    setCategories(defaultCategories)
    setExpenses([])
    setActiveBudgetId(null)
    setCurrentBudgetName('')

    budgetStorage.update(storage => ({
      ...storage,
      budgets: storage?.budgets || [],
      activeBudgetId: undefined
    }))
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4 gradient-text">Disney Budget Tracker</h2>
        <p className="text-gray-600 mb-6">
          Keep track of your Disney vacation expenses and stay within budget for the most magical trip ever!
        </p>

        {/* Save/Load Controls */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {currentBudgetName ? (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-disney-blue" />
                  <span className="font-medium text-gray-700">Current Budget: {currentBudgetName}</span>
                  <Badge variant="success" size="sm">Saved</Badge>
                </div>
              ) : (
                <span className="text-gray-500">No budget loaded</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowLoadBudget(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                Load Budget
              </Button>

              <Button
                onClick={() => setShowSaveBudget(true)}
                variant="disney"
                size="sm"
                className="flex items-center gap-2"
                disabled={totalBudget === 0 && expenses.length === 0}
              >
                <Save className="w-4 h-4" />
                Save Budget
              </Button>

              <Button
                onClick={startNewBudget}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Budget
              </Button>
            </div>
          </div>
        </div>
      </div>

            {/* Budget Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Budget"
          value={totalBudget}
          icon={<Target className="w-5 h-5" />}
          variant="disney"
          description="Set your total trip budget"
        />

        <StatCard
          title="Total Spent"
          value={getTotalSpent()}
          icon={<DollarSign className="w-5 h-5" />}
          variant="warning"
          description={`${getOverallProgress().toFixed(1)}% of budget used`}
        />

        <StatCard
          title="Remaining"
          value={getRemainingBudget()}
          icon={<PiggyBank className="w-5 h-5" />}
          variant={getRemainingBudget() < 0 ? "error" : "success"}
          description={getRemainingBudget() < 0 ? "Over budget!" : "Available to spend"}
        />
      </div>

      {/* Total Budget Progress */}
      {totalBudget > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <BudgetProgress
            budget={totalBudget}
            spent={getTotalSpent()}
            category="Overall Budget"
            currency="£"
          />
        </motion.div>
      )}

      {/* Category Budgets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-8"
      >
        <h3 className="text-2xl font-bold mb-6">Budget by Category</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{category.icon}</span>
                <h4 className="font-semibold">{category.name}</h4>
              </div>

              <div className="mb-3">
                <label className="block text-sm text-gray-600 mb-1">Budget</label>
                <div className="flex items-center">
                  <span className="text-sm mr-2">£</span>
                  <input
                    type="number"
                    value={category.budget || ''}
                    onChange={(e) => updateCategoryBudget(category.id, parseFloat(e.target.value) || 0)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="mb-3">
                <BudgetProgress
                  spent={getCategorySpent(category.id)}
                  budget={category.budget}
                  category={category.name}
                  currency="£"
                />
              </div>

              <div className="text-sm text-gray-600">
                Remaining: £{(category.budget - getCategorySpent(category.id)).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Expenses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Expenses</h3>
          <button
            onClick={() => setShowAddExpense(true)}
            className="btn-disney flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Expense
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-gray-600 mb-2">No expenses yet</h4>
            <p className="text-gray-500 mb-6">Start tracking your Disney spending!</p>
            <button
              onClick={() => setShowAddExpense(true)}
              className="btn-disney"
            >
              Add Your First Expense
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      categories.find(c => c.id === expense.category)?.color || 'bg-gray-500'
                    }`}>
                      <span className={`text-sm ${
                        getSafeTextColor(
                          colorMap[categories.find(c => c.id === expense.category)?.color || 'bg-gray-500'] || '#6b7280'
                        )
                      }`}>
                        {categories.find(c => c.id === expense.category)?.icon || '💰'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{expense.description}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{getCategoryName(expense.category)}</span>
                        <span>•</span>
                        <span>{new Date(expense.date).toLocaleDateString()}</span>
                        {expense.isEstimate && (
                          <>
                            <span>•</span>
                            <Badge variant="warning" size="xs">
                              Estimate
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold">£{expense.amount.toFixed(2)}</span>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </motion.div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        title="Add Expense"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <Select
              value={newExpense.category}
              onValueChange={(value) => setNewExpense({...newExpense, category: value})}
              options={categoryOptions}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <input
              type="text"
              value={newExpense.description}
              onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
              placeholder="e.g., Park tickets, Hotel booking"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (£)</label>
            <input
              type="number"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
              placeholder="0.00"
              step="0.01"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={newExpense.date}
              onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue"
            />
          </div>

          <Checkbox
            checked={newExpense.isEstimate}
            onCheckedChange={(checked) => setNewExpense({...newExpense, isEstimate: Boolean(checked)})}
            label="This is an estimate"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={addExpense} className="btn-disney flex-1">
            Add Expense
          </button>
          <button
            onClick={() => setShowAddExpense(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </Modal>

      {/* Money Saving Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <PiggyBank className="w-6 h-6 text-disney-gold" />
          💡 Money-Saving Tips for Disney
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">🍔 Dining</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Bring snacks and water bottles</li>
                <li>• Share meals - portions are huge!</li>
                <li>• Look for character dining deals</li>
                <li>• Use Disney dining plan if staying on-site</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">🎫 Tickets</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Buy multi-day tickets for better value</li>
                <li>• Book in advance for discounts</li>
                <li>• Consider park hopper carefully</li>
                <li>• Check for seasonal promotions</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">🛍️ Shopping</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Set a souvenir budget per person</li>
                <li>• Buy Disney items before your trip</li>
                <li>• Ship purchases home to save space</li>
                <li>• Look for Disney outlet stores nearby</li>
              </ul>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-800 mb-2">🏨 Accommodation</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Stay off-site for budget savings</li>
                <li>• Book with kitchen for meal prep</li>
                <li>• Consider value Disney resorts</li>
                <li>• Split costs with family/friends</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Save Budget Modal */}
      <Modal
        isOpen={showSaveBudget}
        onClose={() => {
          setShowSaveBudget(false)
          setBudgetToSave('')
        }}
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
              onChange={(e) => setBudgetToSave(e.target.value)}
              placeholder="Enter a name for your budget..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-disney-blue"
              autoFocus
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setShowSaveBudget(false)
                setBudgetToSave('')
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => saveCurrentBudget(true)}
              disabled={!budgetToSave.trim()}
              className="px-4 py-2 bg-disney-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              Save Budget
            </button>
          </div>
        </div>
      </Modal>

      {/* Load Budget Modal */}
      <Modal
        isOpen={showLoadBudget}
        onClose={() => setShowLoadBudget(false)}
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

              {savedBudgets.map((budget) => (
                <div
                  key={budget.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    activeBudgetId === budget.id
                      ? 'border-disney-blue bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1" onClick={() => loadBudget(budget)}>
                      <h3 className="font-medium text-gray-900">{budget.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span>£{budget.totalBudget.toLocaleString()} total budget</span>
                        <span>•</span>
                        <span>{budget.expenses.length} {budget.expenses.length === 1 ? 'expense' : 'expenses'}</span>
                        <span>•</span>
                        <span>Updated {new Date(budget.updatedAt).toLocaleDateString()}</span>
                        {activeBudgetId === budget.id && (
                          <>
                            <span>•</span>
                            <Badge variant="success" size="sm">Currently Loaded</Badge>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm(`Are you sure you want to delete "${budget.name}"?`)) {
                          deleteBudget(budget.id)
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}