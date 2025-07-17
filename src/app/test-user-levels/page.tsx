'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Star, User, Lock, Check, X, Shield } from 'lucide-react'
import { useReduxUser } from '@/hooks/useReduxUser'
import { UserLevel, FEATURES } from '@/lib/userManagement'
import { FeatureGuard } from '@/components/ui'
import UserProfile from '@/components/UserProfile'

export default function TestUserLevelsPage() {
  const { user, userLevel, getAvailableFeatures, getUpgradeFeatures, hasFeatureAccess } = useReduxUser()
  const [selectedFeature, setSelectedFeature] = useState<string>('')

  const getLevelIcon = (level: UserLevel) => {
    switch (level) {
      case UserLevel.ADMIN:
        return <Shield className="w-5 h-5 text-red-500" />
      case UserLevel.PREMIUM:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case UserLevel.STANDARD:
        return <Star className="w-5 h-5 text-blue-500" />
      default:
        return <User className="w-5 h-5 text-gray-500" />
    }
  }

  const getLevelColor = (level: UserLevel) => {
    switch (level) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold gradient-text mb-4">
            User Level System Test
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Test the user level system with different access levels: Anonymous, Standard, Premium, and Admin.
            Each level provides different features and capabilities.
          </p>
        </motion.div>

        {/* User Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Current User</h2>
          <UserProfile />
        </motion.div>

        {/* Feature Access Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Feature Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(FEATURES).map(([key, feature]) => {
              const hasAccess = hasFeatureAccess(key)
              return (
                <div
                  key={key}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                    hasAccess
                      ? 'border-green-200 bg-green-50 hover:border-green-300'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  } ${selectedFeature === key ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setSelectedFeature(key)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {hasAccess ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <X className="w-5 h-5 text-red-500" />
                      )}
                      <span className="font-medium text-gray-800 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                    <div className={`p-1 rounded-full bg-gradient-to-r ${getLevelColor(feature.level)} text-white`}>
                      {getLevelIcon(feature.level)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Required: {feature.level}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      hasAccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {hasAccess ? 'Access' : 'Locked'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Feature Guard Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Feature Guard Demo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Premium Feature Demo */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Premium Feature (Trip Planner)</h3>
              <FeatureGuard feature="tripPlanner" requiredLevel="premium">
                <div className="p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">Advanced Trip Planning</h4>
                  <p className="text-purple-700 text-sm">
                    This is the premium trip planner feature. You can see this content because you have premium access.
                  </p>
                  <div className="mt-4 p-3 bg-white/50 rounded border border-purple-200">
                    <p className="text-xs text-purple-600">
                      • Multi-day itinerary planning<br/>
                      • Advanced scheduling tools<br/>
                      • Priority attraction booking<br/>
                      • Custom route optimization
                    </p>
                  </div>
                </div>
              </FeatureGuard>
            </div>

            {/* Standard Feature Demo */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Standard Feature (Save Data)</h3>
              <FeatureGuard feature="saveData" requiredLevel="standard">
                <div className="p-6 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Data Persistence</h4>
                  <p className="text-blue-700 text-sm">
                    This is the standard save data feature. You can see this content because you have standard or premium access.
                  </p>
                  <div className="mt-4 p-3 bg-white/50 rounded border border-blue-200">
                    <p className="text-xs text-blue-600">
                      • Save multiple items<br/>
                      • Export data to file<br/>
                      • Cloud synchronization<br/>
                      • Data backup
                    </p>
                  </div>
                </div>
              </FeatureGuard>
            </div>
          </div>
        </motion.div>

        {/* Available Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Available Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {getAvailableFeatures().map((feature) => (
              <div key={feature.feature} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <Check className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-800 capitalize">
                    {feature.feature.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-sm text-green-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upgrade Features */}
        {getUpgradeFeatures().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upgrade to Unlock</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {getUpgradeFeatures().map((feature) => (
                <div key={feature.feature} className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <Lock className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-orange-800 capitalize">
                      {feature.feature.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-sm text-orange-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}