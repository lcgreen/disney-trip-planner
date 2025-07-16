'use client'

import { motion } from 'framer-motion'
import { Crown, Lock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface PremiumRestrictionProps {
  feature: string
  description: string
  icon?: React.ReactNode
  gradient?: string
}

export default function PremiumRestriction({
  feature,
  description,
  icon = <Crown className="w-12 h-12" />,
  gradient = "from-yellow-400 to-orange-500"
}: PremiumRestrictionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center"
      >
        {/* Icon */}
        <div className={`w-20 h-20 bg-gradient-to-r ${gradient} rounded-full flex items-center justify-center mx-auto mb-6`}>
          <div className="text-white">
            {icon}
          </div>
        </div>

        {/* Lock Icon */}
        <div className="absolute top-4 right-4">
          <Lock className="w-6 h-6 text-gray-400" />
        </div>

        {/* Content */}
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Premium Feature
        </h1>

        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          {feature}
        </h2>

        <p className="text-gray-600 mb-6 leading-relaxed">
          {description}
        </p>

        {/* Benefits */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 mb-6 border border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-2">What you'll get:</h3>
          <ul className="text-sm text-yellow-700 space-y-1 text-left">
            <li>• Full access to all planning tools</li>
            <li>• Save and sync your data</li>
            <li>• Export your plans</li>
            <li>• Priority support</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/upgrade'}
            className={`w-full bg-gradient-to-r ${gradient} text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
          >
            Upgrade to Premium
          </button>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center w-full py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        {/* Demo Note */}
        <p className="text-xs text-gray-500 mt-4">
          You can still see this feature in action on the dashboard with demo data
        </p>
      </motion.div>
    </div>
  )
}