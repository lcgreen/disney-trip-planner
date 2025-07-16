"use client";

import { Pencil } from 'lucide-react'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Sparkles, Settings, Share2, Code, Copy, Download, Upload, Palette, Volume2, VolumeX, RefreshCw, Star, ChevronDown, ChevronUp } from 'lucide-react'
import { format, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, addDays, addHours } from 'date-fns'
import {
  Panel,
  SavedItemsPanel,
  SettingsPanel,
  Badge,
  CountBadge,
  ParkBadge,
  Toggle,
  SettingToggle,
  Select,
  Checkbox,
  SettingsCheckbox,
  StatCard,
  CountdownStat,
  AutoSaveIndicator
} from '@/components/ui'
import { getSafeTextColor } from '@/lib/utils'
import {
  getAllParks,
  getAllThemes,
  getQuickDateOptions,
  getParkById,
  getThemeById,
  calculateQuickDate,
  type DisneyPark,
  type CountdownPalette
} from '@/config'
import { WidgetConfigManager } from '@/lib/widgetConfig'
import { useAutoSave } from '@/hooks/useAutoSave'
import { AutoSaveService } from '@/lib/autoSaveService'
import { CountdownData, CountdownSettings } from '@/types'

interface CountdownTimerData {
  days: number
  hours: number
  minutes: number
  seconds: number
}

// Get configuration data
const disneyParks = getAllParks()
const customThemes = getAllThemes()
const quickDateOptions = getQuickDateOptions().map(option => ({
  label: option.label,
  days: () => calculateQuickDate(option)
}))

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
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(name)
  useEffect(() => {
    setEditedName(name)
  }, [name])
  const handleNameEdit = () => {
    setIsEditingName(true)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedName(e.target.value)
  }

  const handleNameBlur = () => {
    setIsEditingName(false)
    if (editedName.trim() && editedName !== name) {
      onNameChange?.(editedName.trim())
    } else {
      setEditedName(name)
    }
  }

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur()
    } else if (e.key === 'Escape') {
      setIsEditingName(false)
      setEditedName(name)
    }
  }
  const [targetDate, setTargetDate] = useState<string>('')
  const [selectedPark, setSelectedPark] = useState<DisneyPark | null>(disneyParks[0] || null)
  const [countdown, setCountdown] = useState<CountdownTimerData>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [milliseconds, setMilliseconds] = useState<number>(0)
  const [isActive, setIsActive] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showEmbed, setShowEmbed] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [customTheme, setCustomTheme] = useState<CountdownPalette | null>(null)
  // Remove countdownName and savedCountdowns state
  // Use props.name and props.savedCountdowns instead
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [settings, setSettings] = useState<CountdownSettings>({
    showMilliseconds: false,
    showTimezone: true,
    showTips: true,
    showAttractions: true,
    playSound: true,
    autoRefresh: true,
    digitStyle: 'modern',
    layout: 'horizontal',
    fontSize: 'medium',
    backgroundEffect: 'gradient'
  })

  // Load saved data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('disney-countdowns')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Handle both old format (array) and new format (object with countdowns property)
        const countdowns = Array.isArray(parsed) ? parsed : (parsed.countdowns || [])
        // setSavedCountdowns(countdowns) // This state is now managed by parent
      } catch (error) {
        console.error('Error loading countdowns:', error)
        // setSavedCountdowns([]) // This state is now managed by parent
      }
    }

    // Only load saved settings if we're not creating a new countdown
    // This prevents new countdowns from inheriting previous settings
    if (isEditMode) {
      const savedSettings = localStorage.getItem('disney-countdown-settings')
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    }
  }, [isEditMode])

  // Save settings to localStorage
  useEffect(() => {
    // Check if user has save permissions before saving settings
    try {
      const { userManager } = require('@/lib/userManagement')
      if (userManager.hasFeatureAccess('saveData')) {
        localStorage.setItem('disney-countdown-settings', JSON.stringify(settings))
      }
    } catch (error) {
      console.warn('Could not check user permissions for settings save')
    }
  }, [settings])

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

  // Ensure selectedPark is always initialized with a valid park
  useEffect(() => {
    if (!selectedPark && disneyParks.length > 0) {
      setSelectedPark(disneyParks[0])
    }
  }, [selectedPark])

  // Load created item in edit mode
  useEffect(() => {
    if (isEditMode && createdItemId) {
      const countdown = WidgetConfigManager.getSelectedItemData('countdown', createdItemId) as CountdownData
      if (countdown) {
        // Convert ISO date string to local datetime format for the input
        const date = new Date(countdown.tripDate)
        if (!isNaN(date.getTime())) {
          const localDateTime = date.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:mm
          setTargetDate(localDateTime)
        } else {
          console.warn('Invalid trip date found in countdown data:', countdown.tripDate)
          setTargetDate('')
        }
        // Ensure we get the complete park object with all properties
        const fullPark = getParkById(countdown.park?.id) || countdown.park
        setSelectedPark(fullPark)
        setSettings(countdown.settings || {
          showMilliseconds: false,
          showTimezone: true,
          showTips: true,
          showAttractions: true,
          playSound: true,
          autoRefresh: true,
          digitStyle: 'modern',
          layout: 'horizontal',
          fontSize: 'medium',
          backgroundEffect: 'gradient'
        })
        setCustomTheme(countdown.theme || null)
        // setCountdownName(countdown.name) // This state is now managed by parent
      }
    }
  }, [isEditMode, createdItemId])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && targetDate) {
      const updateCountdown = () => {
        const now = new Date()
        const target = new Date(targetDate)

        // Check if the date is valid
        if (isNaN(target.getTime())) {
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
          setMilliseconds(0)
          setIsActive(false)
          return
        }

        if (target > now) {
          const days = differenceInDays(target, now)
          const hours = differenceInHours(target, now) % 24
          const minutes = differenceInMinutes(target, now) % 60
          const seconds = differenceInSeconds(target, now) % 60
          const ms = Math.floor((target.getTime() - now.getTime()) % 1000)

          setCountdown({ days, hours, minutes, seconds })
          setMilliseconds(ms)
        } else {
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
          setMilliseconds(0)
          setIsActive(false)

          // Play completion sound
          if (settings.playSound && audioRef.current) {
            audioRef.current.play().catch(error => {
              console.warn('Failed to play completion sound:', error)
            })
          }
        }
      }

      updateCountdown()
      interval = setInterval(updateCountdown, settings.showMilliseconds ? 100 : 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, targetDate, settings.showMilliseconds, settings.playSound])

    // Auto-save functionality for widget editing
  const autoSaveData = widgetId && isEditMode && targetDate ? {
    id: createdItemId || activeCountdown?.id || Date.now().toString(),
    name: editedName || name || 'New Countdown',
    tripDate: targetDate, // <-- use tripDate everywhere
    park: selectedPark,
    settings,
    theme: customTheme || undefined,
    createdAt: activeCountdown?.createdAt || new Date().toISOString()
  } : null

  const { forceSave, isSaving, lastSaved, error } = useAutoSave(
    autoSaveData,
    async (data) => {
      if (data) {
        console.log('[AutoSave] Attempting to save countdown data:', data)
        await AutoSaveService.saveCountdownData(data, widgetId || undefined)
      }
    },
    {
      enabled: !!autoSaveData,
      delay: 1000, // 1 second delay
      onSave: () => {
        console.log('[AutoSave] Successfully auto-saved countdown changes')
      },
      onError: (error) => {
        console.error('[AutoSave] Auto-save failed:', error)
      }
    }
  )

  // Debug logging for auto-save conditions
  useEffect(() => {
    console.log('[AutoSave Debug] Conditions:', {
      widgetId,
      isEditMode,
      hasActiveCountdown: !!activeCountdown,
      hasAutoSaveData: !!autoSaveData,
      autoSaveEnabled: !!autoSaveData,
      autoSaveData: autoSaveData,
      targetDate,
      hasTargetDate: !!targetDate
    })
  }, [widgetId, isEditMode, activeCountdown, autoSaveData, targetDate])

  // Manual trigger for testing auto-save
  useEffect(() => {
    if (widgetId && isEditMode && targetDate) {
      console.log('[AutoSave] Manual trigger - conditions met for auto-save')
    }
  }, [widgetId, isEditMode, targetDate])

  const handleStartCountdown = (): void => {
    if (targetDate) {
      setIsActive(true)
    }
  }



  const formatTargetDate = (): string => {
    if (!targetDate) return ''
    const date = new Date(targetDate)
    if (isNaN(date.getTime())) return 'Invalid Date'
    return format(date, 'EEEE, do MMMM yyyy \'at\' HH:mm')
  }

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
        tripDate: targetDate, // <-- use tripDate
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
        tripDate: targetDate, // <-- use tripDate
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

  const loadCountdown = (saved: CountdownData): void => {
    // Ensure we get the complete park object with all properties
    const fullPark = getParkById(saved.park?.id) || saved.park
    setSelectedPark(fullPark)

    // Convert ISO date string to local datetime format for the input
    const date = new Date(saved.tripDate)
    if (!isNaN(date.getTime())) {
      const localDateTime = date.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:mm
      setTargetDate(localDateTime)
    } else {
      console.warn('Invalid trip date found in saved countdown data:', saved.tripDate)
      setTargetDate('')
    }

    setSettings(saved.settings || {
      showMilliseconds: false,
      showTimezone: true,
      showTips: true,
      showAttractions: true,
      playSound: true,
      autoRefresh: true,
      digitStyle: 'modern',
      layout: 'horizontal',
      fontSize: 'medium',
      backgroundEffect: 'gradient'
    })
    setCustomTheme(saved.theme || null)
    setShowSaved(false)
    onLoad?.(saved)
  }

  const deleteCountdown = (id: string): void => {
    // setSavedCountdowns(savedCountdowns.filter(c => c.id !== id)) // This state is now managed by parent
    // localStorage.setItem('disney-countdowns', JSON.stringify({ countdowns: updated })) // This state is now managed by parent

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

    // setSavedCountdowns([]) // This state is now managed by parent
    localStorage.setItem('disney-countdowns', JSON.stringify({ countdowns: [] }))
  }

  const currentTheme = customTheme || {
    gradient: selectedPark?.gradient,
    textColor: 'text-white',
    digitBg: 'bg-white/20'
  }

  const getDigitClassName = (): string => {
    const base = "p-4 rounded-xl backdrop-blur-sm"
    const style = settings.digitStyle

    let classes = base

    // Style variations
    switch (style) {
      case 'classic':
        classes += ` ${currentTheme.digitBg} border border-white/30`
        break
      case 'neon':
        classes += ` bg-black/40 border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]`
        break
      case 'minimal':
        classes += ` bg-transparent border-b-2 border-white/50`
        break
      default: // modern
        classes += ` ${currentTheme.digitBg} shadow-xl`
    }

    return classes
  }

  const getLayoutClassName = (): string => {
    switch (settings.layout) {
      case 'vertical':
        return 'flex flex-col gap-4'
      case 'compact':
        return 'flex gap-2 justify-center'
      case 'grid':
        return 'grid grid-cols-2 gap-4'
      default: // horizontal
        return 'grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6'
    }
  }

  const getFontSizeClass = (): string => {
    switch (settings.fontSize) {
      case 'small': return 'text-2xl md:text-3xl'
      case 'large': return 'text-5xl md:text-6xl'
      case 'xl': return 'text-6xl md:text-8xl'
      default: return 'text-3xl md:text-4xl lg:text-5xl'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Audio element for completion sound */}
      <audio ref={audioRef} preload="auto" aria-label="Countdown completion sound">
        <source src="/sounds/disney-chime.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header with Improved Typography */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 flex items-center justify-center gap-2">
            <span className="bg-gradient-to-r from-disney-blue via-disney-purple to-disney-pink bg-clip-text text-transparent">
              Disney Countdown Timer
            </span>
          </h1>
          {/* Editable Countdown Name */}
          {name && (
            <div className="flex items-center justify-center gap-2 mt-2">
              {isEditingName ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={handleNameChange}
                  onBlur={handleNameBlur}
                  onKeyDown={handleNameKeyDown}
                  className="text-2xl md:text-3xl font-bold text-center border-b-2 border-disney-blue bg-transparent focus:outline-none px-2 min-w-[120px]"
                  autoFocus
                />
              ) : (
                <>
                  <span className="text-2xl md:text-3xl font-bold text-gray-800">{name}</span>
                  <button
                    type="button"
                    className="ml-1 p-1 rounded hover:bg-gray-100"
                    onClick={handleNameEdit}
                    title="Edit name"
                  >
                    <Pencil className="w-5 h-5 text-gray-500" />
                  </button>
                </>
              )}
            </div>
          )}
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Count down to your magical Disney adventure with style and excitement
          </p>

          {/* Auto-save indicator for widget editing */}
          {widgetId && isEditMode && (
            <div className="mt-4 flex justify-center">
              <AutoSaveIndicator
                isSaving={isSaving}
                lastSaved={lastSaved}
                error={error}
                className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm"
              />
            </div>
          )}
        </motion.div>

        {/* Control Panel with Better Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8"
        >
          <div className="flex flex-wrap gap-3 justify-center items-center">
            {/* Removed Saved button as requested */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`btn-secondary flex items-center gap-2 ${showSettings ? 'bg-disney-blue text-white' : ''}`}
            >
              <Settings className="w-4 h-4" />
              Customise
            </button>
            <button
              onClick={() => setShowEmbed(!showEmbed)}
              className={`btn-secondary flex items-center gap-2 ${showEmbed ? 'bg-disney-blue text-white' : ''}`}
            >
              <Share2 className="w-4 h-4" />
              Embed
            </button>
          </div>
        </motion.div>

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
                          <ParkBadge park={saved.park.name} />
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                          {(() => {
                            const date = new Date(saved.tripDate)
                            return isNaN(date.getTime()) ? 'Invalid Date' : format(date, 'do MMM yyyy \'at\' HH:mm')
                          })()}
                        </p>
                        <button
                          onClick={() => loadCountdown(saved)}
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
                        />
                        <SettingToggle
                          setting="Show timezone"
                          checked={settings.showTimezone}
                          onChange={(checked: boolean) => setSettings(prev => ({ ...prev, showTimezone: checked }))}
                        />
                        <SettingToggle
                          setting="Show planning tips"
                          checked={settings.showTips}
                          onChange={(checked: boolean) => setSettings(prev => ({ ...prev, showTips: checked }))}
                        />
                        <SettingToggle
                          setting="Show attractions"
                          checked={settings.showAttractions}
                          onChange={(checked: boolean) => setSettings(prev => ({ ...prev, showAttractions: checked }))}
                        />
                        <SettingToggle
                          setting="Play completion sound"
                          checked={settings.playSound}
                          onChange={(checked: boolean) => setSettings(prev => ({ ...prev, playSound: checked }))}
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
                            onValueChange={(value: string) => setSettings(prev => ({ ...prev, digitStyle: value as CountdownSettings['digitStyle'] }))}
                            options={[
                              { value: 'modern', label: 'Modern' },
                              { value: 'classic', label: 'Classic' },
                              { value: 'neon', label: 'Neon' },
                              { value: 'minimal', label: 'Minimal' }
                            ]}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
                          <Select
                            defaultValue={settings.layout}
                            value={settings.layout}
                            onValueChange={(value: string) => setSettings(prev => ({ ...prev, layout: value as CountdownSettings['layout'] }))}
                            options={[
                              { value: 'horizontal', label: 'Horizontal' },
                              { value: 'vertical', label: 'Vertical' },
                              { value: 'compact', label: 'Compact' },
                              { value: 'grid', label: 'Grid' }
                            ]}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                          <Select
                            defaultValue={settings.fontSize}
                            value={settings.fontSize}
                            onValueChange={(value: string) => setSettings(prev => ({ ...prev, fontSize: value as CountdownSettings['fontSize'] }))}
                            options={[
                              { value: 'small', label: 'Small' },
                              { value: 'medium', label: 'Medium' },
                              { value: 'large', label: 'Large' },
                              { value: 'xl', label: 'Extra Large' }
                            ]}
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
          {/* Park Selection with Improved Layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8"
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3 text-gray-800">
              <MapPin className="w-6 h-6 text-disney-blue" />
              Choose Your Disney Destination
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {disneyParks.map((park) => (
                <motion.button
                  key={park.id}
                  onClick={() => setSelectedPark(park)}
                  className={`group p-5 rounded-xl border-2 transition-all duration-300 ${
                    selectedPark?.id === park.id
                      ? `border-transparent bg-gradient-to-r ${park.gradient} text-white shadow-xl`
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-left">
                    <div className="font-bold text-lg mb-1">{park.name}</div>
                    <div className={`text-sm mb-2 ${selectedPark?.id === park.id ? 'text-white/90' : 'text-gray-600'}`}>
                      {park.location}
                    </div>
                    {settings.showTimezone && (
                      <div className={`text-xs ${selectedPark?.id === park.id ? 'text-white/75' : 'text-gray-500'}`}>
                        Opens: {park.openingTime} ({park.timezone.split('/')[1]})
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Date Selection with Enhanced UI */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8"
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3 text-gray-800">
              <Calendar className="w-6 h-6 text-disney-purple" />
              When is your magical trip?
            </h3>

            {/* Quick Date Options */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Quick Select
              </label>
              <div className="flex flex-wrap gap-2">
                {quickDateOptions.map((option) => (
                  <Badge
                    key={option.label}
                    variant="disney"
                    size="sm"
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => {
                      const date = option.days()
                      if (date && !isNaN(date.getTime())) {
                        date.setHours(9, 0, 0, 0)
                        setTargetDate(date.toISOString().slice(0, 16))
                        // Automatically start countdown when quick date is selected
                        setIsActive(true)
                      } else {
                        console.warn('Invalid date returned from quick date option:', option.label)
                      }
                    }}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Trip Date & Time
                </label>
                                 <input
                   type="datetime-local"
                   value={targetDate}
                   onChange={(e) => {
                     setTargetDate(e.target.value)
                     if (e.target.value) {
                       // Automatically start countdown when date is selected
                       const selectedDate = new Date(e.target.value)
                       if (selectedDate > new Date()) {
                         setIsActive(true)
                       }
                     }
                   }}
                   min={(() => {
                     const now = new Date()
                     return !isNaN(now.getTime()) ? now.toISOString().slice(0, 16) : ''
                   })()}
                   className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-disney-blue focus:border-disney-blue transition-all duration-300 text-lg"
                   aria-label="Select your Disney trip date and time"
                 />
              </div>

            </div>


          </motion.div>

          {/* Enhanced Countdown Display */}
          {targetDate && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className={`text-center p-8 md:p-12 rounded-2xl bg-gradient-to-r ${currentTheme.gradient} ${currentTheme.textColor} relative overflow-hidden shadow-2xl`}
             role="timer"
             aria-live="polite"
             aria-label={`Disney countdown timer showing ${countdown.days} days, ${countdown.hours} hours, ${countdown.minutes} minutes, and ${countdown.seconds} seconds until your trip to ${selectedPark?.name || 'Disney'}`}
            >
              {/* Enhanced Background decorations */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-8 left-8">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="absolute top-8 right-8">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="absolute bottom-8 left-1/4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="absolute bottom-8 right-1/4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="absolute top-1/2 left-8">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="absolute top-1/2 right-8">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h2 className="text-xl md:text-2xl font-semibold mb-2 opacity-90">Your Trip to</h2>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{selectedPark?.name || 'Disney'}</h1>
                  <p className="text-lg md:text-xl opacity-90 mb-8">{formatTargetDate()}</p>
                </motion.div>

                {isActive ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className={`${getLayoutClassName()} mb-8`}
                  >
                    <div className={getDigitClassName()}>
                      <div className={`${getFontSizeClass()} font-bold`}>{countdown.days}</div>
                      <div className="text-sm md:text-base opacity-80 mt-2">Days</div>
                    </div>
                    <div className={getDigitClassName()}>
                      <div className={`${getFontSizeClass()} font-bold`}>{countdown.hours}</div>
                      <div className="text-sm md:text-base opacity-80 mt-2">Hours</div>
                    </div>
                    <div className={getDigitClassName()}>
                      <div className={`${getFontSizeClass()} font-bold`}>{countdown.minutes}</div>
                      <div className="text-sm md:text-base opacity-80 mt-2">Minutes</div>
                    </div>
                    <div className={getDigitClassName()}>
                      <div className={`${getFontSizeClass()} font-bold`}>{countdown.seconds}</div>
                      <div className="text-sm md:text-base opacity-80 mt-2">Seconds</div>
                    </div>
                    {settings.showMilliseconds && (
                      <div className={getDigitClassName()}>
                        <div className={`${getFontSizeClass()} font-bold`}>{Math.floor(milliseconds / 10)}</div>
                        <div className="text-sm md:text-base opacity-80 mt-2">Centiseconds</div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-8"
                  >
                                         <p className="text-xl md:text-2xl">Select a date to start your countdown! ✨</p>
                  </motion.div>
                )}

                {countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0 && isActive && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="text-center"
                  >
                                         <h2 className="text-3xl md:text-4xl font-bold mb-4">🎉 IT&rsquo;S DISNEY DAY! 🎉</h2>
                    <p className="text-xl md:text-2xl">Your magical adventure begins now!</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom Content with Improved Layout */}
        {targetDate && (
          <div className="space-y-8 mt-8">
            {/* Popular Attractions */}
            {settings.showAttractions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8"
              >
                <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
                  🎢 Must-Do Attractions at {selectedPark?.name || 'Disney'}
                </h3>
                                  {selectedPark?.subParks ? (
                  // Show grouped attractions for resort complexes
                  <div className="space-y-6">
                                          {selectedPark?.subParks?.map((subPark, parkIndex) => (
                      <motion.div
                        key={subPark.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + parkIndex * 0.2 }}
                        className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden"
                      >
                        {/* Park Header */}
                        <div className={`p-4 bg-gradient-to-r ${subPark.gradient} text-white`}>
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{subPark.icon}</div>
                            <div>
                              <h4 className="font-bold text-lg">{subPark.name}</h4>
                              <p className="text-sm opacity-90">{subPark.description}</p>
                            </div>
                          </div>
                        </div>

                        {/* Attractions Grid */}
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {subPark.popularAttractions.map((attraction, index) => (
                              <motion.div
                                key={attraction}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 + parkIndex * 0.2 + index * 0.1 }}
                                className={`p-4 rounded-lg bg-gradient-to-r ${subPark.gradient} text-white shadow-lg hover:shadow-xl transition-all duration-300`}
                              >
                                <div className="flex items-center gap-3">
                                  <CountBadge
                                    count={index + 1}
                                    className="bg-white/30 text-white border-white/50 text-base font-bold drop-shadow-sm"
                                  />
                                  <span className="font-semibold text-base drop-shadow-sm">{attraction}</span>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  // Show regular attractions for individual parks
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(selectedPark?.popularAttractions || []).map((attraction, index) => (
                      <motion.div
                        key={attraction}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className={`p-5 rounded-xl bg-gradient-to-r ${selectedPark?.gradient || 'from-disney-blue to-disney-purple'} text-white shadow-lg hover:shadow-xl transition-all duration-300`}
                      >
                        <div className="flex items-center gap-4">
                          <CountBadge
                            count={index + 1}
                            className="bg-white/20 text-white border-white/30 text-lg font-bold"
                          />
                          <span className="font-semibold text-lg">{attraction}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Tips Section */}
            {settings.showTips && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8"
              >
                <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
                  💡 Disney Planning Timeline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl"
                  >
                    <h4 className="font-bold text-disney-blue mb-3 text-lg">60+ Days Before</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">Book dining reservations, plan your itinerary, book Genie+ if desired</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl"
                  >
                    <h4 className="font-bold text-disney-purple mb-3 text-lg">30 Days Before</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">Check park hours, book Lightning Lanes for popular attractions</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl"
                  >
                    <h4 className="font-bold text-disney-green mb-3 text-lg">7 Days Before</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">Check weather forecast, finalise packing list, mobile order setup</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl"
                  >
                    <h4 className="font-bold text-disney-orange mb-3 text-lg">Day Before</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">Download Disney app, check park opening times, prepare for early start</p>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-l-4 border-yellow-400"
                >
                  <h4 className="font-bold text-yellow-800 mb-3 text-lg">💰 Money-Saving Tip</h4>
                  <p className="text-yellow-700 leading-relaxed">
                    Book your trip during off-peak times (mid-January to mid-March, late April to mid-May) for cheaper accommodation and shorter queues!
                  </p>
                </motion.div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}