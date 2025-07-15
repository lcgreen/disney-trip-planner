'use client'

import { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, X, LucideIcon } from 'lucide-react'
import { PremiumBadge } from '@/components/ui'
import ItemSelector from './ItemSelector'

export type WidgetSize = 'small' | 'medium' | 'large'

interface WidgetBaseProps {
  id: string
  title: string
  icon: LucideIcon
  iconColor: string
  widgetType: 'countdown' | 'planner' | 'budget' | 'packing'
  size?: WidgetSize
  selectedItemId?: string
  isPremium?: boolean
  onRemove?: () => void
  onSizeChange?: (size: WidgetSize) => void
  onItemSelect?: (itemId: string | null) => void
  children: ReactNode
  className?: string
}

const sizeClasses = {
  small: 'h-60',
  medium: 'h-80',
  large: 'h-96'
}

const gridSpanClasses = {
  small: 'col-span-1',
  medium: 'col-span-1 lg:col-span-1',
  large: 'col-span-1 lg:col-span-2'
}

export default function WidgetBase({
  id,
  title,
  icon: Icon,
  iconColor,
  widgetType,
  size = 'medium',
  selectedItemId,
  isPremium = false,
  onRemove,
  onSizeChange,
  onItemSelect,
  children,
  className = ''
}: WidgetBaseProps) {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`
        ${sizeClasses[size]}
        ${gridSpanClasses[size]}
        bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20
        hover:shadow-xl transition-shadow duration-200
        ${className}
      `}
    >
      <div className="h-full flex flex-col">
        {/* Widget Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className={`${iconColor} p-2 rounded-lg shadow-sm`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
              {isPremium && <PremiumBadge />}
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {/* Size selector */}
            {onSizeChange && (
              <div className="flex items-center bg-gray-100 rounded-md p-1">
                {(['small', 'medium', 'large'] as WidgetSize[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => onSizeChange(s)}
                    className={`
                      px-2 py-1 rounded text-xs font-medium transition-all duration-150
                      ${size === s
                        ? 'bg-white text-disney-blue shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                      }
                    `}
                  >
                    {s.charAt(0).toUpperCase()}
                  </button>
                ))}
              </div>
            )}

            {/* Settings button */}
            {onItemSelect && (
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 rounded-lg transition-colors duration-150 ${
                    showSettings
                      ? 'text-disney-blue bg-blue-50'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* Settings Dropdown */}
                <AnimatePresence>
                  {showSettings && (
                    <>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 p-3"
                      >
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">
                              Select Item to Display
                            </label>
                            <ItemSelector
                              widgetId={id}
                              widgetType={widgetType}
                              selectedItemId={selectedItemId}
                              onItemSelect={(itemId) => {
                                onItemSelect(itemId)
                                setShowSettings(false)
                              }}
                            />
                          </div>
                        </div>
                      </motion.div>

                      {/* Overlay to close settings */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowSettings(false)}
                      />
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

            {onRemove && (
              <button
                onClick={onRemove}
                className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors duration-150"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Widget Content */}
        <div className="flex-1 p-4 widget-scroll">
          {children}
        </div>
      </div>
    </motion.div>
  )
}

export { sizeClasses, gridSpanClasses }