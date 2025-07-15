'use client'

import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import WidgetBase, { type WidgetSize } from './WidgetBase'
import { PluginRegistry, PluginStorage } from '@/lib/pluginSystem'
import { WidgetConfigManager } from '@/lib/widgetConfig'
import '@/plugins' // Import all plugins to register them

interface BudgetWidgetProps {
  id: string
  width?: string
  onRemove: () => void
  onSettings?: () => void
  onWidthChange?: (width: string) => void
  onItemSelect?: (itemId: string | null) => void
}

interface Expense {
  id: string
  category: string
  amount: number
  description: string
  date: string
}

export default function BudgetWidget({
  id,
  width,
  onRemove,
  onSettings,
  onWidthChange,
  onItemSelect
}: BudgetWidgetProps) {
  const [selectedBudget, setSelectedBudget] = useState<any>(null)
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([])

  useEffect(() => {
    // Load selected budget data from plugin
    const budgetPlugin = PluginRegistry.getPlugin('budget')
    if (budgetPlugin) {
      // Get the widget configuration to see if a specific item is selected
      const widgetConfig = WidgetConfigManager.getConfig(id)
      const selectedItemId = widgetConfig?.selectedItemId

      let budget
      if (selectedItemId) {
        // Load the specific selected budget
        budget = budgetPlugin.getItem(selectedItemId)
      } else {
        // Load live/default data
        budget = budgetPlugin.getWidgetData(id)
      }

      setSelectedBudget(budget)

      if (budget?.expenses) {
        // Get recent expenses (last 5)
        const sortedExpenses = budget.expenses
          .sort((a: any, b: any) => {
            const dateA = new Date(a.date)
            const dateB = new Date(b.date)
            // Handle invalid dates by putting them at the end
            if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0
            if (isNaN(dateA.getTime())) return 1
            if (isNaN(dateB.getTime())) return -1
            return dateB.getTime() - dateA.getTime()
          })
          .slice(0, 5)
        setRecentExpenses(sortedExpenses)
      } else {
        setRecentExpenses([])
      }
    }
  }, [id])

  // Watch for changes in widget configuration
  useEffect(() => {
    const checkForUpdates = () => {
      const budgetPlugin = PluginRegistry.getPlugin('budget')
      if (budgetPlugin) {
        const widgetConfig = WidgetConfigManager.getConfig(id)
        const selectedItemId = widgetConfig?.selectedItemId

        let budget
        if (selectedItemId) {
          budget = budgetPlugin.getItem(selectedItemId)
        } else {
          budget = budgetPlugin.getWidgetData(id)
        }

        setSelectedBudget(budget)

        if (budget?.expenses) {
          const sortedExpenses = budget.expenses
            .sort((a: any, b: any) => {
              const dateA = new Date(a.date)
              const dateB = new Date(b.date)
              // Handle invalid dates by putting them at the end
              if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0
              if (isNaN(dateA.getTime())) return 1
              if (isNaN(dateB.getTime())) return -1
              return dateB.getTime() - dateA.getTime()
            })
            .slice(0, 5)
          setRecentExpenses(sortedExpenses)
        } else {
          setRecentExpenses([])
        }
      }
    }

    // Check immediately
    checkForUpdates()

    // Set up an interval to check for updates
    const interval = setInterval(checkForUpdates, 1000)
    return () => clearInterval(interval)
  }, [id])

  const handleItemSelect = (itemId: string | null) => {
    // Update the widget configuration
    WidgetConfigManager.updateConfig(id, { selectedItemId: itemId || undefined })

    // Call the parent callback if provided
    if (onItemSelect) {
      onItemSelect(itemId)
    }
  }

  const calculateBudgetStats = () => {
    if (!selectedBudget) return { spent: 0, remaining: 0, percentage: 0 }

    const totalBudget = selectedBudget.totalBudget || 0
    const totalSpent = selectedBudget.expenses?.reduce((sum: number, expense: any) => sum + expense.amount, 0) || 0
    const remaining = totalBudget - totalSpent
    const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

    return { spent: totalSpent, remaining, percentage }
  }

  const getExpensesToShow = () => {
    // Determine max expenses based on width
    const maxExpenses = width === '1' ? 2 : width === '2' ? 3 : 5
    return recentExpenses.slice(0, maxExpenses)
  }

  const renderBudget = () => {
    if (!selectedBudget) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center p-2">
          <Wallet className="w-10 h-10 text-gray-300 mb-3" />
          <h3 className="text-base font-medium text-gray-600 mb-1">No Budget Selected</h3>
          <p className="text-xs text-gray-500 mb-3 max-w-[200px]">
            Create a new budget or select one from settings
          </p>
          <button
            onClick={() => window.location.href = `/budget/new?widgetId=${id}`}
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
          >
            Create New
          </button>
        </div>
      )
    }

    const { spent, remaining, percentage } = calculateBudgetStats()
    const expensesToShow = getExpensesToShow()

    return (
      <div className="h-full flex flex-col">
        {/* Budget Overview */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 mb-1 truncate">{selectedBudget.name}</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Budget Progress</span>
            <span className="text-xs font-medium text-gray-700">{percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                percentage > 90 ? 'bg-red-500' : percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Budget Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">Remaining</span>
            </div>
            <div className="text-lg font-bold text-green-800">
              ${remaining.toFixed(2)}
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-3 border border-red-100">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-xs font-medium text-red-700">Spent</span>
            </div>
            <div className="text-lg font-bold text-red-800">
              ${spent.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Recent Expenses */}
        {expensesToShow.length > 0 && (
          <div className="flex-1">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Recent Expenses</h4>
            <div className="space-y-2">
              {expensesToShow.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-800 truncate">
                        {expense.description}
                      </span>
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {expense.category}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {(() => {
                        const date = new Date(expense.date)
                        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString()
                      })()}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">
                    -${expense.amount.toFixed(2)}
                  </span>
                </div>
              ))}
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
      iconColor="bg-gradient-to-r from-green-500 to-emerald-500"
      widgetType="budget"
      size="medium"
      width={width}
      selectedItemId={selectedBudget?.id}
      onRemove={onRemove}
      onWidthChange={onWidthChange}
      onItemSelect={handleItemSelect}
    >
      {renderBudget()}
    </WidgetBase>
  )
}