'use client'

import { ReactNode, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { PluginHeader } from '@/components/ui'
import { useReduxUser } from '@/hooks/useReduxUser'
import { usePluginState } from '@/hooks/usePluginState'
import { usePluginActions } from '@/hooks/usePluginActions'
import SaveModal from './SaveModal'
import LoadModal from './LoadModal'
import PremiumRestriction from './PremiumRestriction'
import { PluginData } from '@/types'

// Types
interface PluginPageWrapperProps<T extends PluginData> {
  title: string
  description: string
  icon: LucideIcon
  gradient: string
  pluginId: string
  isPremium?: boolean
  showPreview?: boolean
  children: ReactNode
  onSave?: (data: Partial<T>) => void
  onLoad?: (item: T) => void
  onNew?: () => void
  setCanSave?: (canSave: boolean) => void
  currentName?: string
  onNameChange?: (name: string) => void
  placeholder?: string
  saveButtonText?: string
  loadButtonText?: string
  newButtonText?: string
  saveModalTitle?: string
  saveModalDescription?: string
}

// Main component
export default function PluginPageWrapper<T extends PluginData>({
  title,
  description,
  icon: Icon,
  gradient,
  pluginId,
  isPremium = false,
  showPreview = false,
  children,
  onSave,
  onLoad,
  onNew,
  setCanSave,
  currentName = '',
  onNameChange,
  placeholder = `Name this ${pluginId}...`,
  saveButtonText = `Save ${pluginId.charAt(0).toUpperCase() + pluginId.slice(1)}`,
  loadButtonText = `Load ${pluginId.charAt(0).toUpperCase() + pluginId.slice(1)}`,
  newButtonText = `New ${pluginId.charAt(0).toUpperCase() + pluginId.slice(1)}`,
  saveModalTitle = `Save ${pluginId.charAt(0).toUpperCase() + pluginId.slice(1)}`,
  saveModalDescription = `Save your current ${pluginId} to access it later. Your data will be stored locally in your browser.`
}: PluginPageWrapperProps<T>) {
  const { hasFeatureAccess, isPremium: userIsPremium, userLevel } = useReduxUser()

  // Custom hooks for state and actions
  const { state, modalState, updateState, updateModalState } = usePluginState<T>(pluginId)
  const actions = usePluginActions(pluginId, state, modalState, updateState, updateModalState, {
    onSave,
    onLoad,
    onNew,
    onNameChange,
    setCanSave
  })

  // Memoized values
  const capitalizedPluginId = useMemo(() =>
    pluginId.charAt(0).toUpperCase() + pluginId.slice(1),
    [pluginId]
  )

  // Update parent's canSave state
  useEffect(() => {
    setCanSave?.(state.canSave)
  }, [state.canSave, setCanSave])

  // Handle premium restrictions
  if (isPremium && !userIsPremium) {
    return (
      <PremiumRestriction
        title={title}
        description={description}
        icon={Icon}
        gradient={gradient}
        showPreview={showPreview}
      >
        {children}
      </PremiumRestriction>
    )
  }

  // Handle loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-disney-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {capitalizedPluginId}...</p>
        </div>
      </div>
    )
  }

  // Handle error state
  if (state.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-red-600 mb-4">{state.error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

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
            isPremium={isPremium}
            showPreview={userLevel === 'anon'}
            currentName={currentName}
            onSave={actions.handleSave}
            onLoad={actions.handleLoad}
            onNew={actions.handleNew}
            canSave={state.canSave}
            placeholder={placeholder}
            saveButtonText={saveButtonText}
            loadButtonText={loadButtonText}
            newButtonText={newButtonText}
            saveModalTitle={saveModalTitle}
            saveModalDescription={saveModalDescription}
          />

          {/* Save Modal */}
          {hasFeatureAccess('saveData') && (
            <SaveModal
              isOpen={modalState.showSave}
              onClose={() => updateModalState({ showSave: false, itemToSave: '' })}
              itemToSave={modalState.itemToSave}
              onItemToSaveChange={(value) => updateModalState({ itemToSave: value })}
              onConfirm={actions.confirmSave}
              pluginId={pluginId}
              title={saveModalTitle}
              description={saveModalDescription}
            />
          )}

          {/* Load Modal */}
          {hasFeatureAccess('saveData') && (
            <LoadModal
              isOpen={modalState.showLoad}
              onClose={() => updateModalState({ showLoad: false })}
              savedItems={state.savedItems}
              activeItem={state.activeItem}
              onSelectItem={actions.handleSelectLoad}
              pluginId={pluginId}
              icon={Icon}
            />
          )}

          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  )
}