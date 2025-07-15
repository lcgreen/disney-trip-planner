'use client'

import { motion } from 'framer-motion'
import { Package } from 'lucide-react'
import PackingChecklist from '@/components/PackingChecklist'

export default function PackingPage() {
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
          <div className="bg-gradient-to-r from-disney-green to-disney-teal p-6 text-white">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-3 rounded-full">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Disney Packing Checklist</h1>
                <p className="text-green-100 mt-1">
                  Never forget the essentials with our Disney-optimized packing lists
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <PackingChecklist />
          </div>
        </motion.div>
      </div>
    </div>
  )
}