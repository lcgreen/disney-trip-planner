import { motion } from 'framer-motion'
import { CountBadge } from '@/components/ui'
import type { DisneyPark } from '@/config'

interface AttractionsSectionProps {
  selectedPark: DisneyPark | null
}

export function AttractionsSection({ selectedPark }: AttractionsSectionProps) {
  if (!selectedPark) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8"
    >
      <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
        🎢 Must-Do Attractions at {selectedPark.name || 'Disney'}
      </h3>

      {selectedPark.subParks ? (
        // Show grouped attractions for resort complexes
        <div className="space-y-6">
          {selectedPark.subParks?.map((subPark, parkIndex) => (
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
          {(selectedPark.popularAttractions || []).map((attraction, index) => (
            <motion.div
              key={attraction}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className={`p-5 rounded-xl bg-gradient-to-r ${selectedPark.gradient || 'from-disney-blue to-disney-purple'} text-white shadow-lg hover:shadow-xl transition-all duration-300`}
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
  )
}