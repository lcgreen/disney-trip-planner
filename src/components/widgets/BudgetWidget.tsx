'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, Settings, Crown } from 'lucide-react'
import Link from 'next/link'
import { PremiumBadge } from '@/components/ui'
import WidgetBase, { WidgetSize } from './WidgetBase'

interface BudgetWidgetProps {
  size?: WidgetSize
  onRemove?: () => void
  onSettings?: () => void
  onSizeChange?: (size: WidgetSize) => void
}

interface BudgetData {
  total: number
  spent: number
  remaining: number
  categories: {
    accommodation: number
    food: number
    tickets: number
    souvenirs: number
  }
}

export default function BudgetWidget({ size = 'medium', onRemove, onSettings, onSizeChange }: BudgetWidgetProps) {
  const [budget, setBudget] = useState<BudgetData>({
    total: 3000,
    spent: 1250,
    remaining: 1750,
    categories: {
      accommodation: 800,
      food: 200,
      tickets: 150,
      souvenirs: 100
    }
  })

  const isPremiumUser = () => {
    // This would check actual subscription status
    return true
  }

  const spentPercentage = (budget.spent / budget.total) * 100

  if (!isPremiumUser()) {
    return (
      <WidgetBase
        id="budget"
        title="Budget"
        icon={DollarSign}
        iconColor="bg-gradient-to-br from-disney-gold to-disney-orange"
        size={size}
        isPremium={true}
        onRemove={onRemove}
        onSettings={onSettings}
        onSizeChange={onSizeChange}
        className="bg-gradient-to-br from-disney-gold/10 to-disney-orange/10 border-disney-gold/20"
      >
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Crown className="w-12 h-12 text-disney-gold mb-4" />
          <p className="text-sm text-gray-600 mb-4">
            Upgrade to Premium to track your budget
          </p>
          <button className="btn-premium text-xs py-2 px-4">
            Upgrade Now
          </button>
        </div>
      </WidgetBase>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 h-full"
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-br from-disney-gold to-disney-orange p-2 rounded-lg">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
            <span>Budget</span>
            <PremiumBadge />
          </h3>
        </div>

        <div className="flex items-center space-x-1">
          {onSettings && (
            <button
              onClick={onSettings}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1 text-gray-400 hover:text-red-500 rounded"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Budget Overview */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Spent</span>
          <span className="text-sm font-medium">${budget.spent} / ${budget.total}</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              spentPercentage > 80
                ? 'bg-gradient-to-r from-red-400 to-red-500'
                : spentPercentage > 60
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                : 'bg-gradient-to-r from-disney-gold to-disney-orange'
            }`}
            style={{ width: `${Math.min(spentPercentage, 100)}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>{spentPercentage.toFixed(1)}% used</span>
          <span>${budget.remaining} left</span>
        </div>
      </div>

      {/* Top Categories */}
      <div className="space-y-2 mb-3">
        <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Top Spending</h4>
        {Object.entries(budget.categories)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 2)
          .map(([category, amount]) => (
            <div key={category} className="flex justify-between items-center">
              <span className="text-sm capitalize">{category}</span>
              <span className="text-sm font-medium text-disney-gold">${amount}</span>
            </div>
          ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <Link
          href="/budget"
          className="w-full bg-gradient-to-r from-disney-gold to-disney-orange text-white text-sm py-2 px-3 rounded-lg hover:shadow-md transition-all duration-200 text-center block"
        >
          View Full Budget
        </Link>
      </div>
    </motion.div>
  )
}