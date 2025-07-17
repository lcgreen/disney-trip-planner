"use client";

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code, Copy } from 'lucide-react'
import {
  Panel,
  SavedItemsPanel,
  SettingsPanel,
  SettingToggle,
  Select,
  AutoSaveIndicator
} from '@/components/ui'
import { getAllThemes } from '@/config'
import { WidgetConfigManager } from '@/lib/widgetConfig'
import { CountdownData } from '@/types'
import { useCountdownState } from '@/hooks/useCountdownState'
import { useCountdownAutoSave } from '@/hooks/useCountdownAutoSave'
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

export default function CountdownTimer({
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
}: CountdownTimerProps): JSX.Element {
  // UI state
  const [showSettings, setShowSettings] = useState(false)
  const [showEmbed, setShowEmbed] = useState(false)
  const [showSaved, setShowSaved] = useState(false)

  // Custom hooks
  const {
    targetDate,
    setTargetDate,
    selectedPark,
    setSelectedPark,
    countdown,
    milliseconds,
    isActive,
    settings,
    setSettings,
    customTheme,
    setCustomTheme,
    audioRef,
    handleStartCountdown,
    loadCountdown,
    disneyParks
  } = useCountdownState(isEditMode, createdItemId, activeCountdown)

  const {
    isEditingName,
    editedName,
    handleNameEdit,
    handleNameChange,
    handleNameBlur,
    handleNameKeyDown
  } = useEditableName({ name, onNameChange })

  const {
    forceSave,
    isSaving,
    lastSaved,
    error
  } = useCountdownAutoSave({
    widgetId,
    isEditMode,
    targetDate,
    createdItemId,
    activeCountdown,
    editedName,
    name,
    selectedPark,
    settings,
    customTheme
  })

  // Configuration data
  const customThemes = getAllThemes()

  // Auto-save current state for widgets (only when editing or when we have a valid countdown)
  useEffect(() => {
    if (targetDate && (isEditMode || createdItemId)) {
      // Convert the datetime-local format to a proper ISO string
      const date = new Date(targetDate)
      if (!isNaN(date.getTime())) {
        const isoString = date.toISOString()
        // State is now managed by PluginPageWrapper
      }
    }
  }, [targetDate, selectedPark, isEditMode, createdItemId])

  const getEmbedCode = (): string => {
    const embedUrl = `${window.location.origin}/embed/countdown?park=${selectedPark?.id || 'disney-world'}&date=${encodeURIComponent(targetDate)}&theme=${customTheme?.id || 'classic'}&settings=${encodeURIComponent(JSON.stringify(settings))}`
    return `<iframe src="${embedUrl}" width="800" height="600" frameborder="0" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"></iframe>`
  }

  const saveCountdown = (): void => {
    if (!name.trim()) return

    // If we're editing an existing item, update it
    if (isEditMode && createdItemId) {
      const updatedCountdown: CountdownData = {
        id: createdItemId,
        name: name.trim(),
        park: selectedPark,
        tripDate: targetDate,
        settings,
        theme: customTheme || undefined,
        createdAt: savedCountdowns?.find(c => c.id === createdItemId)?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      onSave?.(updatedCountdown)

      // Also update widget config manager data
      const date = new Date(targetDate)
      if (!isNaN(date.getTime())) {
        const isoString = date.toISOString()
        // State is now managed by PluginPageWrapper
      }
    } else {
      // Creating a new countdown
      const newCountdown: CountdownData = {
        id: Date.now().toString(),
        name: name.trim(),
        park: selectedPark,
        tripDate: targetDate,
        settings,
        theme: customTheme || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      onNew?.()

      // Check for pending widget links and auto-link if needed
      WidgetConfigManager.checkAndApplyPendingLinks(newCountdown.id, 'countdown')

      // Also update widget config manager data
      const date = new Date(targetDate)
      if (!isNaN(date.getTime())) {
        const isoString = date.toISOString()
        // State is now managed by PluginPageWrapper
      }
    }
  }

  const deleteCountdown = (id: string): void => {
    // Clean up widget configurations that reference this deleted item
    WidgetConfigManager.cleanupDeletedItemReferences(id, 'countdown')
  }

  const clearSavedCountdowns = (): void => {
    // Check if user has save permissions before clearing
    try {
      const { userManager } = require('@/lib/userManagement')
      if (!userManager.hasFeatureAccess('saveData')) {
        console.warn('Clear blocked: User does not have save permissions')
        return
      }
    } catch (error) {
      console.warn('Could not check user permissions for clear operation')
    }

    // Clean up widget configurations for all countdown items before clearing
    savedCountdowns?.forEach(countdown => {
      WidgetConfigManager.cleanupDeletedItemReferences(countdown.id, 'countdown')
    })

    localStorage.setItem('disney-countdowns', JSON.stringify({ countdowns: [] }))
  }

  const handleLoadCountdown = (saved: CountdownData): void => {
    loadCountdown(saved)
    setShowSaved(false)
    onLoad?.(saved)
  }

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
          isSaving={isSaving}
          lastSaved={lastSaved}
          error={error}
          forceSave={forceSave}
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
                  onClearAll={clearSavedCountdowns}
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
                            onClick={() => deleteCountdown(saved.id)}
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
                              customTheme?.id === theme.id
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
                          checked={settings.showMilliseconds}
                          onChange={(checked: boolean) => setSettings(prev => ({ ...prev, showMilliseconds: checked }))}
                          data-testid="setting-show-milliseconds"
                        />
                        <SettingToggle
                          setting="Show timezone"
                          checked={settings.showTimezone}
                          onChange={(checked: boolean) => setSettings(prev => ({ ...prev, showTimezone: checked }))}
                          data-testid="setting-show-timezone"
                        />
                        <SettingToggle
                          setting="Show planning tips"
                          checked={settings.showTips}
                          onChange={(checked: boolean) => setSettings(prev => ({ ...prev, showTips: checked }))}
                          data-testid="setting-show-tips"
                        />
                        <SettingToggle
                          setting="Show attractions"
                          checked={settings.showAttractions}
                          onChange={(checked: boolean) => setSettings(prev => ({ ...prev, showAttractions: checked }))}
                          data-testid="setting-show-attractions"
                        />
                        <SettingToggle
                          setting="Play completion sound"
                          checked={settings.playSound}
                          onChange={(checked: boolean) => setSettings(prev => ({ ...prev, playSound: checked }))}
                          data-testid="setting-play-sound"
                        />
                        <SettingToggle
                          setting="Auto refresh"
                          checked={settings.autoRefresh}
                          onChange={(checked: boolean) => setSettings(prev => ({ ...prev, autoRefresh: checked }))}
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
                            defaultValue={settings.digitStyle}
                            value={settings.digitStyle}
                            onValueChange={(value: string) => setSettings(prev => ({ ...prev, digitStyle: value as any }))}
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
                            defaultValue={settings.layout}
                            value={settings.layout}
                            onValueChange={(value: string) => setSettings(prev => ({ ...prev, layout: value as any }))}
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
                            defaultValue={settings.fontSize}
                            value={settings.fontSize}
                            onValueChange={(value: string) => setSettings(prev => ({ ...prev, fontSize: value as any }))}
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
                            defaultValue={settings.backgroundEffect}
                            value={settings.backgroundEffect}
                            onValueChange={(value: string) => setSettings(prev => ({ ...prev, backgroundEffect: value as any }))}
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
            disneyParks={disneyParks}
            selectedPark={selectedPark}
            onParkSelect={setSelectedPark}
            settings={settings}
          />

          {/* Date Selection */}
          <DateSelection
            targetDate={targetDate}
            onDateChange={setTargetDate}
            onStartCountdown={handleStartCountdown}
          />

          {/* Countdown Display */}
          {targetDate && (
            <CountdownDisplay
              targetDate={targetDate}
              selectedPark={selectedPark}
              countdown={countdown}
              milliseconds={milliseconds}
              isActive={isActive}
              settings={settings}
              customTheme={customTheme}
            />
          )}
        </div>

        {/* Bottom Content with Improved Layout */}
        {targetDate && (
          <div className="space-y-8 mt-8">
            {/* Popular Attractions */}
            {settings.showAttractions && (
              <AttractionsSection selectedPark={selectedPark} />
            )}

            {/* Tips Section */}
            {settings.showTips && (
              <TipsSection />
            )}
          </div>
        )}
      </div>
    </div>
  )
}