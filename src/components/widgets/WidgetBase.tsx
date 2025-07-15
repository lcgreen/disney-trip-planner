'use client'

import { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, X, Plus, LucideIcon } from 'lucide-react'
import { PremiumBadge } from '@/components/ui'
import ItemSelector from './ItemSelector'

export type WidgetSize = 'small' | 'medium' | 'large' | 'wide' | 'tall' | 'full'

interface WidgetBaseProps {
  id: string
  title: string
  icon: LucideIcon
  iconColor: string
  widgetType: 'countdown' | 'planner' | 'budget' | 'packing'
  size?: WidgetSize
  width?: string // Custom width (1-4 columns)
  selectedItemId?: string
  isPremium?: boolean
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
  isPremium = false,
  onRemove,
  onWidthChange,
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
        ${width ? widthOptions.find(w => w.value === width)?.class || gridSpanClasses[size] : gridSpanClasses[size]}
        bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-white/30
        hover:shadow-lg hover:bg-white/95 transition-all duration-200
        ${className}
      `}
    >
      <div className="h-full flex flex-col">
        {/* Widget Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100/50">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className={`${iconColor} p-2 rounded-lg shadow-sm flex-shrink-0`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center space-x-2 min-w-0">
              <h3 className="font-semibold text-gray-800 text-sm truncate">{title}</h3>
              {isPremium && <PremiumBadge />}
            </div>
          </div>

          <div className="flex items-center space-x-1 flex-shrink-0">
            {/* Width selector */}
            {onWidthChange && (
              <div className="flex items-center bg-gray-100/80 rounded-lg p-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {widthOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onWidthChange(option.value)}
                    title={option.label}
                    className={`
                      w-6 h-6 rounded flex items-center justify-center text-xs font-medium transition-all duration-150
                      ${width === option.value
                        ? 'bg-white text-disney-blue shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                      }
                    `}
                  >
                    {option.value}
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

                          {/* Edit Configuration Button */}
                          {selectedItemId && (
                            <div>
                              <button
                                onClick={() => {
                                  const appRoute = widgetType === 'countdown' ? 'countdown' :
                                                 widgetType === 'planner' ? 'planner' :
                                                 widgetType === 'budget' ? 'budget' :
                                                 'packing'
                                  window.location.href = `/${appRoute}/new?widgetId=${id}&editItemId=${selectedItemId}`
                                  setShowSettings(false)
                                }}
                                className="w-full px-3 py-2 text-sm bg-disney-blue text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                              >
                                <Settings className="w-4 h-4" />
                                Edit Configuration
                              </button>
                            </div>
                          )}

                          {/* Create New Button */}
                          <div>
                            <button
                              onClick={() => {
                                const appRoute = widgetType === 'countdown' ? 'countdown' :
                                               widgetType === 'planner' ? 'planner' :
                                               widgetType === 'budget' ? 'budget' :
                                               'packing'
                                window.location.href = `/${appRoute}/new?widgetId=${id}`
                                setShowSettings(false)
                              }}
                              className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Create New {widgetType === 'countdown' ? 'Countdown' :
                                          widgetType === 'planner' ? 'Trip Plan' :
                                          widgetType === 'budget' ? 'Budget' :
                                          'Packing List'}
                            </button>
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
        <div className="flex-1 p-3 widget-scroll overflow-hidden">
          {children}
        </div>
      </div>
    </motion.div>
  )
}

export { sizeClasses, gridSpanClasses }