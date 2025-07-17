import { useState, useEffect, useRef } from 'react'
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns'
import { getAllParks, getParkById, type DisneyPark } from '@/config'
import { CountdownSettings, CountdownData } from '@/types'
import { WidgetConfigManager } from '@/lib/widgetConfig'

export interface CountdownTimerData {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const defaultSettings: CountdownSettings = {
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
}

export function useCountdownState(
  isEditMode: boolean,
  createdItemId: string | null,
  activeCountdown: CountdownData | null
) {
  const disneyParks = getAllParks()

  // Core state
  const [targetDate, setTargetDate] = useState<string>('')
  const [selectedPark, setSelectedPark] = useState<DisneyPark | null>(disneyParks[0] || null)
  const [countdown, setCountdown] = useState<CountdownTimerData>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [milliseconds, setMilliseconds] = useState<number>(0)
  const [isActive, setIsActive] = useState(false)
  const [settings, setSettings] = useState<CountdownSettings>(defaultSettings)
  const [customTheme, setCustomTheme] = useState<any>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Load saved settings from localStorage
  useEffect(() => {
    if (isEditMode) {
      const savedSettings = localStorage.getItem('disney-countdown-settings')
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings))
        } catch (error) {
          console.warn('Failed to parse saved settings:', error)
        }
      }
    }
  }, [isEditMode])

  // Save settings to localStorage
  useEffect(() => {
    try {
      const { userManager } = require('@/lib/userManagement')
      if (userManager.hasFeatureAccess('saveData')) {
        localStorage.setItem('disney-countdown-settings', JSON.stringify(settings))
      }
    } catch (error) {
      console.warn('Could not check user permissions for settings save')
    }
  }, [settings])

  // Ensure selectedPark is always initialized
  useEffect(() => {
    if (!selectedPark && disneyParks.length > 0) {
      setSelectedPark(disneyParks[0])
    }
  }, [selectedPark, disneyParks])

  // Ensure countdown is active if both date and park are set and date is in the future
  useEffect(() => {
    if (targetDate && selectedPark) {
      const selectedDate = new Date(targetDate)
      if (selectedDate > new Date()) {
        setIsActive(true)
      }
    }
  }, [targetDate, selectedPark])

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
        setSettings(countdown.settings || defaultSettings)
        setCustomTheme(countdown.theme || null)
      }
    }
  }, [isEditMode, createdItemId])

  // Countdown timer logic
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

  const handleStartCountdown = (): void => {
    if (targetDate) {
      setIsActive(true)
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

    setSettings(saved.settings || defaultSettings)
    setCustomTheme(saved.theme || null)
  }

  return {
    // State
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

    // Actions
    handleStartCountdown,
    loadCountdown,

    // Computed
    disneyParks
  }
}