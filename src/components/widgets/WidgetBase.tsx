'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Settings, X, LucideIcon } from 'lucide-react'
import { PremiumBadge } from '@/components/ui'

export type WidgetSize = 'small' | 'medium' | 'large'

interface WidgetBaseProps {
  id: string
  title: string
  icon: LucideIcon
  iconColor: string
  size?: WidgetSize
  isPremium?: boolean
  onRemove?: () => void
  onSettings?: () => void
  onSizeChange?: (size: WidgetSize) => void
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
  size = 'medium',
  isPremium = false,
  onRemove,
  onSettings,
  onSizeChange,
  children,
  className = ''
}: WidgetBaseProps) {
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

            {onSettings && (
              <button
                onClick={onSettings}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors duration-150"
              >
                <Settings className="w-4 h-4" />
              </button>
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
        <div className="flex-1 p-4 overflow-hidden">
          {children}
        </div>
      </div>
    </motion.div>
  )
}

export { sizeClasses, gridSpanClasses }