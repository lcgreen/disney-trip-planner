import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { Badge } from '@/components/ui'
import { getQuickDateOptions, calculateQuickDate } from '@/config'
import { useState, useEffect } from 'react'

interface DateSelectionProps {
  targetDate: string
  onDateChange: (date: string) => void
  onStartCountdown: () => void
}

export function DateSelection({
  targetDate,
  onDateChange,
  onStartCountdown
}: DateSelectionProps) {
  const [minDate, setMinDate] = useState('')

  // Set min date on client side to avoid hydration mismatch
  useEffect(() => {
    const now = new Date()
    setMinDate(now.toISOString().slice(0, 16))
  }, [])

  const quickDateOptions = getQuickDateOptions().map(option => ({
    label: option.label,
    days: () => calculateQuickDate(option)
  }))

  const handleQuickDateSelect = (option: { label: string; days: () => Date }) => {
    const date = option.days()
    if (date && !isNaN(date.getTime())) {
      date.setHours(9, 0, 0, 0)
      onDateChange(date.toISOString().slice(0, 16))
      // Automatically start countdown when quick date is selected
      onStartCountdown()
    } else {
      console.warn('Invalid date returned from quick date option:', option.label)
    }
  }

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onDateChange(value)
    if (value) {
      // Automatically start countdown when date is selected
      const selectedDate = new Date(value)
      if (selectedDate > new Date()) {
        onStartCountdown()
      }
    }
  }

  return (
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
              onClick={() => handleQuickDateSelect(option)}
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
            onChange={handleDateInputChange}
            min={minDate}
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-disney-blue focus:border-disney-blue transition-all duration-300 text-lg"
            aria-label="Select your Disney trip date and time"
          />
        </div>
      </div>
    </motion.div>
  )
}