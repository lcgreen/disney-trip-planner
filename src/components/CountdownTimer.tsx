"use client";

import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { AnimatePresence } from 'framer-motion'
import { CountdownData } from '@/types'
import { useReduxCountdown } from '@/hooks/useReduxCountdown'
import { useReduxUser } from '@/hooks/useReduxUser'
import { useReduxWidgets } from '@/hooks/useReduxWidgets'
import { useCountdownTimer } from '@/hooks/useCountdownTimer'
import {
  ControlPanel,
  SettingsPanel,
  EmbedPanel,
  CountdownContent
} from '@/components/countdown'

interface CountdownTimerProps {
  createdItemId?: string | null
  isEditMode?: boolean
  name?: string
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
  isEditMode = false,
  name = '',
  onSave,
  activeCountdown = null,
  setCanSave
}, ref) => {
  const [showSettings, setShowSettings] = useState(false)
  const [showEmbed, setShowEmbed] = useState(false)

  const {
    currentCountdown,
    countdownData,
    loadCountdown,
    setTargetDate,
    setSelectedPark,
    setSettings,
    setCustomTheme,
    startCountdown,
    setCurrentCountdown
  } = useReduxCountdown()

  const audioRef = useRef<HTMLAudioElement>(null)
  const displayName = name || currentCountdown?.name || ''

  // Load initial data
  useEffect(() => {
    if (isEditMode && activeCountdown) {
      loadCountdown(activeCountdown)
      setCurrentCountdown(activeCountdown)
    }
  }, [isEditMode, activeCountdown?.id, loadCountdown, setCurrentCountdown])

  // Set default date on client side to avoid hydration mismatch
  useEffect(() => {
    if (!countdownData.targetDate) {
      const defaultDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
      setTargetDate(defaultDate)
      startCountdown()
    }
  }, [countdownData.targetDate, setTargetDate, startCountdown])

  // Update parent when data changes
  useEffect(() => {
    if (onSave) {
      onSave({
        name: displayName.trim(),
        park: countdownData.selectedPark,
        tripDate: countdownData.targetDate,
        settings: countdownData.settings,
        theme: countdownData.customTheme || undefined,
      })
    }
    const hasChanges = countdownData.targetDate || countdownData.selectedPark || Object.keys(countdownData.settings).length > 0
    setCanSave?.(hasChanges && displayName.trim().length > 0)
  }, [countdownData.targetDate, countdownData.selectedPark, countdownData.settings, countdownData.customTheme, displayName, onSave, setCanSave])

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    saveCurrentCountdown: () => {
      // This is handled by PluginPageWrapper now
    },
    loadCountdown: (countdown: CountdownData) => {
      loadCountdown(countdown)
      setCurrentCountdown(countdown)
    }
  }))

  const handleStartCountdown = (): void => {
    if (countdownData.targetDate) {
      startCountdown()
    }
  }

  const handleSettingChange = (key: string, value: any): void => {
    setSettings({ ...countdownData.settings, [key]: value })
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
      audioRef.current.play().catch(() => {
        // Handle audio play error silently
      })
    }
  }, [countdownData.isActive, countdownData.countdown.total, countdownData.settings.playSound])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <audio ref={audioRef} preload="auto" aria-label="Countdown completion sound">
        <source src="/sounds/disney-chime.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ControlPanel
          showSettings={showSettings}
          showEmbed={showEmbed}
          onToggleSettings={() => setShowSettings(!showSettings)}
          onToggleEmbed={() => setShowEmbed(!showEmbed)}
        />

        <div className="space-y-6 mb-8">
          <AnimatePresence>
            <SettingsPanel
              showSettings={showSettings}
              settings={countdownData.settings}
              customTheme={countdownData.customTheme}
              onSettingChange={handleSettingChange}
              onThemeChange={setCustomTheme}
            />
          </AnimatePresence>

          <AnimatePresence>
            <EmbedPanel
              showEmbed={showEmbed}
              selectedPark={countdownData.selectedPark}
              targetDate={countdownData.targetDate}
              customTheme={countdownData.customTheme}
              settings={countdownData.settings}
            />
          </AnimatePresence>
        </div>

        <CountdownContent
          countdownData={countdownData}
          onParkSelect={setSelectedPark}
          onDateChange={setTargetDate}
          onStartCountdown={handleStartCountdown}
        />
      </div>
    </div>
  )
})

CountdownTimer.displayName = 'CountdownTimer'

export default CountdownTimer