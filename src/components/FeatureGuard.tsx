'use client'

import { ReactNode, useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Crown, ArrowUp, Check, Star, DollarSign, Calendar, Clock } from 'lucide-react'
import { useReduxUser } from '@/hooks/useReduxUser'
import { Button, Modal, Badge } from '@/components/ui'

interface FeatureGuardProps {
  feature?: string
  requiredLevel?: 'anon' | 'standard' | 'premium' | 'admin'
  children: ReactNode
  fallback?: ReactNode
  showUpgradePrompt?: boolean
}

export default function FeatureGuard({
  feature,
  requiredLevel,
  children,
  fallback,
  showUpgradePrompt = true
}: FeatureGuardProps) {
  const { user, userLevel, getUpgradeFeatures, upgradeToStandard, upgradeToPremium, createAnonUser, hasFeatureAccess, hasLevelAccess } = useReduxUser()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  // Determine access based on feature or required level
  let hasAccess = false
  if (feature) {
    hasAccess = hasFeatureAccess(feature)
  } else if (requiredLevel) {
    hasAccess = hasLevelAccess(requiredLevel)
  } else {
    // If neither feature nor requiredLevel is provided, allow access
    hasAccess = true
  }

  const handleUpgradeToStandard = async () => {
    if (!email.trim()) return

    try {
      // Ensure we have a user before attempting to upgrade
      if (!user) {
        console.log('[Debug] No user found, creating anonymous user first')
        await createAnonUser()
      }

      // Now upgrade to standard
      await upgradeToStandard(email.trim(), name.trim() || undefined)
      setShowLoginModal(false)
      setEmail('')
      setName('')
    } catch (error) {
      console.error('Failed to upgrade to standard:', error)
    }
  }

  const handleUpgradeToPremium = async () => {
    try {
      // Ensure we have a user before attempting to upgrade
      if (!user) {
        console.log('[Debug] No user found, creating anonymous user first')
        await createAnonUser()
      }

      // Now upgrade to premium
      await upgradeToPremium()
      setShowUpgradeModal(false)
    } catch (error) {
      console.error('Failed to upgrade to premium:', error)
    }
  }

  // If user has access, render children
  if (hasAccess) {
    return <>{children}</>
  }

  // If fallback is provided, render it
  if (fallback) {
    return <>{fallback}</>
  }

  // Determine the appropriate upgrade message based on current user level and required access
  const getUpgradeMessage = () => {
    if (userLevel === 'anon') {
      return {
        title: 'Create Free Account',
        description: 'Sign up for a free account to access this feature.',
        buttonText: 'Sign Up Free',
        icon: <ArrowUp className="w-4 h-4 mr-2" />
      }
    } else if (userLevel === 'standard' && requiredLevel === 'premium') {
      return {
        title: 'Premium Feature',
        description: 'Upgrade to premium to access all functionality.',
        buttonText: 'Upgrade to Premium',
        icon: <Crown className="w-4 h-4 mr-2" />
      }
    } else {
      return {
        title: 'Upgrade Required',
        description: 'Upgrade your account to access this feature.',
        buttonText: 'Upgrade Now',
        icon: <ArrowUp className="w-4 h-4 mr-2" />
      }
    }
  }

  const upgradeMessage = getUpgradeMessage()

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
              {upgradeMessage.title}
            </h3>
            <p className="text-gray-600 mb-4 text-sm">
              {upgradeMessage.description}
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
                {upgradeMessage.icon}
                {upgradeMessage.buttonText}
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Login Modal for Anonymous Users */}
      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Create Free Account"
      >
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mb-4">
              <ArrowUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Unlock More Features
            </h3>
            <p className="text-gray-600">
              Create a free account to save your data, create multiple items, and export your plans.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name (Optional)
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleUpgradeToStandard}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
            >
              <Check className="w-4 h-4 mr-2" />
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

      {/* Upgrade Modal for Standard Users */}
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
            {getUpgradeFeatures().map((feature) => (
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