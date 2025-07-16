'use client'

import { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, X, Plus, Crown, LucideIcon } from 'lucide-react'
import { PremiumBadge } from '@/components/ui'
import WidgetConfigSelectorDialog from './WidgetConfigSelectorDialog'
import { WidgetSize } from '@/types'

interface WidgetBaseProps {
  id: string
  title: string
  icon: LucideIcon
  iconColor: string
  widgetType: 'countdown' | 'planner' | 'budget' | 'packing'
  size?: WidgetSize
  width?: string // Custom width (1-4 columns)
  selectedItemId?: string
  isDemoMode?: boolean
  onRemove?: () => void
  onWidthChange?: (width: string) => void
  onItemSelect?: (itemId: string | null) => void
  children: ReactNode
  className?: string
}

const sizeClasses = {
  small: 'h-56',
  medium: 'h-72',
  large: 'h-96',
  wide: 'h-72',
  tall: 'h-[28rem]',
  full: 'h-96'
}

const gridSpanClasses = {
  small: 'col-span-1',
  medium: 'col-span-1',
  large: 'col-span-1 lg:col-span-2',
  wide: 'col-span-1 md:col-span-2',
  tall: 'col-span-1',
  full: 'col-span-1 md:col-span-2 xl:col-span-3'
}

// Enhanced width options for more granular control
const widthOptions = [
  { value: '1', label: '1 Column', class: 'col-span-1' },
  { value: '2', label: '2 Columns', class: 'col-span-1 md:col-span-2' },
  { value: '3', label: '3 Columns', class: 'col-span-1 md:col-span-2 xl:col-span-3' },
  { value: '4', label: '4 Columns', class: 'col-span-1 md:col-span-2 xl:col-span-4' }
]

export default function WidgetBase({
  id,
  title,
  icon: Icon,
  iconColor,
  widgetType,
  size = 'medium',
  width,
  selectedItemId,
  isDemoMode = false,
  onRemove,
  onWidthChange,
  onItemSelect,
  children,
  className = ''
}: WidgetBaseProps) {
  const [showConfigDialog, setShowConfigDialog] = useState(false)

  return (
    <motion.div
      className={`h-72 col-span-1 bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-white/30 hover:shadow-lg hover:bg-white/95 transition-all duration-200 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100/50">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className={`${iconColor} p-2 rounded-lg shadow-sm flex-shrink-0`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center space-x-2 min-w-0">
              <h3 className="font-semibold text-gray-800 text-sm truncate">{title}</h3>
            </div>
          </div>
          <div className="flex items-center space-x-1 flex-shrink-0">
            {/* Widget width controls (if applicable) */}
            {onWidthChange && (
              <div className="flex items-center bg-gray-100/80 rounded-lg p-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {[1, 2, 3, 4].map((col) => (
                  <button
                    key={col}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-medium transition-all duration-150 ${width === String(col) ? 'bg-disney-blue text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}`}
                    onClick={() => onWidthChange(String(col))}
                    title={`${col} Column${col > 1 ? 's' : ''}`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            )}
            {/* Settings button directly opens the config dialog */}
            {onItemSelect && !isDemoMode && (
              <button
                onClick={() => setShowConfigDialog(true)}
                aria-label="Settings"
                className={`p-2 rounded-lg transition-colors duration-150 text-disney-blue bg-blue-50`}
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            {onRemove && !isDemoMode && (
              <button
                onClick={onRemove}
                aria-label="Remove"
                className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors duration-150"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {/* Widget Content */}
        <div className="flex-1 p-3 widget-scroll overflow-hidden relative">
          {children}
        </div>
        {/* Widget Config Selector Dialog */}
        <WidgetConfigSelectorDialog
          isOpen={showConfigDialog}
          onClose={() => setShowConfigDialog(false)}
          widgetType={widgetType}
          selectedItemId={selectedItemId}
          onSelect={(itemId: string) => {
            onItemSelect?.(itemId)
            setShowConfigDialog(false)
          }}
          onEdit={(itemId: string) => {
            const appRoute = widgetType === 'countdown' ? 'countdown' :
                           widgetType === 'planner' ? 'planner' :
                           widgetType === 'budget' ? 'budget' :
                           'packing'
            window.location.href = `/${appRoute}/new?widgetId=${id}&editItemId=${itemId}`
            setShowConfigDialog(false)
          }}
          onCreateNew={() => {
            const appRoute = widgetType === 'countdown' ? 'countdown' :
                           widgetType === 'planner' ? 'planner' :
                           widgetType === 'budget' ? 'budget' :
                           'packing'
            window.location.href = `/${appRoute}/new?widgetId=${id}`
            setShowConfigDialog(false)
          }}
        />
      </div>
    </motion.div>
  )
}

export { sizeClasses, gridSpanClasses }