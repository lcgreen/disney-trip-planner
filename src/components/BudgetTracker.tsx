'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, PlusCircle, Trash2, Target, TrendingUp, PiggyBank } from 'lucide-react'

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

const defaultCategories: BudgetCategory[] = [
  { id: 'tickets', name: 'Park Tickets', budget: 0, color: 'bg-blue-500', icon: '🎫' },
  { id: 'hotel', name: 'Accommodation', budget: 0, color: 'bg-green-500', icon: '🏨' },
  { id: 'dining', name: 'Dining & Food', budget: 0, color: 'bg-red-500', icon: '🍔' },
  { id: 'transport', name: 'Transportation', budget: 0, color: 'bg-yellow-500', icon: '✈️' },
  { id: 'shopping', name: 'Shopping & Souvenirs', budget: 0, color: 'bg-purple-500', icon: '🛍️' },
  { id: 'extras', name: 'Extras & Activities', budget: 0, color: 'bg-pink-500', icon: '🎪' },
]

export default function BudgetTracker() {
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

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4 gradient-text">Disney Budget Tracker</h2>
        <p className="text-gray-600 mb-6">
          Keep track of your Disney vacation expenses and stay within budget for the most magical trip ever!
        </p>
      </div>

      {/* Total Budget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-disney-gold to-disney-orange p-6 rounded-xl text-white mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Total Trip Budget</h3>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={totalBudget || ''}
                onChange={(e) => setTotalBudget(parseFloat(e.target.value) || 0)}
                placeholder="Enter total budget"
                className="bg-white text-gray-800 px-4 py-2 rounded-lg text-2xl font-bold w-48"
              />
              <span className="text-2xl">£</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Spent</div>
            <div className="text-3xl font-bold">£{getTotalSpent().toFixed(2)}</div>
            <div className="text-sm opacity-90">
              Remaining: £{getRemainingBudget().toFixed(2)}
            </div>
          </div>
        </div>

        {totalBudget > 0 && (
          <div className="mt-4">
            <div className="bg-white bg-opacity-20 rounded-full h-3">
              <div
                className="bg-white rounded-full h-3 transition-all duration-500"
                style={{ width: `${Math.min((getTotalSpent() / totalBudget) * 100, 100)}%` }}
              />
            </div>
            <div className="text-sm mt-2 opacity-90">
              {((getTotalSpent() / totalBudget) * 100).toFixed(1)}% of budget used
            </div>
          </div>
        )}
      </motion.div>

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
                <div className="flex justify-between text-sm mb-1">
                  <span>Spent: £{getCategorySpent(category.id).toFixed(2)}</span>
                  <span>{getCategoryProgress(category.id).toFixed(1)}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className={`${category.color} rounded-full h-2 transition-all duration-500`}
                    style={{ width: `${Math.min(getCategoryProgress(category.id), 100)}%` }}
                  />
                </div>
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
            <PlusCircle className="w-5 h-5" />
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
                    <span className="text-white text-sm">
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
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                            Estimate
                          </span>
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
      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-4">Add Expense</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isEstimate"
                  checked={newExpense.isEstimate}
                  onChange={(e) => setNewExpense({...newExpense, isEstimate: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isEstimate" className="text-sm text-gray-700">
                  This is an estimate
                </label>
              </div>
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
          </motion.div>
        </div>
      )}

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
    </div>
  )
}