'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import CountdownTimer from '@/components/CountdownTimer'
import { PluginHeader, Modal, Badge } from '@/components/ui'
import { getAllParks, getParkById, type DisneyPark, type CountdownPalette } from '@/config'

interface SavedCountdown {
  id: string
  name: string
  park: DisneyPark
  date: string
  settings: any
  theme?: CountdownPalette
  createdAt: string
}

export default function CountdownPage() {
  const [currentName, setCurrentName] = useState<string>('')
  const [canSave, setCanSave] = useState<boolean>(false)
  const [savedCountdowns, setSavedCountdowns] = useState<SavedCountdown[]>([])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [countdownToSave, setCountdownToSave] = useState<string>('')
  const [activeCountdown, setActiveCountdown] = useState<SavedCountdown | null>(null)

  // Load saved countdowns from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('disney-countdowns')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const countdowns = Array.isArray(parsed) ? parsed : (parsed.countdowns || [])
        setSavedCountdowns(countdowns)
      } catch {
        setSavedCountdowns([])
      }
    }
  }, [])

  const handleSave = (name: string) => {
    setCountdownToSave(name)
    setShowSaveModal(true)
  }

  const confirmSave = (data: Partial<SavedCountdown>) => {
    if (!countdownToSave.trim()) return
    const newCountdown: SavedCountdown = {
      id: Date.now().toString(),
      name: countdownToSave.trim(),
      park: data.park!,
      date: data.date!,
      settings: data.settings!,
      theme: data.theme,
      createdAt: new Date().toISOString()
    }
    const updated = [...savedCountdowns, newCountdown]
    setSavedCountdowns(updated)
    localStorage.setItem('disney-countdowns', JSON.stringify({ countdowns: updated }))
    setCurrentName(newCountdown.name)
    setShowSaveModal(false)
    setCountdownToSave('')
    setActiveCountdown(newCountdown)
  }

  const handleLoad = () => {
    setShowLoadModal(true)
  }

  const handleSelectLoad = (countdown: SavedCountdown) => {
    setActiveCountdown(countdown)
    setCurrentName(countdown.name)
    setShowLoadModal(false)
  }

  const handleNew = () => {
    setCurrentName('')
    setActiveCountdown(null)
    setCountdownToSave('')
    setCanSave(false)
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
            title="Disney Countdown Timer"
            description="Count down the magical days until your Disney adventure begins!"
            icon={<Clock className="w-8 h-8" />}
            gradient="bg-gradient-to-r from-disney-blue to-disney-purple"
            currentName={currentName}
            onSave={handleSave}
            onLoad={handleLoad}
            onNew={handleNew}
            canSave={canSave}
            placeholder="Name this countdown..."
            saveButtonText="Save Countdown"
            loadButtonText="Load Countdown"
            newButtonText="New Countdown"
            saveModalTitle="Save Countdown"
            saveModalDescription="Save your current countdown to access it later. Your countdown will be stored locally in your browser."
          />

          {/* Save Modal */}
          <Modal
            isOpen={showSaveModal}
            onClose={() => setShowSaveModal(false)}
            title="Save Countdown"
            size="md"
          >
            <div className="space-y-4">
              <p className="text-gray-600">
                Save your current countdown to access it later. Your countdown will be stored locally in your browser.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Countdown Name</label>
                <input
                  type="text"
                  value={countdownToSave}
                  onChange={e => setCountdownToSave(e.target.value)}
                  placeholder="Enter a name for your countdown..."
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
                {/* The actual save will be triggered from the CountdownTimer via a callback */}
              </div>
            </div>
          </Modal>

          {/* Load Modal */}
          <Modal
            isOpen={showLoadModal}
            onClose={() => setShowLoadModal(false)}
            title="Load Countdown"
            size="lg"
          >
            <div className="space-y-4">
              {savedCountdowns.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No saved countdowns found.</p>
                  <p className="text-sm text-gray-400">Create and save a countdown to see it here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-600">
                    Select a saved countdown to load. This will replace your current countdown data.
                  </p>
                  {savedCountdowns.map((c) => (
                    <div
                      key={c.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        activeCountdown?.id === c.id
                          ? 'border-disney-blue bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleSelectLoad(c)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{c.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span>{c.park.name}</span>
                            <span>•</span>
                            <span>{new Date(c.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {activeCountdown?.id === c.id && (
                          <Badge variant="success" size="sm">Currently Loaded</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Modal>

          {/* Content */}
          <div className="p-6">
            <CountdownTimer
              name={currentName}
              onNameChange={setCurrentName}
              onSave={confirmSave}
              onLoad={handleSelectLoad}
              onNew={handleNew}
              savedCountdowns={savedCountdowns}
              activeCountdown={activeCountdown}
              setCanSave={setCanSave}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}