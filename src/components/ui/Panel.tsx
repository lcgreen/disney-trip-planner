import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const panelVariants = cva(
  "rounded-xl shadow-lg border overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-white border-gray-200",
        disney: "bg-gradient-to-br from-blue-50 to-purple-50 border-disney-purple/20",
        premium: "bg-gradient-to-br from-yellow-50 to-orange-50 border-disney-gold/30",
        success: "bg-green-50 border-green-200",
        warning: "bg-yellow-50 border-yellow-200",
        error: "bg-red-50 border-red-200",
      },
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

const headerVariants = cva(
  "flex items-center justify-between p-4 cursor-pointer transition-colors",
  {
    variants: {
      variant: {
        default: "hover:bg-gray-50",
        disney: "hover:bg-blue-100/50",
        premium: "hover:bg-yellow-100/50",
        success: "hover:bg-green-100/50",
        warning: "hover:bg-yellow-100/50",
        error: "hover:bg-red-100/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface PanelProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onToggle'>,
    VariantProps<typeof panelVariants> {
  title: string
  description?: string
  icon?: React.ReactNode
  defaultExpanded?: boolean
  expandable?: boolean
  onToggle?: (expanded: boolean) => void
  children: React.ReactNode
  headerActions?: React.ReactNode
  collapsible?: boolean
}

const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({
    className,
    variant,
    size,
    title,
    description,
    icon,
    defaultExpanded = true,
    expandable = true,
    onToggle,
    children,
    headerActions,
    collapsible = true,
    ...props
  }, ref) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded)

    const handleToggle = () => {
      if (!expandable && !collapsible) return

      const newExpanded = !isExpanded
      setIsExpanded(newExpanded)
      if (onToggle) {
        onToggle(newExpanded)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(panelVariants({ variant, size }), className)}
        {...props}
      >
        {/* Header */}
        <div
          className={cn(
            headerVariants({ variant }),
            (!expandable && !collapsible) && "cursor-default"
          )}
          onClick={handleToggle}
        >
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex items-center justify-center">
                {icon}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">
                {title}
              </h3>
              {description && (
                <p className="text-sm text-gray-600 mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {headerActions && (
              <div onClick={(e) => e.stopPropagation()}>
                {headerActions}
              </div>
            )}
            {(expandable || collapsible) && (
              <button
                type="button"
                className="p-1 rounded-full hover:bg-gray-200/50 transition-colors"
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-6 pt-0">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

Panel.displayName = "Panel"

// Specialized panel components for common use cases

export interface SettingsPanelProps {
  title?: string
  description?: string
  children: React.ReactNode
  defaultExpanded?: boolean
  className?: string
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  title = "Settings",
  description = "Customise your preferences",
  children,
  defaultExpanded = false,
  className,
}) => (
  <Panel
    variant="disney"
    title={title}
    description={description}
    defaultExpanded={defaultExpanded}
    className={className}
  >
    {children}
  </Panel>
)

export interface SavedItemsPanelProps {
  title?: string
  count?: number
  children: React.ReactNode
  defaultExpanded?: boolean
  className?: string
  onClearAll?: () => void
}

export const SavedItemsPanel: React.FC<SavedItemsPanelProps> = ({
  title = "Saved Items",
  count,
  children,
  defaultExpanded = false,
  className,
  onClearAll,
}) => {
  const displayTitle = count !== undefined ? `${title} (${count})` : title

  return (
    <Panel
      variant="default"
      title={displayTitle}
      defaultExpanded={defaultExpanded}
      className={className}
      headerActions={
        onClearAll && count && count > 0 ? (
          <button
            onClick={onClearAll}
            className="text-xs text-gray-500 hover:text-red-600 transition-colors"
          >
            Clear All
          </button>
        ) : undefined
      }
    >
      {children}
    </Panel>
  )
}

export interface InfoPanelProps {
  title: string
  description?: string
  children: React.ReactNode
  variant?: 'info' | 'success' | 'warning' | 'error'
  defaultExpanded?: boolean
  className?: string
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
  title,
  description,
  children,
  variant = 'info',
  defaultExpanded = true,
  className,
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return 'ℹ️'
    }
  }

  const getVariant = () => {
    switch (variant) {
      case 'success':
        return 'success'
      case 'warning':
        return 'warning'
      case 'error':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <Panel
      variant={getVariant()}
      title={title}
      description={description}
      icon={<span className="text-lg">{getIcon()}</span>}
      defaultExpanded={defaultExpanded}
      className={className}
    >
      {children}
    </Panel>
  )
}

export interface FeaturePanelProps {
  title: string
  description?: string
  children: React.ReactNode
  isPremium?: boolean
  defaultExpanded?: boolean
  className?: string
}

export const FeaturePanel: React.FC<FeaturePanelProps> = ({
  title,
  description,
  children,
  isPremium = false,
  defaultExpanded = true,
  className,
}) => (
  <Panel
    variant={isPremium ? "premium" : "disney"}
    title={title}
    description={description}
    icon={isPremium ? <span className="text-lg">👑</span> : <span className="text-lg">✨</span>}
    defaultExpanded={defaultExpanded}
    className={className}
  >
    {children}
  </Panel>
)

export { Panel, panelVariants }
export default Panel