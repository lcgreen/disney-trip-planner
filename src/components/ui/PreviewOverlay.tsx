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
      {/* Upgrade Header */}
      {!isDismissed && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 flex items-center justify-between shadow-lg relative z-20"
        >
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6" />
            <div>
              <h3 className="font-semibold text-lg">Upgrade to use this feature</h3>
              <p className="text-white/90 text-sm">Get full access to save, organize, and use all premium tools</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUpgrade}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/30"
            >
              Upgrade Now
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all backdrop-blur-sm border border-white/30"
            >
              <X className="w-4 h-4" />
            </button>
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