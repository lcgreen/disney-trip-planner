'use client'

import { ReactNode, useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Crown, ArrowUp, Check, Star, DollarSign, Calendar, Clock } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { hasFeatureAccess } from '@/lib/userManagement'
import { Button, Modal, Badge } from '@/components/ui'

interface FeatureGuardProps {
  feature: string
  children: ReactNode
  fallback?: ReactNode
  showUpgradePrompt?: boolean
  requiredLevel?: 'anon' | 'standard' | 'premium'
}

export default function FeatureGuard({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  requiredLevel
}: FeatureGuardProps) {
  const { userLevel, upgradeFeatures, upgradeToStandard, upgradeToPremium } = useUser()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  const hasAccess = hasFeatureAccess(feature)

  const handleUpgradeToStandard = () => {
    if (!email.trim()) return
    upgradeToStandard(email.trim(), name.trim() || undefined)
    setShowLoginModal(false)
    setEmail('')
    setName('')
  }

  const handleUpgradeToPremium = () => {
    upgradeToPremium()
    setShowUpgradeModal(false)
  }

  // If user has access, render children
  if (hasAccess) {
    return <>{children}</>
  }

  // If fallback is provided, render it
  if (fallback) {
    return <>{fallback}</>
  }

    // Default locked state
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative group"
      >
        {/* Show the original interface with minimal opacity reduction */}
        <div className="opacity-80 pointer-events-none">
          {children}
        </div>

        {/* Very transparent overlay with floating upgrade prompt */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] rounded-lg border-2 border-dashed border-gray-300">
          {/* Floating upgrade prompt in top-right corner */}
          <div className="absolute top-4 right-4 text-center p-4 max-w-sm bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full mb-4">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {requiredLevel === 'premium' ? 'Premium Feature' : 'Upgrade Required'}
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              {requiredLevel === 'premium'
                ? 'Upgrade to access all functionality.'
                : 'Create a free account to access this feature.'
              }
            </p>

            {showUpgradePrompt && (
              <Button
                onClick={() => {
                  if (userLevel === 'anon') {
                    setShowLoginModal(true)
                  } else {
                    setShowUpgradeModal(true)
                  }
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 px-6 py-2 text-sm"
              >
                <ArrowUp className="w-4 h-4 mr-2" />
                {userLevel === 'anon' ? 'Sign Up Free' : 'Upgrade Now'}
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Login Modal */}
      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Create Free Account"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Create a free account to save your data and access more features.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your Name"
            />
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleUpgradeToStandard}
              disabled={!email.trim()}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white"
            >
              Create Account
            </Button>
            <Button
              onClick={() => setShowLoginModal(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Premium Upgrade Modal */}
      <Modal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Upgrade to Premium"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Unlock Premium Features
            </h3>
            <p className="text-gray-600">
              Get access to advanced planning tools, unlimited storage, and priority support.
            </p>
          </div>

          <div className="space-y-3">
            {upgradeFeatures.map((feature) => (
              <div key={feature.feature} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <ArrowUp className="w-5 h-5 text-green-500" />
                <div>
                  <h4 className="font-medium text-gray-800 capitalize">
                    {feature.feature.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleUpgradeToPremium}
              className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
            <Button
              onClick={() => setShowUpgradeModal(false)}
              variant="outline"
              className="flex-1"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}