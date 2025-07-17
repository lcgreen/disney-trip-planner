import { motion } from 'framer-motion'
import { Settings, Share2 } from 'lucide-react'

interface ControlPanelProps {
  showSettings: boolean
  showEmbed: boolean
  onToggleSettings: () => void
  onToggleEmbed: () => void
}

export function ControlPanel({
  showSettings,
  showEmbed,
  onToggleSettings,
  onToggleEmbed
}: ControlPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8"
    >
      <div className="flex flex-wrap gap-3 justify-center items-center">
        <button
          onClick={onToggleSettings}
          className={`btn-secondary flex items-center gap-2 ${showSettings ? 'bg-disney-blue text-white' : ''}`}
        >
          <Settings className="w-4 h-4" />
          Customise
        </button>
        <button
          onClick={onToggleEmbed}
          className={`btn-secondary flex items-center gap-2 ${showEmbed ? 'bg-disney-blue text-white' : ''}`}
        >
          <Share2 className="w-4 h-4" />
          Embed
        </button>
      </div>
    </motion.div>
  )
}