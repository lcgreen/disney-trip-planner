import { motion } from 'framer-motion'

export function TipsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8"
    >
      <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
        💡 Disney Planning Timeline
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl"
        >
          <h4 className="font-bold text-disney-blue mb-3 text-lg">60+ Days Before</h4>
          <p className="text-sm text-gray-700 leading-relaxed">Book dining reservations, plan your itinerary, book Genie+ if desired</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl"
        >
          <h4 className="font-bold text-disney-purple mb-3 text-lg">30 Days Before</h4>
          <p className="text-sm text-gray-700 leading-relaxed">Check park hours, book Lightning Lanes for popular attractions</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl"
        >
          <h4 className="font-bold text-disney-green mb-3 text-lg">7 Days Before</h4>
          <p className="text-sm text-gray-700 leading-relaxed">Check weather forecast, finalise packing list, mobile order setup</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl"
        >
          <h4 className="font-bold text-disney-orange mb-3 text-lg">Day Before</h4>
          <p className="text-sm text-gray-700 leading-relaxed">Download Disney app, check park opening times, prepare for early start</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-l-4 border-yellow-400"
      >
        <h4 className="font-bold text-yellow-800 mb-3 text-lg">💰 Money-Saving Tip</h4>
        <p className="text-yellow-700 leading-relaxed">
          Book your trip during off-peak times (mid-January to mid-March, late April to mid-May) for cheaper accommodation and shorter queues!
        </p>
      </motion.div>
    </motion.div>
  )
}