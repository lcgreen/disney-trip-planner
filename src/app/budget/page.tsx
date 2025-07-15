'use client'

import { motion } from 'framer-motion'
import { DollarSign, Crown } from 'lucide-react'
import BudgetTracker from '@/components/BudgetTracker'
import { PremiumBadge } from '@/components/ui'

export default function BudgetPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-disney-gold to-disney-orange p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <DollarSign className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold flex items-center space-x-3">
                    <span>Disney Budget Tracker</span>
                    <PremiumBadge />
                  </h1>
                  <p className="text-orange-100 mt-1">
                    Keep track of your Disney spending and stay within your magical budget
                  </p>
                </div>
              </div>
              <Crown className="w-10 h-10 text-yellow-200" />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <BudgetTracker />
          </div>
        </motion.div>
      </div>
    </div>
  )
}