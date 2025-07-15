'use client'

import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, Crown } from 'lucide-react'
import WidgetBase, { type WidgetSize } from './WidgetBase'
import { WidgetConfigManager, type SavedBudget } from '@/lib/widgetConfig'

interface BudgetWidgetProps {
  id: string
  width?: string
  onRemove: () => void
  onSettings?: () => void
  onWidthChange?: (width: string) => void
  onItemSelect?: (itemId: string | null) => void
}

interface BudgetCategory {
  id: string
  name: string
  budget: number
  color: string
  icon: string
}

interface Expense {
  id: string
  category: string
  description: string
  amount: number
  date: string
  isEstimate: boolean
}

export default function BudgetWidget({
  id,
  width,
  onRemove,
  onSettings,
  onWidthChange,
  onItemSelect
}: BudgetWidgetProps) {
  const [config, setConfig] = useState<{ size: WidgetSize; selectedItemId?: string } | null>(null)
  const [selectedBudget, setSelectedBudget] = useState<SavedBudget | null>(null)
  const [totalSpent, setTotalSpent] = useState(0)

  useEffect(() => {
    // Load widget config
    const widgetConfig = WidgetConfigManager.getConfig(id)
    if (widgetConfig) {
      setConfig({ size: widgetConfig.size, selectedItemId: widgetConfig.selectedItemId })
    } else {
      // Default config
      const defaultConfig = { size: 'medium' as WidgetSize, selectedItemId: undefined }
      setConfig(defaultConfig)
      WidgetConfigManager.addConfig({
        id,
        type: 'budget',
        size: 'medium',
        order: 0,
        selectedItemId: undefined,
        settings: {}
      })
    }
  }, [id])

  useEffect(() => {
    // Load selected budget data
    if (config?.selectedItemId) {
      // Validate that the selected item still exists
      const itemExists = WidgetConfigManager.validateAndCleanupItemReference(id, 'budget', config.selectedItemId)

      if (itemExists) {
        const budget = WidgetConfigManager.getSelectedItemData('budget', config.selectedItemId) as SavedBudget
        setSelectedBudget(budget)
        const spent = budget.expenses.reduce((sum, expense) => sum + expense.amount, 0)
        setTotalSpent(spent)
      } else {
        // Item was deleted, update local config and fallback to live state
        setConfig(prev => prev ? { ...prev, selectedItemId: undefined } : { size: 'medium', selectedItemId: undefined })

        const currentState = WidgetConfigManager.getCurrentBudgetState()
        if (currentState && (currentState.totalBudget > 0 || currentState.expenses.length > 0)) {
          const liveBudget: SavedBudget = {
            id: 'live',
            name: 'Current Budget',
            totalBudget: currentState.totalBudget,
            categories: currentState.categories,
            expenses: currentState.expenses,
            createdAt: new Date().toISOString(),
            updatedAt: currentState.updatedAt || new Date().toISOString()
          }
          setSelectedBudget(liveBudget)
          const spent = currentState.expenses.reduce((sum: number, expense: any) => sum + expense.amount, 0)
          setTotalSpent(spent)
        } else {
          setSelectedBudget(null)
          setTotalSpent(0)
        }
      }
    } else {
      // No item selected, show empty state
      setSelectedBudget(null)
      setTotalSpent(0)
    }
  }, [config, id])



  const handleItemSelect = (itemId: string | null) => {
    WidgetConfigManager.updateConfig(id, { selectedItemId: itemId || undefined })
    setConfig(prev => prev ? { ...prev, selectedItemId: itemId || undefined } : { size: 'medium', selectedItemId: itemId || undefined })
  }

  if (!config) {
    return <div>Loading...</div>
  }

  const { size } = config

  const isPremiumUser = () => {
    // This would check actual subscription status
    return true
  }

  const getTopCategories = () => {
    if (!selectedBudget) return []

    const categorySpending = selectedBudget.categories.map(cat => {
      const categoryExpenses = selectedBudget.expenses
        .filter(expense => expense.category === cat.id)
        .reduce((sum, expense) => sum + expense.amount, 0)

      return {
        name: cat.name,
        budget: cat.budget,
        spent: categoryExpenses,
        color: cat.color
      }
    })

    return categorySpending
      .sort((a, b) => b.spent - a.spent)
      .slice(0, size === 'small' ? 2 : size === 'medium' ? 3 : 5)
  }

  const renderBudget = () => {
    if (!isPremiumUser()) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center relative">
          <div className="absolute top-2 right-2">
            <Crown className="w-6 h-6 text-yellow-500" />
          </div>
          <DollarSign className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Premium Feature</h3>
          <p className="text-sm text-gray-500 mb-4">
            Upgrade to Premium to access budget tracking
          </p>
          <button className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg hover:shadow-lg transition-all text-sm">
            Upgrade to Premium
          </button>
        </div>
      )
    }

    if (!selectedBudget) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center p-2">
          <DollarSign className="w-10 h-10 text-gray-300 mb-3" />
          <h3 className="text-base font-medium text-gray-600 mb-1">No Budget Selected</h3>
          <p className="text-xs text-gray-500 mb-3 max-w-[200px]">
            Create a new budget or select one from settings
          </p>
          <button
            onClick={() => window.location.href = `/budget/new?widgetId=${id}`}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
          >
            Create New
          </button>
        </div>
      )
    }

    const spentPercentage = selectedBudget.totalBudget > 0 ? (totalSpent / selectedBudget.totalBudget) * 100 : 0
    const remaining = selectedBudget.totalBudget - totalSpent
    const topCategories = getTopCategories()

    return (
      <div className="h-full flex flex-col">
        {/* Header with budget name */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 text-sm truncate mb-2">
            {selectedBudget.name}
          </h3>

          {/* Budget overview */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                ${selectedBudget.totalBudget.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Total Budget</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                ${totalSpent.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Spent</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                spentPercentage > 90 ? 'bg-red-500' :
                spentPercentage > 75 ? 'bg-yellow-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(spentPercentage, 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>{spentPercentage.toFixed(0)}% used</span>
            <span className={remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
              ${Math.abs(remaining).toLocaleString()} {remaining >= 0 ? 'left' : 'over'}
            </span>
          </div>
        </div>

        {/* Category breakdown */}
        {size !== 'small' && topCategories.length > 0 && (
          <div className="flex-1 overflow-hidden">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Top Categories</h4>
            <div className="space-y-2">
              {topCategories.map((category, index) => {
                const percentage = category.budget > 0 ? (category.spent / category.budget) * 100 : 0
                return (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="truncate">{category.name}</span>
                    </div>
                    <div className="text-right ml-2">
                      <div className="font-medium">
                        ${category.spent.toLocaleString()}
                      </div>
                      <div className="text-gray-500">
                        /{category.budget.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <WidgetBase
      id={id}
      title="Budget Tracker"
      icon={DollarSign}
      iconColor="bg-gradient-to-r from-disney-gold to-disney-orange"
      widgetType="budget"
      size={size}
      width={width}
      selectedItemId={config.selectedItemId}
      isPremium={true}
      onRemove={onRemove}
      onWidthChange={onWidthChange}
      onItemSelect={handleItemSelect}
    >
      {renderBudget()}
    </WidgetBase>
  )
}