'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { BudgetData, Expense, BudgetCategory } from '@/types'
import { useReduxBudget } from '@/hooks/useReduxBudget'
import { useReduxUser } from '@/hooks/useReduxUser'
import { useReduxWidgets } from '@/hooks/useReduxWidgets'
import { WidgetConfigManager } from '@/lib/widgetConfig'
import { useEditableName } from '@/hooks/useEditableName'

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

interface BudgetTrackerProps {
  createdItemId?: string | null
  widgetId?: string | null
  isEditMode?: boolean
  name?: string
  onNameChange?: (name: string) => void
  onSave?: (data: Partial<BudgetData>) => void
  onLoad?: (budget: BudgetData) => void
  onNew?: () => void
  savedBudgets?: BudgetData[]
  activeBudget?: BudgetData | null
  setCanSave?: (canSave: boolean) => void
}

export default function BudgetTracker({
  createdItemId = null,
  widgetId = null,
  isEditMode = false,
  name = '',
  onNameChange,
  onSave,
  onLoad,
  onNew,
  savedBudgets = [],
  activeBudget = null,
  setCanSave
}: BudgetTrackerProps) {
  // Editable name functionality
  const {
    isEditingName,
    editedName,
    handleNameEdit,
    handleNameChange,
    handleNameBlur,
    handleNameKeyDown
  } = useEditableName({ name, onNameChange })

  // Redux hooks
  const {
    budgetData,
    isLoading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    loadBudget,
    clearAllBudgets,
    setTotalBudget,
    setCategories,
    updateCategoryBudget,
    setExpenses,
    addExpense,
    deleteExpense,
    setShowAddExpense,
    setNewExpense,
    resetNewExpense
  } = useReduxBudget()

  const { user, hasFeatureAccess } = useReduxUser()
  const { checkAndApplyPendingLinks } = useReduxWidgets()

  // Get configuration data
  const configCategories = getAllBudgetCategories()
  const budgetSettings = getBudgetSettings()
  const budgetTips = getBudgetTips()

  // Load initial data
  useEffect(() => {
    if (isEditMode && activeBudget) {
      loadBudget(activeBudget)
    }
  }, [isEditMode, activeBudget, loadBudget])

  // Load created item in edit mode
  useEffect(() => {
    if (isEditMode && createdItemId && activeBudget) {
      loadBudget(activeBudget)
    }
  }, [isEditMode, createdItemId, activeBudget, loadBudget])

  // Update parent when data changes
  useEffect(() => {
    if (onSave) {
      onSave({
        totalBudget: budgetData.totalBudget,
        categories: budgetData.categories,
        expenses: budgetData.expenses
      })
    }
    setCanSave?.(true)
  }, [budgetData.totalBudget, budgetData.categories, budgetData.expenses, onSave, setCanSave])

  const handleAddExpense = () => {
    if (budgetData.newExpense.description && budgetData.newExpense.amount) {
      const expense: Expense = {
        id: Date.now().toString(),
        category: budgetData.newExpense.category,
        description: budgetData.newExpense.description,
        amount: parseFloat(budgetData.newExpense.amount),
        date: budgetData.newExpense.date,
        isEstimate: budgetData.newExpense.isEstimate
      }
      addExpense(expense)
      resetNewExpense()
      setShowAddExpense(false)
    }
  }

  const handleDeleteExpense = (id: string) => {
    deleteExpense(id)
  }

  const handleUpdateCategoryBudget = (categoryId: string, budget: number) => {
    updateCategoryBudget(categoryId, budget)
  }

  const getTotalSpent = () => {
    return budgetData.expenses.reduce((total, expense) => total + expense.amount, 0)
  }

  const getCategorySpent = (categoryId: string) => {
    return budgetData.expenses
      .filter(e => e.category === categoryId)
      .reduce((total, expense) => total + expense.amount, 0)
  }

  const getCategoryProgress = (categoryId: string) => {
    const category = budgetData.categories.find(c => c.id === categoryId)
    if (!category || category.budget === 0) return 0
    return (getCategorySpent(categoryId) / category.budget) * 100
  }

  const getRemainingBudget = () => {
    return budgetData.totalBudget - getTotalSpent()
  }

  const getCategoryName = (categoryId: string) => {
    return budgetData.categories.find(c => c.id === categoryId)?.name || 'Unknown'
  }

  const getOverallProgress = () => {
    if (budgetData.totalBudget === 0) return 0
    return (getTotalSpent() / budgetData.totalBudget) * 100
  }

  const categoryOptions = getBudgetCategoryOptions()

  const saveBudget = () => {
    if (!name.trim()) return

    // If we're editing an existing item, update it
    if (isEditMode && createdItemId) {
      const updatedBudget: BudgetData = {
        id: createdItemId,
        name: name.trim(),
        totalBudget: budgetData.totalBudget,
        categories: budgetData.categories,
        expenses: budgetData.expenses,
        createdAt: savedBudgets?.find(b => b.id === createdItemId)?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      updateBudget(createdItemId, updatedBudget)
      onSave?.(updatedBudget)
    } else {
      // Creating a new budget
      const newBudget: BudgetData = {
        id: Date.now().toString(),
        name: name.trim(),
        totalBudget: budgetData.totalBudget,
        categories: budgetData.categories,
        expenses: budgetData.expenses,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      createBudget(name.trim())
      onNew?.()

      // Check for pending widget links and auto-link if needed
      checkAndApplyPendingLinks(newBudget.id, 'budget')
    }
  }

  const handleDeleteBudget = (id: string) => {
    deleteBudget(id)
    // Clean up widget configurations that reference this deleted item
    WidgetConfigManager.cleanupDeletedItemReferences(id, 'budget')
  }

  const handleClearSavedBudgets = () => {
    // Check if user has save permissions before clearing
    if (!hasFeatureAccess('saveData')) {
      console.warn('Clear blocked: User does not have save permissions')
      return
    }

    // Clean up widget configurations for all budget items before clearing
    savedBudgets?.forEach(budget => {
      WidgetConfigManager.cleanupDeletedItemReferences(budget.id, 'budget')
    })

    clearAllBudgets()
  }

  const handleLoadBudget = (saved: BudgetData) => {
    loadBudget(saved)
    onLoad?.(saved)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 gradient-text"
          >
            Disney Budget Tracker
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-gray-600 mb-8"
          >
            Keep track of your Disney vacation expenses and stay within budget for the most magical trip ever!
          </motion.p>

          {/* Editable name for widget editing */}
          {widgetId && isEditMode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              {isEditingName ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={handleNameChange}
                  onBlur={handleNameBlur}
                  onKeyDown={handleNameKeyDown}
                  placeholder="Enter budget name..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-disney-blue text-center text-lg font-medium"
                  style={{ minWidth: '300px' }}
                  autoFocus
                />
              ) : (
                <button
                  onClick={handleNameEdit}
                  className="px-4 py-2 text-center text-lg font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  style={{ minWidth: '300px' }}
                >
                  {name || 'Click to enter budget name...'}
                </button>
              )}
            </motion.div>
          )}
        </div>

        {/* Budget Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <StatCard
            title="Total Budget"
            value={budgetData.totalBudget}
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
        </motion.div>

        {/* Total Budget Progress */}
        {budgetData.totalBudget > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <BudgetProgress
              budget={budgetData.totalBudget}
              spent={getTotalSpent()}
              category="Overall Budget"
              currency="£"
            />
          </motion.div>
        )}

        {/* Total Budget Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 md:p-8 mb-8 shadow-xl border border-gray-100"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
            <Target className="w-6 h-6 md:w-8 md:h-8" />
            Set Total Budget
          </h3>

          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Trip Budget (£)</label>
            <div className="flex items-center">
              <span className="text-lg mr-2">£</span>
              <input
                type="number"
                value={budgetData.totalBudget || ''}
                onChange={(e) => setTotalBudget(parseFloat(e.target.value) || 0)}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-disney-blue text-lg"
                placeholder="0"
              />
            </div>
          </div>
        </motion.div>

        {/* Category Budgets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 md:p-8 mb-8 shadow-xl border border-gray-100"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3">
            💰 Budget by Category
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgetData.categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl md:text-3xl">{category.icon}</span>
                  <h4 className="font-semibold text-lg">{category.name}</h4>
                </div>

                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-2">Budget</label>
                  <div className="flex items-center">
                    <span className="text-sm mr-2">£</span>
                    <input
                      type="number"
                      value={category.budget || ''}
                      onChange={(e) => handleUpdateCategoryBudget(category.id, parseFloat(e.target.value) || 0)}
                      className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-disney-blue focus:border-disney-blue"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="mb-4">
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
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Expenses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl p-6 md:p-8 mb-8 shadow-xl border border-gray-100"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              💳 Expenses
            </h3>
            <button
              onClick={() => setShowAddExpense(true)}
              className="btn-disney flex items-center gap-2 transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Add Expense
            </button>
          </div>

          {budgetData.expenses.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h4 className="text-xl md:text-2xl font-semibold text-gray-600 mb-4">No expenses yet</h4>
              <p className="text-lg text-gray-500 mb-8">Start tracking your Disney spending!</p>
              <button
                onClick={() => setShowAddExpense(true)}
                className="btn-disney transform hover:scale-105 transition-all duration-200"
              >
                Add Your First Expense
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {budgetData.expenses
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((expense, index) => (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 md:p-6 bg-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] border border-gray-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${
                          budgetData.categories.find(c => c.id === expense.category)?.color || 'bg-gray-500'
                        }`}>
                          <span className={`text-sm md:text-base ${
                            getSafeTextColor(
                              colorMap[budgetData.categories.find(c => c.id === expense.category)?.color || 'bg-gray-500'] || '#6b7280'
                            )
                          }`}>
                            {budgetData.categories.find(c => c.id === expense.category)?.icon || '💰'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{expense.description}</h4>
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
                      <div className="flex items-center gap-4">
                        <span className="text-xl md:text-2xl font-bold">£{expense.amount.toFixed(2)}</span>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Add Expense Modal */}
        <Modal
          isOpen={budgetData.showAddExpense}
          onClose={() => setShowAddExpense(false)}
          title="Add Expense"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <Select
                value={budgetData.newExpense.category}
                onValueChange={(value) => setNewExpense({category: value})}
                options={categoryOptions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={budgetData.newExpense.description}
                onChange={(e) => setNewExpense({description: e.target.value})}
                placeholder="e.g., Park tickets, Hotel booking"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount (£)</label>
              <input
                type="number"
                value={budgetData.newExpense.amount}
                onChange={(e) => setNewExpense({amount: e.target.value})}
                placeholder="0.00"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={budgetData.newExpense.date}
                onChange={(e) => setNewExpense({date: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue"
              />
            </div>

            <Checkbox
              checked={budgetData.newExpense.isEstimate}
              onCheckedChange={(checked) => setNewExpense({isEstimate: Boolean(checked)})}
              label="This is an estimate"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleAddExpense} className="btn-disney flex-1">
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
          transition={{ delay: 1.0 }}
          className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-gray-100"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3">
            <PiggyBank className="w-6 h-6 md:w-8 md:h-8 text-disney-gold" />
            💡 Money-Saving Tips for Disney
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 }}
                className="p-4 md:p-6 bg-green-50 rounded-xl border border-green-200"
              >
                <h4 className="font-semibold text-green-800 mb-3 text-lg">🍔 Dining</h4>
                <ul className="text-sm md:text-base text-green-700 space-y-2">
                  <li>• Bring snacks and water bottles</li>
                  <li>• Share meals - portions are huge!</li>
                  <li>• Look for character dining deals</li>
                  <li>• Use Disney dining plan if staying on-site</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
                className="p-4 md:p-6 bg-blue-50 rounded-xl border border-blue-200"
              >
                <h4 className="font-semibold text-blue-800 mb-3 text-lg">🎫 Tickets</h4>
                <ul className="text-sm md:text-base text-blue-700 space-y-2">
                  <li>• Buy multi-day tickets for better value</li>
                  <li>• Book in advance for discounts</li>
                  <li>• Consider park hopper carefully</li>
                  <li>• Check for seasonal promotions</li>
                </ul>
              </motion.div>
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 }}
                className="p-4 md:p-6 bg-purple-50 rounded-xl border border-purple-200"
              >
                <h4 className="font-semibold text-purple-800 mb-3 text-lg">🛍️ Shopping</h4>
                <ul className="text-sm md:text-base text-purple-700 space-y-2">
                  <li>• Set a souvenir budget per person</li>
                  <li>• Buy Disney items before your trip</li>
                  <li>• Ship purchases home to save space</li>
                  <li>• Look for Disney outlet stores nearby</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4 }}
                className="p-4 md:p-6 bg-orange-50 rounded-xl border border-orange-200"
              >
                <h4 className="font-semibold text-orange-800 mb-3 text-lg">🏨 Accommodation</h4>
                <ul className="text-sm md:text-base text-orange-700 space-y-2">
                  <li>• Stay off-site for budget savings</li>
                  <li>• Book with kitchen for meal prep</li>
                  <li>• Consider value Disney resorts</li>
                  <li>• Split costs with family/friends</li>
                </ul>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}