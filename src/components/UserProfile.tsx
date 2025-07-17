'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Crown, Star, ArrowUp, LogOut, Settings, Mail, User as UserIcon, Shield } from 'lucide-react'
import { useReduxUser } from '@/hooks/useReduxUser'
import { UserLevel } from '@/lib/userManagement'
import { Button, Modal, Badge, Card } from '@/components/ui'

export default function UserProfile() {
  const { user, isLoggedIn, isPremium, isStandard, userLevel, getUpgradeFeatures, logout, upgradeToStandard, upgradeToPremium, upgradeToAdmin, createAnonUser } = useReduxUser()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  const getLevelIcon = () => {
    switch (userLevel) {
      case UserLevel.ADMIN:
        return <Shield className="w-5 h-5 text-red-500" />
      case UserLevel.PREMIUM:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case UserLevel.STANDARD:
        return <Star className="w-5 h-5 text-blue-500" />
      default:
        return <UserIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getLevelColor = () => {
    switch (userLevel) {
      case UserLevel.ADMIN:
        return 'from-red-400 to-red-600'
      case UserLevel.PREMIUM:
        return 'from-yellow-400 to-orange-500'
      case UserLevel.STANDARD:
        return 'from-blue-400 to-purple-500'
      default:
        return 'from-gray-400 to-gray-600'
    }
  }

  const getLevelName = () => {
    switch (userLevel) {
      case UserLevel.ADMIN:
        return 'Admin'
      case UserLevel.PREMIUM:
        return 'Premium'
      case UserLevel.STANDARD:
        return 'Standard'
      default:
        return 'Anonymous'
    }
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
      // You could add a toast notification or error state here
      // For now, we'll just log the error
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
      // You could add a toast notification or error state here
    }
  }

  const handleUpgradeToAdmin = async () => {
    try {
      // Ensure we have a user before attempting to upgrade
      if (!user) {
        console.log('[Debug] No user found, creating anonymous user first')
        await createAnonUser()
      }

      // Now upgrade to admin
      await upgradeToAdmin()
    } catch (error) {
      console.error('Failed to upgrade to admin:', error)
      // You could add a toast notification or error state here
    }
  }

  return (
    <>
      <Card className="p-6 bg-white/80 backdrop-blur-sm border border-white/20" data-testid="user-profile">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full bg-gradient-to-r ${getLevelColor()} text-white`}>
            {getLevelIcon()}
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-800" data-testid="user-name">
                {user?.name || 'Anonymous User'}
              </h3>
              <Badge variant={userLevel === UserLevel.PREMIUM ? 'premium' : userLevel === UserLevel.STANDARD ? 'primary' : 'default'} data-testid="user-level-badge">
                {getLevelName()}
              </Badge>
            </div>

            {user?.email && (
              <p className="text-sm text-gray-600 flex items-center space-x-1">
                <Mail className="w-3 h-3" />
                <span>{user.email}</span>
              </p>
            )}

            <p className="text-xs text-gray-500">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {!isLoggedIn && (
            <Button
              onClick={() => setShowLoginModal(true)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
              data-testid="sign-up-button"
            >
              <Mail className="w-4 h-4 mr-2" />
              Sign Up for Free
            </Button>
          )}

          {isStandard && !isPremium && (
            <Button
              onClick={() => setShowUpgradeModal(true)}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          )}

          {/* Admin upgrade button for testing */}
          {process.env.NODE_ENV === 'development' && (
            <Button
              onClick={handleUpgradeToAdmin}
              className="w-full bg-gradient-to-r from-red-400 to-red-600 text-white hover:from-red-500 hover:to-red-700"
            >
              <Shield className="w-4 h-4 mr-2" />
              Upgrade to Admin (Dev)
            </Button>
          )}

          {isLoggedIn && (
            <Button
              onClick={logout}
              variant="outline"
              className="w-full text-gray-600 hover:text-red-600"
              data-testid="logout-button"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          )}
        </div>
      </Card>

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
              data-testid="email-input"
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
              data-testid="name-input"
            />
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleUpgradeToStandard}
              disabled={!email.trim()}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              data-testid="create-account-button"
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