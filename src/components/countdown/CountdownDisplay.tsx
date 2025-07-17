import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { CountdownTimerData } from '@/hooks/useCountdownState'
import type { DisneyPark } from '@/config'
import type { CountdownSettings } from '@/types'

interface CountdownDisplayProps {
  targetDate: string
  selectedPark: DisneyPark | null
  countdown: CountdownTimerData
  milliseconds: number
  isActive: boolean
  settings: CountdownSettings
  customTheme: any
}

export function CountdownDisplay({
  targetDate,
  selectedPark,
  countdown,
  milliseconds,
  isActive,
  settings,
  customTheme
}: CountdownDisplayProps) {
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

  const formatTargetDate = (): string => {
    if (!targetDate) return ''
    const date = new Date(targetDate)
    if (isNaN(date.getTime())) return 'Invalid Date'
    return format(date, 'EEEE, do MMMM yyyy \'at\' HH:mm')
  }

  const isCompleted = countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0 && isActive

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
      className={`text-center p-8 md:p-12 rounded-2xl bg-gradient-to-r ${currentTheme.gradient} ${currentTheme.textColor} relative overflow-hidden shadow-2xl`}
      role="timer"
      aria-live="polite"
      aria-label={`Disney countdown timer showing ${countdown.days} days, ${countdown.hours} hours, ${countdown.minutes} minutes, and ${countdown.seconds} seconds until your trip to ${selectedPark?.name || 'Disney'}`}
      data-testid="countdown-timer-container"
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
            data-testid="countdown-timer-active"
          >
            <div className={getDigitClassName()} data-testid="countdown-days-container">
              <div className={`${getFontSizeClass()} font-bold`} data-testid="countdown-days-value">{countdown.days}</div>
              <div className="text-sm md:text-base opacity-80 mt-2">Days</div>
            </div>
            <div className={getDigitClassName()} data-testid="countdown-hours-container">
              <div className={`${getFontSizeClass()} font-bold`} data-testid="countdown-hours-value">{countdown.hours}</div>
              <div className="text-sm md:text-base opacity-80 mt-2">Hours</div>
            </div>
            <div className={getDigitClassName()} data-testid="countdown-minutes-container">
              <div className={`${getFontSizeClass()} font-bold`} data-testid="countdown-minutes-value">{countdown.minutes}</div>
              <div className="text-sm md:text-base opacity-80 mt-2">Minutes</div>
            </div>
            <div className={getDigitClassName()} data-testid="countdown-seconds-container">
              <div className={`${getFontSizeClass()} font-bold`} data-testid="countdown-seconds-value">{countdown.seconds}</div>
              <div className="text-sm md:text-base opacity-80 mt-2">Seconds</div>
            </div>
            {settings.showMilliseconds && (
              <div className={getDigitClassName()} data-testid="countdown-milliseconds-container">
                <div className={`${getFontSizeClass()} font-bold`} data-testid="countdown-milliseconds-value">{Math.floor(milliseconds / 10)}</div>
                <div className="text-sm md:text-base opacity-80 mt-2">Centiseconds</div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
            data-testid="countdown-timer-inactive"
          >
            <p className="text-xl md:text-2xl">Select a date to start your countdown! ✨</p>
          </motion.div>
        )}

        {isCompleted && (
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
  )
}