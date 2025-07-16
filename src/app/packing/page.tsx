'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { UnifiedStorage } from '@/lib/unifiedStorage'
import { PluginHeader, Modal, FeatureGuard } from '@/components/ui'
import PackingChecklist from '@/components/PackingChecklist'
import { StoredPackingList } from '@/lib/storage'

export default function PackingPage() {
  const { userLevel } = useUser()
  const [currentName, setCurrentName] = useState('')
  const [savedLists, setSavedLists] = useState<StoredPackingList[]>([])
  const [activeList, setActiveList] = useState<StoredPackingList | null>(null)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [listToSave, setListToSave] = useState('')
  const [canSave, setCanSave] = useState(false)

  // Load saved lists on mount
  useEffect(() => {
    const lists = UnifiedStorage.getPluginItems<StoredPackingList>('packing')
    setSavedLists(lists)
  }, [])

  const handleSave = () => {
    if (currentName.trim()) {
      setListToSave(currentName.trim())
      setShowSaveModal(true)
    }
  }

  const handleLoad = () => {
    setShowLoadModal(true)
  }

  const handleNew = () => {
    setCurrentName('')
    setActiveList(null)
    setListToSave('')
    setCanSave(false)
  }

  const confirmSave = () => {
    if (listToSave.trim()) {
      const listData: StoredPackingList = {
        id: `packing-${Date.now()}`,
        name: listToSave.trim(),
        items: activeList?.items || [],
        selectedWeather: activeList?.selectedWeather || ['sunny'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      UnifiedStorage.addPluginItem('packing', listData)
      setSavedLists(prev => [...prev, listData])
      setActiveList(listData)
      setCurrentName(listData.name)
      setShowSaveModal(false)
      setListToSave('')
      setCanSave(false)
    }
  }

  const handleSelectLoad = (list: StoredPackingList) => {
    setActiveList(list)
    setCurrentName(list.name)
    setShowLoadModal(false)
  }

  return (
    <FeatureGuard requiredLevel="premium">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
          >
            <PluginHeader
              title="Disney Packing Checklist"
              description="Never forget to pack the essentials for your magical Disney adventure"
              icon={<Package className="w-8 h-8" />}
              gradient="bg-gradient-to-r from-green-500 to-emerald-500"
              isPremium={true}
              currentName={currentName}
              onSave={handleSave}
              onLoad={handleLoad}
              onNew={handleNew}
              canSave={canSave}
              placeholder="Name this packing list..."
              saveButtonText="Save List"
              loadButtonText="Load List"
              newButtonText="New List"
              saveModalTitle="Save Packing List"
              saveModalDescription="Save your current packing list to access it later. Your list will be stored locally in your browser."
            />

            {/* Content */}
            <div className="p-6">
              <PackingChecklist
                currentName={currentName}
                onNameChange={setCurrentName}
                onCanSaveChange={setCanSave}
                savedLists={savedLists}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Save Modal */}
      <Modal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="Save Packing List"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Save your current packing list to access it later. Your list will be stored locally in your browser.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              List Name
            </label>
            <input
              type="text"
              value={listToSave}
              onChange={(e) => setListToSave(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="My Disney Packing List"
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={confirmSave}
              disabled={!listToSave.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save List
            </button>
            <button
              onClick={() => setShowSaveModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Load Modal */}
      <Modal
        isOpen={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        title="Load Packing List"
      >
        <div className="space-y-4">
          {savedLists.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No saved lists found. Create a new packing list to get started!
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {savedLists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => handleSelectLoad(list)}
                  className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-800">{list.name}</div>
                  <div className="text-sm text-gray-500">
                    {list.items.length} items • Last updated {new Date(list.updatedAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </FeatureGuard>
  )
}