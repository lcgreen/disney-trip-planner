import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, FolderOpen, Plus, Crown } from 'lucide-react'
import { Button, Badge, Modal } from '@/components/ui'
import { useUser } from '@/hooks/useUser'

interface PluginHeaderProps {
  title: string
  description: string
  icon: React.ReactNode
  gradient: string
  isPremium?: boolean
  showPreview?: boolean
  currentName: string
  onSave: (name: string) => void
  onLoad: () => void
  onNew: () => void
  canSave: boolean
  placeholder: string
  saveButtonText: string
  loadButtonText: string
  newButtonText: string
  saveModalTitle: string
  saveModalDescription: string
}

export default function PluginHeader({
  title,
  description,
  icon,
  gradient,
  isPremium = false,
  showPreview = false,
  currentName,
  onSave,
  onLoad,
  onNew,
  canSave,
  placeholder,
  saveButtonText,
  loadButtonText,
  newButtonText,
  saveModalTitle,
  saveModalDescription
}: PluginHeaderProps) {
  const { hasFeatureAccess } = useUser()
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [nameToSave, setNameToSave] = useState('')

  useEffect(() => {
    if (currentName) {
      setNameToSave(currentName)
    }
  }, [currentName])

  // Auto-save on name change
  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNameToSave(value)
    if (value.trim()) {
      onSave(value.trim())
    }
  }

  return (
    <>
      {/* Header */}
      <div className={`${gradient} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-3 rounded-full">
              {icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center space-x-3">
                <span>{title}</span>
                {isPremium && <Badge variant="premium" size="sm">Premium</Badge>}
              </h1>
              <p className="text-white/80 mt-1">
                {description}
              </p>
            </div>
          </div>
          {isPremium && <Crown className="w-10 h-10 text-yellow-200" />}
        </div>
      </div>

      {/* Naming and Saving Section - Hidden in preview mode */}
      {!showPreview && (
        <div className="bg-white p-4 md:p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {currentName ? (
                <div className="flex items-center gap-2">
                  {icon}
                  <span className="font-medium text-gray-700">Current: {currentName}</span>
                  <Badge variant="success" size="sm">Saved</Badge>
                </div>
              ) : (
                <span className="text-gray-500">No item loaded</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {hasFeatureAccess('saveData') && (
                <Button
                  onClick={onLoad}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <FolderOpen className="w-4 h-4" />
                  {loadButtonText}
                </Button>
              )}
              <Button
                onClick={onNew}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {newButtonText}
              </Button>
            </div>
          </div>

          {/* Quick Save Input */}
          {canSave && hasFeatureAccess('saveData') && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 flex gap-3"
            >
              <input
                type="text"
                placeholder={placeholder}
                value={nameToSave}
                onChange={handleNameInput}
                className="flex-1 p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-disney-blue focus:border-disney-blue"
              />
            </motion.div>
          )}
        </div>
      )}

      {/* Save Modal */}
      {hasFeatureAccess('saveData') && (
        <Modal
          isOpen={showSaveModal}
          onClose={() => {
            setShowSaveModal(false)
            setNameToSave('')
          }}
          title={saveModalTitle}
          size="md"
        >
        <div className="space-y-4">
          <p className="text-gray-600">
            {saveModalDescription}
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={nameToSave}
              onChange={(e) => setNameToSave(e.target.value)}
              placeholder={placeholder}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-disney-blue"
              autoFocus
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setShowSaveModal(false)
                setNameToSave('')
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSave(nameToSave.trim())
                setShowSaveModal(false)
                setNameToSave('')
              }}
              disabled={!nameToSave.trim()}
              className="px-4 py-2 bg-disney-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
      )}
    </>
  )
}