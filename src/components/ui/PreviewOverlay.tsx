'use client'

import { ReactNode, useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, X } from 'lucide-react'

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
      {/* Upgrade Panel - Secondary to header */}
      {!isDismissed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-yellow-50 border border-yellow-200 p-3 mx-6 mb-4 rounded-lg shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Upgrade to use this feature
                </p>
                <p className="text-xs text-yellow-700">
                  Get full access to save, organize, and use all premium tools
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleUpgrade}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                Upgrade Now
              </button>
              <button
                onClick={() => setIsDismissed(true)}
                className="text-yellow-600 hover:text-yellow-700 p-1 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Preview content with transparency */}
      <div className="relative opacity-60 pointer-events-none select-none">
        {children}
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/30 to-transparent pointer-events-none z-10" />
    </div>
  )
}