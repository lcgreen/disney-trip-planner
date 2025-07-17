import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import type { DisneyPark } from '@/config'
import type { CountdownSettings } from '@/types'

interface ParkSelectionProps {
  disneyParks: DisneyPark[]
  selectedPark: DisneyPark | null
  onParkSelect: (park: DisneyPark) => void
  settings: CountdownSettings
}

export function ParkSelection({
  disneyParks,
  selectedPark,
  onParkSelect,
  settings
}: ParkSelectionProps) {
  // Debug logging
  console.log('ParkSelection render:', {
    disneyParksLength: disneyParks?.length,
    disneyParks,
    selectedPark
  })

  if (!disneyParks || disneyParks.length === 0) {
    return (
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
        <div className="text-gray-600">Loading parks...</div>
      </motion.div>
    )
  }

  return (
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
            onClick={() => onParkSelect(park)}
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
  )
}