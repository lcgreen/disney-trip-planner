'use client'

import { ReactNode, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { PluginHeader, Modal, Badge } from '@/components/ui'
import PreviewOverlay from '@/components/ui/PreviewOverlay'
import { useUser } from '@/hooks/useUser'
import { UnifiedStorage } from '@/lib/unifiedStorage'
import { PluginData } from '@/types'

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
  const { hasFeatureAccess, userLevel, isPremium: userIsPremium } = useUser()
  const [savedItems, setSavedItems] = useState<T[]>([])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [itemToSave, setItemToSave] = useState<string>('')
  const [activeItem, setActiveItem] = useState<T | null>(null)
  const [canSave, setCanSaveInternal] = useState<boolean>(false)

  // Load saved items from storage
  useEffect(() => {
    const items = UnifiedStorage.getPluginItems<T>(pluginId)
    setSavedItems(items)
  }, [pluginId])

  const handleSave = (name: string) => {
    setItemToSave(name)
    setShowSaveModal(true)
  }

  const confirmSave = async () => {
    if (!itemToSave.trim()) return

    if (!hasFeatureAccess('saveData')) {
      console.warn('Save blocked: User does not have save permissions')
      return
    }

    // For now, we'll create a basic item structure
    // The actual data should come from the child component via onSave prop
    const newItem: T = {
      id: Date.now().toString(),
      name: itemToSave.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as T

    await UnifiedStorage.addPluginItem(pluginId, newItem)

    // Update local state
    setSavedItems(prev => [...prev, newItem])
    setActiveItem(newItem)
    setShowSaveModal(false)
    setItemToSave('')

    // Call parent callbacks
    onNameChange?.(newItem.name)
    onSave?.(newItem)
  }

  const handleLoad = () => {
    setShowLoadModal(true)
  }

  const handleSelectLoad = (item: T) => {
    setActiveItem(item)
    onNameChange?.(item.name)
    setShowLoadModal(false)
    onLoad?.(item)
  }

  const handleNew = () => {
    setActiveItem(null)
    onNameChange?.('')
    setItemToSave('')
    setCanSaveInternal(false)
    onNew?.()
  }

  // Update parent's canSave state
  useEffect(() => {
    setCanSave?.(canSave)
  }, [canSave, setCanSave])

  // Handle premium restrictions
  if (isPremium && !userIsPremium) {
    // Show preview mode if enabled, otherwise show full restriction
    if (showPreview) {
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
                showPreview={true}
                currentName={currentName}
                onSave={handleSave}
                onLoad={handleLoad}
                onNew={handleNew}
                canSave={canSave}
                placeholder={placeholder}
                saveButtonText={saveButtonText}
                loadButtonText={loadButtonText}
                newButtonText={newButtonText}
                saveModalTitle={saveModalTitle}
                saveModalDescription={saveModalDescription}
              />

              <PreviewOverlay
                title={`${title} Preview`}
                description={`See what you can do with ${title}. Upgrade to unlock full functionality and save your progress.`}
                feature={pluginId}
                isPreviewMode={true}
                className="p-6"
              >
                {children}
              </PreviewOverlay>
            </motion.div>
          </div>
        </div>
      )
    } else {
      // Show full restriction
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
                showPreview={false}
                currentName={currentName}
                onSave={handleSave}
                onLoad={handleLoad}
                onNew={handleNew}
                canSave={canSave}
                placeholder={placeholder}
                saveButtonText={saveButtonText}
                loadButtonText={loadButtonText}
                newButtonText={newButtonText}
                saveModalTitle={saveModalTitle}
                saveModalDescription={saveModalDescription}
              />
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
            </motion.div>
          </div>
        </div>
      )
    }
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
            showPreview={false}
            currentName={currentName}
            onSave={handleSave}
            onLoad={handleLoad}
            onNew={handleNew}
            canSave={canSave}
            placeholder={placeholder}
            saveButtonText={saveButtonText}
            loadButtonText={loadButtonText}
            newButtonText={newButtonText}
            saveModalTitle={saveModalTitle}
            saveModalDescription={saveModalDescription}
          />

          {/* Save Modal */}
          {hasFeatureAccess('saveData') && (
            <Modal
              isOpen={showSaveModal}
              onClose={() => setShowSaveModal(false)}
              title={saveModalTitle}
              size="md"
            >
              <div className="space-y-4">
                <p className="text-gray-600">{saveModalDescription}</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {pluginId.charAt(0).toUpperCase() + pluginId.slice(1)} Name
                  </label>
                  <input
                    type="text"
                    value={itemToSave}
                    onChange={e => setItemToSave(e.target.value)}
                    placeholder={`Enter a name for your ${pluginId}...`}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-disney-blue"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmSave}
                    disabled={!itemToSave.trim()}
                    className="px-4 py-2 bg-disney-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>
            </Modal>
          )}

          {/* Load Modal */}
          {hasFeatureAccess('saveData') && (
            <Modal
              isOpen={showLoadModal}
              onClose={() => setShowLoadModal(false)}
              title={`Load ${pluginId.charAt(0).toUpperCase() + pluginId.slice(1)}`}
              size="lg"
            >
              <div className="space-y-4">
                {savedItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No saved {pluginId}s found.</p>
                    <p className="text-sm text-gray-400">Create and save a {pluginId} to see it here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-gray-600">
                      Select a saved {pluginId} to load. This will replace your current data.
                    </p>
                    {savedItems.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          activeItem?.id === item.id
                            ? 'border-disney-blue bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleSelectLoad(item)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <span>Created {new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {activeItem?.id === item.id && (
                            <Badge variant="success" size="sm">Currently Loaded</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Modal>
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