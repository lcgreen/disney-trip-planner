'use client'

import { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Lock, Sparkles, Star, ArrowRight, X } from 'lucide-react'
import { Badge } from './Badge'

interface PreviewOverlayProps {
  children: ReactNode
  title: string
  description: string
  feature: string
  isPreviewMode?: boolean
  onUpgrade?: () => void
  className?: string
}

export default function PreviewOverlay({
  children,
  title,
  description,
  feature,
  isPreviewMode = true,
  onUpgrade,
  className = ''
}: PreviewOverlayProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade()
    } else {
      window.location.href = '/upgrade'
    }
  }

  if (!isPreviewMode) {
    return <>{children}</>
  }

  return (
    <div className={`relative ${className}`}>
      {/* Preview content with transparency */}
      <div className="relative opacity-60 pointer-events-none select-none">
        {children}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/30 to-transparent pointer-events-none" />

      {/* Floating upgrade prompts */}
      {!isDismissed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg p-3 shadow-lg cursor-pointer hover:shadow-xl transition-all"
          onClick={() => setShowUpgradeModal(true)}
        >
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            <span className="text-sm font-medium">Upgrade to use</span>
          </div>
        </motion.div>
      )}

      {/* Central overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md mx-4 text-center pointer-events-auto"
        >
          {/* Premium icon */}
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            {description}
          </p>

          {/* Feature highlights */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 mb-6 border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Premium Features:</span>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1 text-left">
              <li className="flex items-center gap-2">
                <Star className="w-3 h-3 text-yellow-500" />
                Save and organize your data
              </li>
              <li className="flex items-center gap-2">
                <Star className="w-3 h-3 text-yellow-500" />
                Export and share your plans
              </li>
              <li className="flex items-center gap-2">
                <Star className="w-3 h-3 text-yellow-500" />
                Advanced analytics & insights
              </li>
              <li className="flex items-center gap-2">
                <Star className="w-3 h-3 text-yellow-500" />
                Priority support & updates
              </li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" />
              Upgrade Now
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Upgrade modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUpgradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Crown className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Unlock Premium Features
                </h2>

                <p className="text-gray-600 mb-6">
                  Get full access to all Disney planning tools and make your vacation planning effortless and magical!
                </p>

                {/* Pricing preview */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 mb-6 border border-yellow-200">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-yellow-800">$9.99</div>
                    <div className="text-sm text-yellow-600">per month</div>
                  </div>
                  <div className="text-xs text-yellow-700">
                    30-day money-back guarantee
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleUpgrade}
                    className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    Start Premium Trial
                  </button>
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}