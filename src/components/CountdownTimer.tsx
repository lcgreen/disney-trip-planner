'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Sparkles } from 'lucide-react'
import { format, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns'

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
}

const disneyParks: DisneyPark[] = [
  {
    id: 'magic-kingdom',
    name: 'Magic Kingdom',
    location: 'Walt Disney World, Florida',
    color: 'park-magic',
    gradient: 'from-blue-600 to-purple-600'
  },
  {
    id: 'epcot',
    name: 'EPCOT',
    location: 'Walt Disney World, Florida',
    color: 'park-epcot',
    gradient: 'from-purple-600 to-pink-600'
  },
  {
    id: 'hollywood-studios',
    name: "Hollywood Studios",
    location: 'Walt Disney World, Florida',
    color: 'park-hollywood',
    gradient: 'from-red-600 to-orange-600'
  },
  {
    id: 'animal-kingdom',
    name: 'Animal Kingdom',
    location: 'Walt Disney World, Florida',
    color: 'park-animal',
    gradient: 'from-green-600 to-teal-600'
  },
  {
    id: 'disneyland',
    name: 'Disneyland Park',
    location: 'Disneyland Resort, California',
    color: 'park-california',
    gradient: 'from-orange-600 to-red-600'
  },
  {
    id: 'disneyland-paris',
    name: 'Disneyland Paris',
    location: 'Marne-la-Vallée, France',
    color: 'park-paris',
    gradient: 'from-purple-600 to-blue-600'
  }
]

export default function CountdownTimer(): JSX.Element {
  const [targetDate, setTargetDate] = useState<string>('')
  const [selectedPark, setSelectedPark] = useState<DisneyPark>(disneyParks[0])
  const [countdown, setCountdown] = useState<CountdownData>({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && targetDate) {
      interval = setInterval(() => {
        const now = new Date()
        const target = new Date(targetDate)

        if (target > now) {
          const days = differenceInDays(target, now)
          const hours = differenceInHours(target, now) % 24
          const minutes = differenceInMinutes(target, now) % 60
          const seconds = differenceInSeconds(target, now) % 60

          setCountdown({ days, hours, minutes, seconds })
        } else {
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
          setIsActive(false)
        }
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, targetDate])

  const handleStartCountdown = (): void => {
    if (targetDate) {
      setIsActive(true)
    }
  }

  const resetCountdown = (): void => {
    setIsActive(false)
    setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  }

  const formatTargetDate = (): string => {
    if (!targetDate) return ''
    return format(new Date(targetDate), 'EEEE, MMMM do, yyyy')
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Park Selection */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
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
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Date Selection */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          When is your magical trip?
        </h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trip Date
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
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Countdown Display */}
      {targetDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center p-8 rounded-xl bg-gradient-to-r ${selectedPark.gradient} text-white relative overflow-hidden`}
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="countdown-digit">
                  <div className="text-4xl font-bold">{countdown.days}</div>
                  <div className="text-sm opacity-80">Days</div>
                </div>
                <div className="countdown-digit">
                  <div className="text-4xl font-bold">{countdown.hours}</div>
                  <div className="text-sm opacity-80">Hours</div>
                </div>
                <div className="countdown-digit">
                  <div className="text-4xl font-bold">{countdown.minutes}</div>
                  <div className="text-sm opacity-80">Minutes</div>
                </div>
                <div className="countdown-digit">
                  <div className="text-4xl font-bold">{countdown.seconds}</div>
                  <div className="text-sm opacity-80">Seconds</div>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <p className="text-xl">Click "Start Countdown" to begin the magic! ✨</p>
              </div>
            )}

            {countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0 && isActive && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <h2 className="text-3xl font-bold mb-2">🎉 IT'S DISNEY DAY! 🎉</h2>
                <p className="text-xl">Your magical adventure begins now!</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 bg-white rounded-xl p-6 shadow-lg"
      >
        <h3 className="text-xl font-semibold mb-4">💡 Disney Planning Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-disney-blue mb-2">60 Days Before</h4>
            <p className="text-sm text-gray-600">Book dining reservations and start planning your itinerary</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-disney-purple mb-2">30 Days Before</h4>
            <p className="text-sm text-gray-600">Purchase Genie+ and Individual Lightning Lanes</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-disney-green mb-2">7 Days Before</h4>
            <p className="text-sm text-gray-600">Check the weather and finalize your packing list</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-semibold text-disney-orange mb-2">Day Before</h4>
            <p className="text-sm text-gray-600">Download the Disney app and check park hours</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}