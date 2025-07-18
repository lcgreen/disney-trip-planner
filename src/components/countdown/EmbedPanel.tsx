import { motion } from 'framer-motion'
import { Code, Copy } from 'lucide-react'
import { Panel } from '@/components/ui'

interface EmbedPanelProps {
  showEmbed: boolean
  selectedPark: any
  targetDate: string
  customTheme: any
  settings: any
}

const EmbedPanel = ({
  showEmbed,
  selectedPark,
  targetDate,
  customTheme,
  settings
}: EmbedPanelProps) => {
  const getEmbedCode = (): string => {
    const embedUrl = `${window.location.origin}/embed/countdown?park=${selectedPark?.id || 'disney-world'}&date=${encodeURIComponent(targetDate)}&theme=${customTheme?.id || 'classic'}&settings=${encodeURIComponent(JSON.stringify(settings))}`
    return `<iframe src="${embedUrl}" width="800" height="600" frameborder="0" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);"></iframe>`
  }

  if (!showEmbed) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <Panel
        title="Embed on Your Website"
        icon={<Code className="w-5 h-5" />}
        variant="disney"
        defaultExpanded={true}
      >
        <p className="text-gray-600 mb-6">
          Copy this code to embed your countdown timer on any website or blog:
        </p>
        <div className="bg-gray-50 p-6 rounded-xl font-mono text-sm mb-6 relative border border-gray-200">
          <pre className="whitespace-pre-wrap break-all text-gray-800">{getEmbedCode()}</pre>
          <button
            onClick={() => navigator.clipboard.writeText(getEmbedCode())}
            className="absolute top-3 right-3 p-2 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <h4 className="font-semibold text-blue-800 mb-2">📱 Responsive</h4>
            <p className="text-blue-600 text-sm">Automatically adapts to any screen size</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <h4 className="font-semibold text-green-800 mb-2">⚡ Live Updates</h4>
            <p className="text-green-600 text-sm">Real-time countdown updates every second</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <h4 className="font-semibold text-purple-800 mb-2">🎨 Customisable</h4>
            <p className="text-purple-600 text-sm">All your settings and themes included</p>
          </div>
        </div>
      </Panel>
    </motion.div>
  )
}

export default EmbedPanel