"use client";

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
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
import { useReduxWidgets } from '@/hooks/useReduxWidgets'
import { useEditableName } from '@/hooks/useEditableName'
import { useCountdownTimer } from '@/hooks/useCountdownTimer'
import {
  CountdownHeader,
  CountdownDisplay,
  ParkSelection,
  DateSelection,
  ControlPanel,
  AttractionsSection,
  TipsSection
} from '@/components/countdown'

interface CountdownTimerProps {
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

export interface CountdownTimerRef {
  saveCurrentCountdown: () => void
  loadCountdown: (countdown: CountdownData) => void
}

const CountdownTimer = forwardRef<CountdownTimerRef, CountdownTimerProps>(({
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
}, ref) => {
  // UI state
  const [showSettings, setShowSettings] = useState(false)
  const [showEmbed, setShowEmbed] = useState(false)
  const [showSaved, setShowSaved] = useState(false)

  // Redux hooks
  const {
    countdownData,
    isLoading,
    error,
    updateCountdown,
    createCountdown,
    deleteCountdown,
    loadCountdown,
    clearAllCountdowns,
    setTargetDate,
    setSelectedPark,
    setSettings,
    setCustomTheme,
    startCountdown,
    stopCountdown,
    resetCountdown
  } = useReduxCountdown()

  const { user, hasFeatureAccess } = useReduxUser()
  const { checkAndApplyPendingLinks } = useReduxWidgets()

  // Audio ref for completion sound
  const audioRef = useRef<HTMLAudioElement>(null)

  // Custom hooks
  const {
    isEditingName,
    editedName,
    handleNameEdit,
    handleNameChange,
    handleNameBlur,
    handleNameKeyDown
  } = useEditableName({ name, onNameChange })

  // Load initial data
  useEffect(() => {
    console.log('[CountdownTimer] Load initial data effect:', { isEditMode, activeCountdown })
    if (isEditMode && activeCountdown) {
      console.log('[CountdownTimer] Loading countdown data:', activeCountdown)
      loadCountdown(activeCountdown)
    }
  }, [isEditMode, activeCountdown, loadCountdown])

  // Set default date on client side to avoid hydration mismatch
  useEffect(() => {
    if (!countdownData.targetDate) {
      const defaultDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
      setTargetDate(defaultDate)
    }
  }, [countdownData.targetDate, setTargetDate])

  // Load created item in edit mode
  useEffect(() => {
    if (isEditMode && createdItemId && activeCountdown) {
      loadCountdown(activeCountdown)
    }
  }, [isEditMode, createdItemId, activeCountdown, loadCountdown])

  // Update parent when data changes (similar to PackingChecklist)
  useEffect(() => {
    if (onSave) {
      onSave({
        name: name.trim(),
        park: countdownData.selectedPark,
        tripDate: countdownData.targetDate,
        settings: countdownData.settings,
        theme: countdownData.customTheme || undefined,
      })
    }
    const hasChanges = countdownData.targetDate || countdownData.selectedPark || Object.keys(countdownData.settings).length > 0
    setCanSave?.(hasChanges && name.trim().length > 0)
  }, [countdownData.targetDate, countdownData.selectedPark, countdownData.settings, countdownData.customTheme, name, onSave, setCanSave])

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    saveCurrentCountdown: () => {
      // This is handled by PluginPageWrapper now
    },
    loadCountdown: (countdown: CountdownData) => {
      loadCountdown(countdown)
    }
  }))

  // Configuration data
  const customThemes = getAllThemes()

  const getEmbedCode = (): string => {
    const embedUrl = `${window.location.origin}/embed/countdown?park=${countdownData.selectedPark?.id || 'disney-world'}&date=${encodeURIComponent(countdownData.targetDate)}&theme=${countdownData.customTheme?.id || 'classic'}&settings=${encodeURIComponent(JSON.stringify(countdownData.settings))}`
    return `<iframe src="${embedUrl}" width="800" height="600" frameborder="0" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"></iframe>`
  }

  const saveCountdown = (): void => {
    if (!name.trim()) return

    // If we're editing an existing item, update it
    if (isEditMode && createdItemId) {
      const updatedCountdown: CountdownData = {
        id: createdItemId,
        name: name.trim(),
        park: countdownData.selectedPark,
        tripDate: countdownData.targetDate,
        settings: countdownData.settings,
        theme: countdownData.customTheme || undefined,
        createdAt: savedCountdowns?.find(c => c.id === createdItemId)?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      updateCountdown(createdItemId, updatedCountdown)
      onSave?.(updatedCountdown)
    } else {
      // Creating a new countdown
      const newCountdown: CountdownData = {
        id: Date.now().toString(),
        name: name.trim(),
        park: countdownData.selectedPark,
        tripDate: countdownData.targetDate,
        settings: countdownData.settings,
        theme: countdownData.customTheme || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      createCountdown(name.trim())
      onNew?.()

      // Check for pending widget links and auto-link if needed
      checkAndApplyPendingLinks(newCountdown.id, 'countdown')
    }
  }

  const handleDeleteCountdown = (id: string): void => {
    deleteCountdown(id)
    // Note: Widget cleanup is handled automatically by the Redux store
  }

  const handleClearSavedCountdowns = (): void => {
    // Check if user has save permissions before clearing
    if (!hasFeatureAccess('saveData')) {
      console.warn('Clear blocked: User does not have save permissions')
      return
    }

    // Note: Widget cleanup is handled automatically by the Redux store
    clearAllCountdowns()
  }

  const handleLoadCountdown = (saved: CountdownData): void => {
    loadCountdown(saved)
    setShowSaved(false)
    onLoad?.(saved)
  }

  const handleStartCountdown = (): void => {
    if (countdownData.targetDate) {
      startCountdown()
    }
  }

  // Use the countdown timer hook
  useCountdownTimer(
    countdownData.targetDate,
    countdownData.isActive,
    countdownData.settings.showMilliseconds
  )

  // Play completion sound when countdown reaches zero
  useEffect(() => {
    if (countdownData.isActive && countdownData.countdown.total <= 0 && countdownData.settings.playSound && audioRef.current) {
      audioRef.current.play().catch(console.error)
    }
  }, [countdownData.isActive, countdownData.countdown.total, countdownData.settings.playSound])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Audio element for completion sound */}
      <audio ref={audioRef} preload="auto" aria-label="Countdown completion sound">
        <source src="/sounds/disney-chime.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <CountdownHeader
          name={name}
          isEditingName={isEditingName}
          editedName={editedName}
          onNameEdit={handleNameEdit}
          onNameChange={handleNameChange}
          onNameBlur={handleNameBlur}
          onNameKeyDown={handleNameKeyDown}
          widgetId={widgetId}
          isEditMode={isEditMode}
          isSaving={false} // Redux handles this automatically
          lastSaved={null} // Redux handles this automatically
          error={error}
          forceSave={saveCountdown}
        />

        {/* Control Panel */}
        <ControlPanel
          showSettings={showSettings}
          showEmbed={showEmbed}
          onToggleSettings={() => setShowSettings(!showSettings)}
          onToggleEmbed={() => setShowEmbed(!showEmbed)}
        />

        {/* Collapsible Panels */}
        <div className="space-y-6 mb-8">
          {/* Saved Countdowns Panel */}
          <AnimatePresence>
            {showSaved && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <SavedItemsPanel
                  title="Saved Countdowns"
                  count={savedCountdowns.length}
                  defaultExpanded={true}
                  onClearAll={handleClearSavedCountdowns}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedCountdowns.map((saved) => (
                      <motion.div
                        key={saved.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gray-800 truncate">{saved.name}</h4>
                          <button
                            onClick={() => handleDeleteCountdown(saved.id)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm text-gray-600">{saved.park?.name}</span>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                          {(() => {
                            const date = new Date(saved.tripDate)
                            return isNaN(date.getTime()) ? 'Invalid Date' : new Date(saved.tripDate).toLocaleDateString()
                          })()}
                        </p>
                        <button
                          onClick={() => handleLoadCountdown(saved)}
                          className="btn-disney-small w-full"
                        >
                          Load Countdown
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </SavedItemsPanel>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <SettingsPanel
                  title="Customisation Options"
                  defaultExpanded={true}
                  data-testid="settings-panel"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Theme Selection */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Theme</h4>
                      <div className="space-y-3">
                        {customThemes.map((theme) => (
                          <button
                            key={theme.id}
                            onClick={() => setCustomTheme(theme)}
                            className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                              countdownData.customTheme?.id === theme.id
                                ? 'ring-2 ring-disney-blue shadow-lg'
                                : 'hover:shadow-md'
                            }`}
                            style={{
                              background: `linear-gradient(135deg, ${theme.gradient.split(' ')[1]} 0%, ${theme.gradient.split(' ')[3]} 100%)`
                            }}
                          >
                            <span className="text-gray-800 font-medium">
                              {theme.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Display Options */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Display Options</h4>
                      <div className="space-y-4">
                        <SettingToggle
                          setting="Show milliseconds"
                          checked={countdownData.settings.showMilliseconds}
                          onChange={(checked: boolean) => setSettings({ ...countdownData.settings, showMilliseconds: checked })}
                          data-testid="setting-show-milliseconds"
                        />
                        <SettingToggle
                          setting="Show timezone"
                          checked={countdownData.settings.showTimezone}
                          onChange={(checked: boolean) => setSettings({ ...countdownData.settings, showTimezone: checked })}
                          data-testid="setting-show-timezone"
                        />
                        <SettingToggle
                          setting="Show planning tips"
                          checked={countdownData.settings.showTips}
                          onChange={(checked: boolean) => setSettings({ ...countdownData.settings, showTips: checked })}
                          data-testid="setting-show-tips"
                        />
                        <SettingToggle
                          setting="Show attractions"
                          checked={countdownData.settings.showAttractions}
                          onChange={(checked: boolean) => setSettings({ ...countdownData.settings, showAttractions: checked })}
                          data-testid="setting-show-attractions"
                        />
                        <SettingToggle
                          setting="Play completion sound"
                          checked={countdownData.settings.playSound}
                          onChange={(checked: boolean) => setSettings({ ...countdownData.settings, playSound: checked })}
                          data-testid="setting-play-sound"
                        />
                        <SettingToggle
                          setting="Auto refresh"
                          checked={countdownData.settings.autoRefresh}
                          onChange={(checked: boolean) => setSettings({ ...countdownData.settings, autoRefresh: checked })}
                          data-testid="setting-auto-refresh"
                        />
                      </div>
                    </div>

                    {/* Style Options */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-gray-800 mb-4">Style Options</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Digit Style</label>
                          <Select
                            defaultValue={countdownData.settings.digitStyle}
                            value={countdownData.settings.digitStyle}
                            onValueChange={(value: string) => setSettings({ ...countdownData.settings, digitStyle: value as any })}
                            options={[
                              { value: 'modern', label: 'Modern' },
                              { value: 'classic', label: 'Classic' },
                              { value: 'neon', label: 'Neon' },
                              { value: 'minimal', label: 'Minimal' }
                            ]}
                            dataTestId="setting-digit-style"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
                          <Select
                            defaultValue={countdownData.settings.layout}
                            value={countdownData.settings.layout}
                            onValueChange={(value: string) => setSettings({ ...countdownData.settings, layout: value as any })}
                            options={[
                              { value: 'horizontal', label: 'Horizontal' },
                              { value: 'vertical', label: 'Vertical' },
                              { value: 'compact', label: 'Compact' },
                              { value: 'grid', label: 'Grid' }
                            ]}
                            dataTestId="setting-layout"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                          <Select
                            defaultValue={countdownData.settings.fontSize}
                            value={countdownData.settings.fontSize}
                            onValueChange={(value: string) => setSettings({ ...countdownData.settings, fontSize: value as any })}
                            options={[
                              { value: 'small', label: 'Small' },
                              { value: 'medium', label: 'Medium' },
                              { value: 'large', label: 'Large' },
                              { value: 'xl', label: 'Extra Large' }
                            ]}
                            dataTestId="setting-font-size"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Background Effect</label>
                          <Select
                            defaultValue={countdownData.settings.backgroundEffect}
                            value={countdownData.settings.backgroundEffect}
                            onValueChange={(value: string) => setSettings({ ...countdownData.settings, backgroundEffect: value as any })}
                            options={[
                              { value: 'none', label: 'None' },
                              { value: 'particles', label: 'Particles' },
                              { value: 'gradient', label: 'Gradient' },
                              { value: 'animated', label: 'Animated' }
                            ]}
                            dataTestId="setting-background-effect"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </SettingsPanel>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Embed Panel */}
          <AnimatePresence>
            {showEmbed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <Panel
                  title="Embed on Your Website"
                  icon={<Code className="w-5 h-5" />}
                  variant="disney"
                  defaultExpanded={true}
                >
                  <p className="text-gray-600 mb-6">
                    Copy this code to embed your countdown timer on any website or blog:
                  </p>
                  <div className="bg-gray-50 p-6 rounded-xl font-mono text-sm mb-6 relative border border-gray-200">
                    <pre className="whitespace-pre-wrap break-all text-gray-800">{getEmbedCode()}</pre>
                    <button
                      onClick={() => navigator.clipboard.writeText(getEmbedCode())}
                      className="absolute top-3 right-3 p-2 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                      <h4 className="font-semibold text-blue-800 mb-2">📱 Responsive</h4>
                      <p className="text-blue-600 text-sm">Automatically adapts to any screen size</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                      <h4 className="font-semibold text-green-800 mb-2">⚡ Live Updates</h4>
                      <p className="text-green-600 text-sm">Real-time countdown updates every second</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                      <h4 className="font-semibold text-purple-800 mb-2">🎨 Customisable</h4>
                      <p className="text-purple-600 text-sm">All your settings and themes included</p>
                    </div>
                  </div>
                </Panel>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Content Container */}
        <div className="space-y-8">
          {/* Park Selection */}
          <ParkSelection
            disneyParks={countdownData.disneyParks}
            selectedPark={countdownData.selectedPark}
            onParkSelect={setSelectedPark}
            settings={countdownData.settings}
          />

          {/* Date Selection */}
          <DateSelection
            targetDate={countdownData.targetDate}
            onDateChange={setTargetDate}
            onStartCountdown={handleStartCountdown}
          />

          {/* Countdown Display */}
          {countdownData.targetDate && (
            <CountdownDisplay
              targetDate={countdownData.targetDate}
              selectedPark={countdownData.selectedPark}
              countdown={countdownData.countdown}
              milliseconds={countdownData.milliseconds}
              isActive={countdownData.isActive}
              settings={countdownData.settings}
              customTheme={countdownData.customTheme}
            />
          )}
        </div>

        {/* Bottom Content with Improved Layout */}
        {countdownData.targetDate && (
          <div className="space-y-8 mt-8">
            {/* Popular Attractions */}
            {countdownData.settings.showAttractions && (
              <AttractionsSection selectedPark={countdownData.selectedPark} />
            )}

            {/* Tips Section */}
            {countdownData.settings.showTips && (
              <TipsSection />
            )}
          </div>
        )}
      </div>
    </div>
  )
})

CountdownTimer.displayName = 'CountdownTimer'

export default CountdownTimer