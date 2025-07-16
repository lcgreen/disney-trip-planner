'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Package } from 'lucide-react'
import PackingChecklist from '@/components/PackingChecklist'
import { PluginHeader, Modal } from '@/components/ui'
import { useUser } from '@/hooks/useUser'
import { packingStorage, storageUtils, type StoredPackingList } from '@/lib/storage'
import PremiumRestriction from '@/components/PremiumRestriction'

export default function PackingPage() {
  const { hasFeatureAccess, userLevel } = useUser()
  const [currentName, setCurrentName] = useState<string>('')
  const [canSave, setCanSave] = useState<boolean>(false)
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false)
  const [showLoadModal, setShowLoadModal] = useState<boolean>(false)
  const [savedLists, setSavedLists] = useState<StoredPackingList[]>([])
  const [listToSave, setListToSave] = useState<string>('')
  const packingRef = useRef<{ saveCurrentList: () => void; loadList: (list: StoredPackingList) => void }>(null)

  // Show premium restriction for anonymous users
  if (userLevel === 'anon') {
    return (
      <PremiumRestriction
        feature="Packing Checklist"
        description="Create and manage comprehensive packing lists for your Disney trip. Never forget the essentials with our Disney-optimized categories and smart suggestions."
        icon={<Package className="w-12 h-12" />}
        gradient="from-orange-500 to-amber-500"
      />
    )
  }

  // Load saved lists on component mount
  useEffect(() => {
    const storage = storageUtils.initializePackingStorage()
    setSavedLists(storage.lists)
  }, [])

  const handleSave = (name: string) => {
    setListToSave(name)
    setShowSaveModal(true)
  }

  const handleLoad = () => {
    setShowLoadModal(true)
  }

  const handleNew = () => {
    setCurrentName('')
    setCanSave(false)
    // The PackingChecklist component will handle resetting its internal state
  }

  const handleSaveConfirm = () => {
    if (!listToSave.trim()) return

    setCurrentName(listToSave.trim())
    setCanSave(false)
    setListToSave('')
    setShowSaveModal(false)

    // Trigger save in the component
    if (packingRef.current?.saveCurrentList) {
      packingRef.current.saveCurrentList()
    }
  }

  const handleLoadConfirm = (list: StoredPackingList) => {
    setCurrentName(list.name)
    setCanSave(false)
    setShowLoadModal(false)

    // Trigger load in the component
    if (packingRef.current?.loadList) {
      packingRef.current.loadList(list)
    }
  }

  const handleDeleteList = (listId: string) => {
    packingStorage.update(storage => {
      const lists = storage?.lists?.filter(list => list.id !== listId) || []
      const activeListId = storage?.activeListId === listId ? undefined : storage?.activeListId

      return { lists, activeListId }
    })

    const storage = packingStorage.get()!
    setSavedLists(storage.lists)

    if (currentName && storage.activeListId === listId) {
      setCurrentName('')
      setCanSave(false)
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
            title="Disney Packing Checklist"
            description="Never forget the essentials with our Disney-optimized packing lists"
            icon={<Package className="w-8 h-8" />}
            gradient="bg-gradient-to-r from-disney-green to-disney-teal"
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
              ref={packingRef}
              currentName={currentName}
              onNameChange={setCurrentName}
              onCanSaveChange={setCanSave}
              savedLists={savedLists}
              onDeleteList={handleDeleteList}
            />
          </div>
        </motion.div>
      </div>

      {/* Save Modal */}
      {hasFeatureAccess('saveData') && (
        <Modal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          title="Save Packing List"
          size="md"
        >
        <div className="space-y-4">
          <p className="text-gray-600">
            Save your current packing list to access it later. Your list will be stored locally in your browser.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">List Name</label>
            <input
              type="text"
              value={listToSave}
              onChange={(e) => setListToSave(e.target.value)}
              placeholder="Enter a name for your packing list..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-transparent"
              autoFocus
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSaveConfirm}
            disabled={!listToSave.trim()}
            className="btn-disney flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save List
          </button>
          <button
            onClick={() => setShowSaveModal(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </Modal>
      )}

      {/* Load Modal */}
      {hasFeatureAccess('saveData') && (
        <Modal
          isOpen={showLoadModal}
          onClose={() => setShowLoadModal(false)}
          title="Load Packing List"
          size="lg"
        >
        <div className="space-y-4">
          <p className="text-gray-600">
            Choose a saved packing list to load. This will replace your current list.
          </p>
          {savedLists.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No saved packing lists found.</p>
              <p className="text-sm">Create and save a list to see it here.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {savedLists.map((list) => (
                <div
                  key={list.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{list.name}</h4>
                    <p className="text-sm text-gray-500">
                      {list.items.length} items • Updated {new Date(list.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLoadConfirm(list)}
                      className="btn-disney px-4 py-2"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => handleDeleteList(list.id)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setShowLoadModal(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </Modal>
      )}
    </div>
  )
}