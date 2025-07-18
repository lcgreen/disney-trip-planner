import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { PluginHeader } from '@/components/ui'
import PreviewOverlay from '@/components/ui/PreviewOverlay'

interface PremiumRestrictionProps {
  title: string
  description: string
  icon: LucideIcon
  gradient: string
  showPreview: boolean
  children: ReactNode
}

export default function PremiumRestriction({
  title,
  description,
  icon: Icon,
  gradient,
  showPreview,
  children
}: PremiumRestrictionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
          <PluginHeader
            title={title}
            description={description}
            icon={<Icon className="w-8 h-8" />}
            gradient={gradient}
            isPremium={true}
            showPreview={showPreview}
            currentName=""
            onSave={() => {}}
            onLoad={() => {}}
            onNew={() => {}}
            canSave={false}
            placeholder=""
            saveButtonText=""
            loadButtonText=""
            newButtonText=""
            saveModalTitle=""
            saveModalDescription=""
          />
          {showPreview ? (
            <PreviewOverlay
              title={`${title} Preview`}
              description={`See what you can do with ${title}. Upgrade to unlock full functionality and save your progress.`}
              feature="premium"
              isPreviewMode={true}
              className="p-6"
            >
              {children}
            </PreviewOverlay>
          ) : (
            <div className="p-6">
              <div className="text-center py-12">
                <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Premium Feature</h3>
                <p className="text-gray-500 mb-4">This feature requires a premium account.</p>
                <button
                  onClick={() => window.location.href = '/upgrade'}
                  className="px-6 py-3 bg-disney-gold text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
                >
                  Upgrade to Premium
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}