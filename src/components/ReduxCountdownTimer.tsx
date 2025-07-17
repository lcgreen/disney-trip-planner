"use client";

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code, Copy } from 'lucide-react'
import {
  Panel,
  SavedItemsPanel,
  SettingsPanel,
  SettingToggle,
  Select
} from '@/components/ui'
import { getAllThemes } from '@/config'
import { CountdownData } from '@/types'
import { useReduxCountdown } from '@/hooks/useReduxCountdown'
import { useReduxUser } from '@/hooks/useReduxUser'
import { useEditableName } from '@/hooks/useEditableName'
import {
  CountdownHeader,
  CountdownDisplay,
  ParkSelection,
  DateSelection,
  ControlPanel,
  AttractionsSection,
  TipsSection
} from '@/components/countdown'

interface ReduxCountdownTimerProps {
  createdItemId?: string | null
  widgetId?: string | null
  isEditMode?: boolean
  name?: string
  onNameChange?: (name: string) => void
  onSave?: (data: Partial<CountdownData>) => void
  onLoad?: (countdown: CountdownData) => void
  onNew?: () => void
  savedCountdowns?: CountdownData[]
  activeCountdown?: CountdownData | null
  setCanSave?: (canSave: boolean) => void
}

export default function ReduxCountdownTimer({
  createdItemId = null,
  widgetId = null,
  isEditMode = false,
  name = '',
  onNameChange,
  onSave,
  onLoad,
  onNew,
  savedCountdowns = [],
  activeCountdown = null,
  setCanSave
}: ReduxCountdownTimerProps): JSX.Element {
  // Redux hooks
  const { userLevel } = useReduxUser()
  const {
    countdowns,
    currentCountdown,
    isLoading,
    error,
    lastSaved,
    isSaving,
    createCountdown,
    updateCountdown,
    deleteCountdown,
    loadCountdowns,
    setCurrentCountdown,
    clearError,
    useAutoSave
  } = useReduxCountdown()

  // UI state
  const [showSettings, setShowSettings] = useState(false)
  const [showEmbed, setShowEmbed] = useState(false)
  const [showSaved, setShowSaved] = useState(false)

  // Local state for countdown functionality
  const [targetDate, setTargetDate] = useState<string>('')
  const [selectedPark, setSelectedPark] = useState<any>(null)
  const [settings, setSettings] = useState<any>({})
  const [customTheme, setCustomTheme] = useState<any>(null)

  // Custom hooks
  const {
    isEditingName,
    editedName,
    handleNameEdit,
    handleNameChange,
    handleNameBlur,
    handleNameKeyDown
  } = useEditableName({ name, onNameChange })

  // Auto-save functionality
  const autoSaveData = {
    id: createdItemId || 'temp',
    name: editedName || name,
    tripDate: targetDate,
    park: selectedPark,
    settings,
    theme: customTheme,
    createdAt: activeCountdown?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const {
    forceSave,
    isSaving: autoSaving,
    lastSaved: autoLastSaved,
    error: autoError
  } = useAutoSave(autoSaveData, {
    enabled: isEditMode && !!createdItemId,
    delay: 1000,
    onSave: () => {
      console.log('Auto-saved countdown changes')
    },
    onError: (error) => {
      console.error('Auto-save failed:', error)
    }
  })

  // Load countdowns on mount
  useEffect(() => {
    loadCountdowns()
  }, [loadCountdowns])

  // Load active countdown data
  useEffect(() => {
    if (activeCountdown) {
      setTargetDate(activeCountdown.tripDate || '')
      setSelectedPark(activeCountdown.park || null)
      setSettings(activeCountdown.settings || {})
      setCustomTheme(activeCountdown.theme || null)
    }
  }, [activeCountdown])

  // Configuration data
  const customThemes = getAllThemes()

  const getEmbedCode = (): string => {
    const embedUrl = `${window.location.origin}/embed/countdown?park=${selectedPark?.id || 'disney-world'}&date=${encodeURIComponent(targetDate)}&theme=${customTheme?.id || 'classic'}&settings=${encodeURIComponent(JSON.stringify(settings))}`
    return `<iframe src="${embedUrl}" width="800" height="600" frameborder="0" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"></iframe>`
  }

  const saveCountdown = async (): Promise<void> => {
    if (!name.trim()) return

    try {
      if (isEditMode && createdItemId) {
        // Update existing countdown
        await updateCountdown(createdItemId, {
          name: name.trim(),
          park: selectedPark,
          tripDate: targetDate,
          settings,
          theme: customTheme || undefined,
        })
        onSave?.({
          name: name.trim(),
          park: selectedPark,
          tripDate: targetDate,
          settings,
          theme: customTheme || undefined,
        })
      } else {
        // Create new countdown
        const newId = await createCountdown(name.trim())
        onNew?.()

        // Update the countdown with full data
        await updateCountdown(newId, {
          park: selectedPark,
          tripDate: targetDate,
          settings,
          theme: customTheme || undefined,
        })
      }
    } catch (error) {
      console.error('Failed to save countdown:', error)
    }
  }

  const deleteCountdownHandler = async (id: string): Promise<void> => {
    try {
      await deleteCountdown(id)
    } catch (error) {
      console.error('Failed to delete countdown:', error)
    }
  }

  const clearSavedCountdowns = (): void => {
    // Check if user has save permissions before clearing
    if (userLevel === 'anon') {
      console.warn('Clear blocked: Anonymous users cannot clear data')
      return
    }

    // Clear all countdowns
    countdowns.forEach(countdown => {
      deleteCountdownHandler(countdown.id)
    })
  }

  const handleLoadCountdown = (saved: CountdownData): void => {
    setCurrentCountdown(saved)
    setTargetDate(saved.tripDate || '')
    setSelectedPark(saved.park || null)
    setSettings(saved.settings || {})
    setCustomTheme(saved.theme || null)
    onLoad?.(saved)
    setShowSaved(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header */}
          <CountdownHeader
            name={editedName || name}
            isEditingName={isEditingName}
            onNameEdit={handleNameEdit}
            onNameChange={handleNameChange}
            onNameBlur={handleNameBlur}
            onNameKeyDown={handleNameKeyDown}
            isSaving={isSaving || autoSaving}
            lastSaved={lastSaved || autoLastSaved}
            error={error || autoError}
            onClearError={clearError}
          />

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Countdown Display */}
            <div className="lg:col-span-2 space-y-6">
              <CountdownDisplay
                targetDate={targetDate}
                selectedPark={selectedPark}
                settings={settings}
                customTheme={customTheme}
              />

              {/* Control Panel */}
              <ControlPanel
                onSave={saveCountdown}
                onEmbed={() => setShowEmbed(true)}
                onSettings={() => setShowSettings(true)}
                onSaved={() => setShowSaved(true)}
                isEditMode={isEditMode}
                canSave={!!name.trim() && !!targetDate}
              />
            </div>

            {/* Right Column - Configuration */}
            <div className="space-y-6">
              {/* Date Selection */}
              <DateSelection
                targetDate={targetDate}
                onDateChange={setTargetDate}
                isEditMode={isEditMode}
              />

              {/* Park Selection */}
              <ParkSelection
                selectedPark={selectedPark}
                onParkChange={setSelectedPark}
                isEditMode={isEditMode}
              />

              {/* Attractions Section */}
              <AttractionsSection
                selectedPark={selectedPark}
                settings={settings}
                onSettingsChange={setSettings}
                isEditMode={isEditMode}
              />

              {/* Tips Section */}
              <TipsSection
                selectedPark={selectedPark}
                settings={settings}
                isEditMode={isEditMode}
              />
            </div>
          </div>

          {/* Modals */}
          <AnimatePresence>
            {/* Settings Modal */}
            {showSettings && (
              <SettingsPanel
                settings={settings}
                onSettingsChange={setSettings}
                customTheme={customTheme}
                onThemeChange={setCustomTheme}
                customThemes={customThemes}
                onClose={() => setShowSettings(false)}
              />
            )}

            {/* Saved Items Modal */}
            {showSaved && (
              <SavedItemsPanel
                items={countdowns}
                onLoad={handleLoadCountdown}
                onDelete={deleteCountdownHandler}
                onClear={clearSavedCountdowns}
                onClose={() => setShowSaved(false)}
                userLevel={userLevel}
              />
            )}

            {/* Embed Modal */}
            {showEmbed && (
              <Panel
                title="Embed Countdown"
                onClose={() => setShowEmbed(false)}
                className="max-w-2xl"
              >
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Copy this code to embed your countdown on any website:
                  </p>
                  <div className="relative">
                    <textarea
                      value={getEmbedCode()}
                      readOnly
                      className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm resize-none"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(getEmbedCode())}
                      className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Panel>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}