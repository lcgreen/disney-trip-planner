'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { format, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns'
import { useSearchParams } from 'next/navigation'

interface CountdownData {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface DisneyPark {
  id: string
  name: string
  location: string
  color: string
  gradient: string
  timezone: string
  openingTime: string
}

interface CountdownTheme {
  id: string
  name: string
  gradient: string
  textColor: string
  digitBg: string
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

const disneyParks: DisneyPark[] = [
  {
    id: 'magic-kingdom',
    name: 'Magic Kingdom',
    location: 'Walt Disney World, Florida',
    color: 'park-magic',
    gradient: 'from-blue-600 to-purple-600',
    timezone: 'America/New_York',
    openingTime: '09:00'
  },
  {
    id: 'epcot',
    name: 'EPCOT',
    location: 'Walt Disney World, Florida',
    color: 'park-epcot',
    gradient: 'from-purple-600 to-pink-600',
    timezone: 'America/New_York',
    openingTime: '09:00'
  },
  {
    id: 'hollywood-studios',
    name: "Hollywood Studios",
    location: 'Walt Disney World, Florida',
    color: 'park-hollywood',
    gradient: 'from-red-600 to-orange-600',
    timezone: 'America/New_York',
    openingTime: '09:00'
  },
  {
    id: 'animal-kingdom',
    name: 'Animal Kingdom',
    location: 'Walt Disney World, Florida',
    color: 'park-animal',
    gradient: 'from-green-600 to-teal-600',
    timezone: 'America/New_York',
    openingTime: '08:00'
  },
  {
    id: 'disneyland',
    name: 'Disneyland Park',
    location: 'Disneyland Resort, California',
    color: 'park-california',
    gradient: 'from-orange-600 to-red-600',
    timezone: 'America/Los_Angeles',
    openingTime: '08:00'
  },
  {
    id: 'disneyland-paris',
    name: 'Disneyland Paris',
    location: 'Marne-la-Vallée, France',
    color: 'park-paris',
    gradient: 'from-purple-600 to-blue-600',
    timezone: 'Europe/Paris',
    openingTime: '09:30'
  },
  {
    id: 'tokyo-disneyland',
    name: 'Tokyo Disneyland',
    location: 'Tokyo, Japan',
    color: 'park-tokyo',
    gradient: 'from-pink-600 to-red-600',
    timezone: 'Asia/Tokyo',
    openingTime: '08:00'
  },
  {
    id: 'shanghai-disneyland',
    name: 'Shanghai Disneyland',
    location: 'Shanghai, China',
    color: 'park-shanghai',
    gradient: 'from-blue-600 to-green-600',
    timezone: 'Asia/Shanghai',
    openingTime: '09:00'
  },
  {
    id: 'hong-kong-disneyland',
    name: 'Hong Kong Disneyland',
    location: 'Hong Kong',
    color: 'park-hongkong',
    gradient: 'from-green-600 to-blue-600',
    timezone: 'Asia/Hong_Kong',
    openingTime: '10:00'
  }
]

const customThemes: CountdownTheme[] = [
  {
    id: 'classic',
    name: 'Classic Disney',
    gradient: 'from-blue-600 to-purple-600',
    textColor: 'text-white',
    digitBg: 'bg-white/20'
  },
  {
    id: 'princess',
    name: 'Princess Pink',
    gradient: 'from-pink-500 to-rose-500',
    textColor: 'text-white',
    digitBg: 'bg-white/20'
  },
  {
    id: 'villains',
    name: 'Villains Dark',
    gradient: 'from-purple-900 to-black',
    textColor: 'text-purple-200',
    digitBg: 'bg-purple-800/30'
  },
  {
    id: 'pixar',
    name: 'Pixar Bright',
    gradient: 'from-yellow-400 to-orange-500',
    textColor: 'text-white',
    digitBg: 'bg-white/20'
  },
  {
    id: 'frozen',
    name: 'Frozen Ice',
    gradient: 'from-blue-200 to-blue-600',
    textColor: 'text-blue-900',
    digitBg: 'bg-white/40'
  },
  {
    id: 'marvel',
    name: 'Marvel Heroes',
    gradient: 'from-red-600 to-blue-800',
    textColor: 'text-white',
    digitBg: 'bg-white/20'
  }
]

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

  const selectedPark = disneyParks.find(p => p.id === parkId) || disneyParks[0]
  const customTheme = customThemes.find(t => t.id === themeId) || customThemes[0]

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
    const base = "p-3 rounded-lg backdrop-blur-sm"
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
        classes += ` ${currentTheme.digitBg} shadow-lg`
    }

    return classes
  }

  const getLayoutClassName = (): string => {
    switch (settings.layout) {
      case 'vertical':
        return 'flex flex-col gap-3'
      case 'compact':
        return 'flex gap-2 justify-center'
      case 'grid':
        return 'grid grid-cols-2 gap-3'
      default: // horizontal
        return 'grid grid-cols-2 md:grid-cols-4 gap-3'
    }
  }

  const getFontSizeClass = (): string => {
    switch (settings.fontSize) {
      case 'small': return 'text-lg md:text-xl'
      case 'large': return 'text-3xl md:text-4xl'
      case 'xl': return 'text-4xl md:text-5xl'
      default: return 'text-2xl md:text-3xl'
    }
  }

  if (!targetDate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Disney Countdown Timer</h1>
          <p className="text-gray-600">No countdown data provided.</p>
          <p className="text-sm text-gray-500 mt-2">This embed requires valid URL parameters.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      {/* Audio element for completion sound */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/disney-chime.mp3" type="audio/mpeg" />
      </audio>

      <div className="max-w-4xl mx-auto">
        {/* Countdown Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center p-6 rounded-xl bg-gradient-to-r ${currentTheme.gradient} ${currentTheme.textColor} relative overflow-hidden shadow-2xl`}
        >
          {/* Background decorations */}
          <div className="absolute top-4 left-4">
            <Sparkles className="w-6 h-6 opacity-60" />
          </div>
          <div className="absolute top-4 right-4">
            <Sparkles className="w-6 h-6 opacity-60" />
          </div>
          <div className="absolute bottom-4 left-1/4">
            <Sparkles className="w-4 h-4 opacity-40" />
          </div>
          <div className="absolute bottom-4 right-1/4">
            <Sparkles className="w-4 h-4 opacity-40" />
          </div>

          <div className="relative z-10">
            <h2 className="text-lg md:text-xl font-bold mb-2">Your Trip to</h2>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{selectedPark.name}</h1>
            <p className="text-sm md:text-base opacity-90 mb-6">{formatTargetDate()}</p>

            {settings.showTimezone && (
              <p className="text-xs opacity-75 mb-4">
                Park opens at {selectedPark.openingTime} ({selectedPark.timezone.split('/')[1]} time)
              </p>
            )}

            {isActive ? (
              <div className={`${getLayoutClassName()} mb-6`}>
                <div className={getDigitClassName()}>
                  <div className={`${getFontSizeClass()} font-bold`}>{countdown.days}</div>
                  <div className="text-xs opacity-80">Days</div>
                </div>
                <div className={getDigitClassName()}>
                  <div className={`${getFontSizeClass()} font-bold`}>{countdown.hours}</div>
                  <div className="text-xs opacity-80">Hours</div>
                </div>
                <div className={getDigitClassName()}>
                  <div className={`${getFontSizeClass()} font-bold`}>{countdown.minutes}</div>
                  <div className="text-xs opacity-80">Minutes</div>
                </div>
                <div className={getDigitClassName()}>
                  <div className={`${getFontSizeClass()} font-bold`}>{countdown.seconds}</div>
                  <div className="text-xs opacity-80">Seconds</div>
                </div>
                {settings.showMilliseconds && (
                  <div className={getDigitClassName()}>
                    <div className={`${getFontSizeClass()} font-bold`}>{Math.floor(milliseconds / 10)}</div>
                    <div className="text-xs opacity-80">Centiseconds</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-lg md:text-xl">The magic awaits! ✨</p>
              </div>
            )}

            {countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0 && isActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-2">🎉 IT'S DISNEY DAY! 🎉</h2>
                <p className="text-lg md:text-xl">Your magical adventure begins now!</p>
              </motion.div>
            )}

            {/* Powered by link */}
            <div className="mt-6 opacity-60">
              <a
                href={window.location.origin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs hover:opacity-80 transition-opacity"
              >
                Powered by Disney Trip Planner
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function EmbedCountdownPage(): JSX.Element {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your Disney countdown...</p>
        </div>
      </div>
    }>
      <EmbedCountdown />
    </Suspense>
  )
}

export default EmbedCountdownPage