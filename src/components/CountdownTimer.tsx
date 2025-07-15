'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Sparkles, Settings, Share2, Code, Copy, Download, Upload, Palette, Volume2, VolumeX, RefreshCw, Star } from 'lucide-react'
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
  CountdownStat
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

interface SavedCountdown {
  id: string
  name: string
  park: DisneyPark
  date: string
  settings: CountdownSettings
  theme?: CountdownTheme
  createdAt: string
}

// Get configuration data
const disneyParks = getAllParks()
const customThemes = getAllThemes()
const quickDateOptions = getQuickDateOptions().map(option => ({
  label: option.label,
  days: () => calculateQuickDate(option)
}))

export default function CountdownTimer(): JSX.Element {
  const [targetDate, setTargetDate] = useState<string>('')
  const [selectedPark, setSelectedPark] = useState<DisneyPark>(disneyParks[0])
  const [countdown, setCountdown] = useState<CountdownData>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [milliseconds, setMilliseconds] = useState<number>(0)
  const [isActive, setIsActive] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showEmbed, setShowEmbed] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [customTheme, setCustomTheme] = useState<CountdownTheme | null>(null)
  const [countdownName, setCountdownName] = useState<string>('')
  const [savedCountdowns, setSavedCountdowns] = useState<SavedCountdown[]>([])
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
      setSavedCountdowns(JSON.parse(saved))
    }

    const savedSettings = localStorage.getItem('disney-countdown-settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('disney-countdown-settings', JSON.stringify(settings))
  }, [settings])

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

  const handleStartCountdown = (): void => {
    if (targetDate) {
      setIsActive(true)
    }
  }

  const resetCountdown = (): void => {
    setIsActive(false)
    setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    setMilliseconds(0)
  }

  const formatTargetDate = (): string => {
    if (!targetDate) return ''
    const date = new Date(targetDate)
    return format(date, 'EEEE, do MMMM yyyy \'at\' HH:mm')
  }

  const getEmbedCode = (): string => {
    const embedUrl = `${window.location.origin}/embed/countdown?park=${selectedPark.id}&date=${encodeURIComponent(targetDate)}&theme=${customTheme?.id || 'classic'}&settings=${encodeURIComponent(JSON.stringify(settings))}`
    return `<iframe src="${embedUrl}" width="800" height="600" frameborder="0" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"></iframe>`
  }

  const saveCountdown = (): void => {
    if (!countdownName.trim()) return

    const newCountdown: SavedCountdown = {
      id: Date.now().toString(),
      name: countdownName.trim(),
      park: selectedPark,
      date: targetDate,
      settings,
      theme: customTheme || undefined,
      createdAt: new Date().toISOString()
    }

    const updated = [...savedCountdowns, newCountdown]
    setSavedCountdowns(updated)
    localStorage.setItem('disney-countdowns', JSON.stringify(updated))
    setCountdownName('')
  }

  const loadCountdown = (saved: SavedCountdown): void => {
    setSelectedPark(saved.park)
    setTargetDate(saved.date)
    setSettings(saved.settings)
    setCustomTheme(saved.theme || null)
    setShowSaved(false)
  }

  const deleteCountdown = (id: string): void => {
    const updated = savedCountdowns.filter(c => c.id !== id)
    setSavedCountdowns(updated)
    localStorage.setItem('disney-countdowns', JSON.stringify(updated))
  }

  const clearSavedCountdowns = (): void => {
    setSavedCountdowns([])
    localStorage.removeItem('disney-countdowns')
  }

  const currentTheme = customTheme || {
    gradient: selectedPark.gradient,
    textColor: 'text-white',
    digitBg: 'bg-white/20'
  }

  const getDigitClassName = (): string => {
    const base = "p-4 rounded-lg backdrop-blur-sm"
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
        return 'flex flex-col gap-4'
      case 'compact':
        return 'flex gap-2 justify-center'
      case 'grid':
        return 'grid grid-cols-2 gap-4'
      default: // horizontal
        return 'grid grid-cols-2 md:grid-cols-4 gap-4'
    }
  }

  const getFontSizeClass = (): string => {
    switch (settings.fontSize) {
      case 'small': return 'text-2xl'
      case 'large': return 'text-6xl'
      case 'xl': return 'text-8xl'
      default: return 'text-4xl'
    }
  }

  return (
    <div className="max-w-6xl mx-auto text-gray-800">
      {/* Audio element for completion sound */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/disney-chime.mp3" type="audio/mpeg" />
      </audio>

      {/* Header with Controls */}
      <div className="flex flex-wrap gap-4 mb-8 justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-disney-blue to-disney-purple bg-clip-text text-transparent">
          Disney Countdown Timer
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="btn-secondary flex items-center gap-2"
          >
            <Star className="w-4 h-4" />
            Saved
            <CountBadge count={savedCountdowns.length} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn-secondary flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Customise
          </button>
          <button
            onClick={() => setShowEmbed(!showEmbed)}
            className="btn-secondary flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Embed
          </button>
        </div>
      </div>

      {/* Saved Countdowns Panel */}
      <SavedItemsPanel
        title="Saved Countdowns"
        count={savedCountdowns.length}
        defaultExpanded={showSaved}
        onClearAll={clearSavedCountdowns}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedCountdowns.map((saved) => (
            <div key={saved.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold">{saved.name}</h4>
                <button
                  onClick={() => deleteCountdown(saved.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <ParkBadge park={saved.park.name} />
              </div>
              <p className="text-sm text-gray-500 mb-3">
                {format(new Date(saved.date), 'do MMM yyyy')}
              </p>
              <button
                onClick={() => loadCountdown(saved)}
                className="btn-disney-small"
              >
                Load Countdown
              </button>
            </div>
          ))}
        </div>
      </SavedItemsPanel>

      {/* Settings Panel */}
      <SettingsPanel
        title="Customisation Options"
        defaultExpanded={showSettings}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-800">Theme</label>
            <div className="space-y-2">
              {customThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setCustomTheme(theme)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    customTheme?.id === theme.id
                      ? 'ring-2 ring-disney-blue'
                      : 'hover:bg-gray-50'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${theme.gradient.split(' ')[1]} 0%, ${theme.gradient.split(' ')[3]} 100%)`
                  }}
                >
                  <span className="text-gray-900 font-medium">
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Display Options */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-800">Display Options</label>
            <div className="space-y-3">
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
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-800">Style Options</label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Digit Style</label>
                <Select
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
                <label className="block text-xs text-gray-600 mb-1">Layout</label>
                <Select
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
                <label className="block text-xs text-gray-600 mb-1">Font Size</label>
                <Select
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

      {/* Embed Panel */}
      <Panel
        title="Embed on Your Website"
        icon={<Code className="w-5 h-5" />}
        variant="disney"
        defaultExpanded={showEmbed}
      >
        <p className="text-gray-600 mb-4">
          Copy this code to embed your countdown timer on any website or blog:
        </p>
        <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm mb-4 relative">
          <pre className="whitespace-pre-wrap break-all">{getEmbedCode()}</pre>
          <button
            onClick={() => navigator.clipboard.writeText(getEmbedCode())}
            className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow hover:bg-gray-50"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-1">Responsive</h4>
            <p className="text-blue-600">Automatically adapts to any screen size</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-1">Live Updates</h4>
            <p className="text-green-600">Real-time countdown updates every second</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-1">Customisable</h4>
            <p className="text-purple-600">All your settings and themes included</p>
          </div>
        </div>
      </Panel>

      {/* Park Selection */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
          <MapPin className="w-5 h-5" />
          Choose Your Disney Destination
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {disneyParks.map((park) => (
            <motion.button
              key={park.id}
              onClick={() => setSelectedPark(park)}
              className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                selectedPark.id === park.id
                  ? `border-${park.color} bg-gradient-to-r ${park.gradient} text-white`
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-left">
                <div className="font-semibold text-sm">{park.name}</div>
                <div className={`text-xs ${selectedPark.id === park.id ? 'text-white opacity-90' : 'text-gray-500'}`}>
                  {park.location}
                </div>
                {settings.showTimezone && (
                  <div className={`text-xs mt-1 ${selectedPark.id === park.id ? 'text-white opacity-75' : 'text-gray-400'}`}>
                    Opens: {park.openingTime} ({park.timezone.split('/')[1]})
                  </div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Date Selection */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
          <Calendar className="w-5 h-5" />
          When is your magical trip?
        </h3>

        {/* Quick Date Options */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Select
          </label>
          <div className="flex flex-wrap gap-2">
            {quickDateOptions.map((option) => (
              <Badge
                key={option.label}
                variant="disney"
                size="sm"
                className="cursor-pointer hover:bg-disney-blue/90"
                onClick={() => {
                  const date = option.days()
                  date.setHours(9, 0, 0, 0)
                  setTargetDate(date.toISOString().slice(0, 16))
                }}
              >
                {option.label}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trip Date & Time
            </label>
            <input
              type="datetime-local"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-disney-blue"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleStartCountdown}
              disabled={!targetDate}
              className="btn-disney disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Countdown
            </button>
            <button
              onClick={resetCountdown}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Save Countdown */}
        {targetDate && (
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Name this countdown..."
              value={countdownName}
              onChange={(e) => setCountdownName(e.target.value)}
              className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
            />
            <button
              onClick={saveCountdown}
              disabled={!countdownName.trim()}
              className="btn-disney-small disabled:opacity-50"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Countdown Display */}
      {targetDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center p-8 rounded-xl bg-gradient-to-r ${currentTheme.gradient} ${currentTheme.textColor} relative overflow-hidden`}
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
            <h2 className="text-2xl font-bold mb-2">Your Trip to</h2>
            <h1 className="text-4xl font-bold mb-2">{selectedPark.name}</h1>
            <p className="text-lg opacity-90 mb-6">{formatTargetDate()}</p>

            {isActive ? (
              <div className={`${getLayoutClassName()} mb-6`}>
                <div className={getDigitClassName()}>
                  <div className={`${getFontSizeClass()} font-bold`}>{countdown.days}</div>
                  <div className="text-sm opacity-80">Days</div>
                </div>
                <div className={getDigitClassName()}>
                  <div className={`${getFontSizeClass()} font-bold`}>{countdown.hours}</div>
                  <div className="text-sm opacity-80">Hours</div>
                </div>
                <div className={getDigitClassName()}>
                  <div className={`${getFontSizeClass()} font-bold`}>{countdown.minutes}</div>
                  <div className="text-sm opacity-80">Minutes</div>
                </div>
                <div className={getDigitClassName()}>
                  <div className={`${getFontSizeClass()} font-bold`}>{countdown.seconds}</div>
                  <div className="text-sm opacity-80">Seconds</div>
                </div>
                {settings.showMilliseconds && (
                  <div className={getDigitClassName()}>
                    <div className={`${getFontSizeClass()} font-bold`}>{Math.floor(milliseconds / 10)}</div>
                    <div className="text-sm opacity-80">Centiseconds</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-xl">Click &ldquo;Start Countdown&rdquo; to begin the magic! ✨</p>
              </div>
            )}

            {countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0 && isActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <h2 className="text-3xl font-bold mb-2">🎉 IT&rsquo;S DISNEY DAY! 🎉</h2>
                <p className="text-xl">Your magical adventure begins now!</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Popular Attractions */}
      {settings.showAttractions && targetDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 bg-white rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-800">🎢 Must-Do Attractions at {selectedPark.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedPark.popularAttractions.map((attraction, index) => (
              <div key={attraction} className={`p-4 rounded-lg bg-gradient-to-r ${selectedPark.gradient} text-white`}>
                <div className="flex items-center gap-3">
                  <CountBadge
                    count={index + 1}
                    className="bg-white/20 text-white border-white/30"
                  />
                  <span className="font-medium">{attraction}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tips Section */}
      {settings.showTips && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-white rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-800">💡 Disney Planning Timeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-disney-blue mb-2">60+ Days Before</h4>
              <p className="text-sm text-gray-600">Book dining reservations, plan your itinerary, book Genie+ if desired</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-disney-purple mb-2">30 Days Before</h4>
              <p className="text-sm text-gray-600">Check park hours, book Lightning Lanes for popular attractions</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-disney-green mb-2">7 Days Before</h4>
              <p className="text-sm text-gray-600">Check weather forecast, finalise packing list, mobile order setup</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-disney-orange mb-2">Day Before</h4>
              <p className="text-sm text-gray-600">Download Disney app, check park opening times, prepare for early start</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            <h4 className="font-semibold text-yellow-800 mb-2">💰 Money-Saving Tip</h4>
            <p className="text-sm text-yellow-700">
              Book your trip during off-peak times (mid-January to mid-March, late April to mid-May) for cheaper accommodation and shorter queues!
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}