'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { format, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns'
import { useSearchParams } from 'next/navigation'
import {
  getAllParks,
  getAllThemes,
  getParkById,
  getThemeById,
  type DisneyPark,
  type CountdownTheme
} from '@/config'

interface CountdownData {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface CountdownSettings {
  showMilliseconds: boolean
  showTimezone: boolean
  showTips: boolean
  showAttractions: boolean
  playSound: boolean
  autoRefresh: boolean
  digitStyle: 'modern' | 'classic' | 'neon' | 'minimal'
  layout: 'horizontal' | 'vertical' | 'compact' | 'grid'
  fontSize: 'small' | 'medium' | 'large' | 'xl'
  backgroundEffect: 'none' | 'particles' | 'gradient' | 'animated'
}

// Get configuration data
const disneyParks = getAllParks()
const customThemes = getAllThemes()

function EmbedCountdown(): JSX.Element {
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState<CountdownData>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [milliseconds, setMilliseconds] = useState<number>(0)
  const [isActive, setIsActive] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Parse URL parameters
  const parkId = searchParams.get('park') || 'magic-kingdom'
  const targetDate = searchParams.get('date') || ''
  const themeId = searchParams.get('theme') || 'classic'
  const settingsParam = searchParams.get('settings')

  const selectedPark = getParkById(parkId) || disneyParks[0]
  const customTheme = getThemeById(themeId) || customThemes[0]

  let settings: CountdownSettings = {
    showMilliseconds: false,
    showTimezone: false,
    showTips: false,
    showAttractions: false,
    playSound: false,
    autoRefresh: true,
    digitStyle: 'modern',
    layout: 'horizontal',
    fontSize: 'medium',
    backgroundEffect: 'gradient'
  }

  try {
    if (settingsParam) {
      settings = { ...settings, ...JSON.parse(decodeURIComponent(settingsParam)) }
    }
  } catch (e) {
    console.warn('Failed to parse settings from URL:', e)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && targetDate) {
      const updateCountdown = () => {
        const now = new Date()
        const target = new Date(targetDate)

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
            audioRef.current.play()
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

  const formatTargetDate = (): string => {
    if (!targetDate) return ''
    const date = new Date(targetDate)
    return format(date, 'EEEE, do MMMM yyyy \'at\' HH:mm')
  }

  const currentTheme = customTheme || {
    gradient: selectedPark.gradient,
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
      case 'small': return 'text-xl md:text-2xl'
      case 'large': return 'text-4xl md:text-5xl'
      case 'xl': return 'text-5xl md:text-6xl'
      default: return 'text-2xl md:text-3xl lg:text-4xl'
    }
  }

  if (!targetDate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 max-w-md"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Disney Countdown Timer</h1>
          <p className="text-gray-600 mb-4">No countdown data provided.</p>
          <p className="text-sm text-gray-500">This embed requires valid URL parameters.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      {/* Audio element for completion sound */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/disney-chime.mp3" type="audio/mpeg" />
      </audio>

      <div className="max-w-5xl mx-auto flex items-center justify-center min-h-screen">
        {/* Enhanced Countdown Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className={`text-center p-8 md:p-12 rounded-2xl bg-gradient-to-r ${currentTheme.gradient} ${currentTheme.textColor} relative overflow-hidden shadow-2xl w-full`}
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
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg md:text-xl font-semibold mb-2 opacity-90">Your Trip to</h2>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">{selectedPark.name}</h1>
              <p className="text-sm md:text-base lg:text-lg opacity-90 mb-6">{formatTargetDate()}</p>
            </motion.div>

            {settings.showTimezone && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs md:text-sm opacity-75 mb-6"
              >
                Park opens at {selectedPark.openingTime} ({selectedPark.timezone.split('/')[1]} time)
              </motion.p>
            )}

            {isActive ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`${getLayoutClassName()} mb-8`}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                  className={getDigitClassName()}
                >
                  <div className={`${getFontSizeClass()} font-bold`}>{countdown.days}</div>
                  <div className="text-xs md:text-sm opacity-80 mt-2">Days</div>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
                  className={getDigitClassName()}
                >
                  <div className={`${getFontSizeClass()} font-bold`}>{countdown.hours}</div>
                  <div className="text-xs md:text-sm opacity-80 mt-2">Hours</div>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: "spring", stiffness: 300 }}
                  className={getDigitClassName()}
                >
                  <div className={`${getFontSizeClass()} font-bold`}>{countdown.minutes}</div>
                  <div className="text-xs md:text-sm opacity-80 mt-2">Minutes</div>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
                  className={getDigitClassName()}
                >
                  <div className={`${getFontSizeClass()} font-bold`}>{countdown.seconds}</div>
                  <div className="text-xs md:text-sm opacity-80 mt-2">Seconds</div>
                </motion.div>
                {settings.showMilliseconds && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9, type: "spring", stiffness: 300 }}
                    className={getDigitClassName()}
                  >
                    <div className={`${getFontSizeClass()} font-bold`}>{Math.floor(milliseconds / 10)}</div>
                    <div className="text-xs md:text-sm opacity-80 mt-2">Centiseconds</div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <p className="text-lg md:text-xl">The magic awaits! ✨</p>
              </motion.div>
            )}

            {countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0 && isActive && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="text-center"
              >
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">🎉 IT&rsquo;S DISNEY DAY! 🎉</h2>
                <p className="text-lg md:text-xl">Your magical adventure begins now!</p>
              </motion.div>
            )}

            {/* Enhanced Powered by link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="mt-8 opacity-60"
            >
              <a
                href={typeof window !== 'undefined' ? window.location.origin : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs md:text-sm hover:opacity-80 transition-opacity duration-300 underline decoration-dotted underline-offset-4"
              >
                Powered by Disney Trip Planner ✨
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function EmbedCountdownPage(): JSX.Element {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-disney-blue mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-disney-purple animate-pulse" />
            </div>
          </div>
          <p className="text-gray-600 text-lg">Loading your Disney countdown...</p>
          <p className="text-gray-500 text-sm mt-2">Preparing the magic ✨</p>
        </motion.div>
      </div>
    }>
      <EmbedCountdown />
    </Suspense>
  )
}

export default EmbedCountdownPage