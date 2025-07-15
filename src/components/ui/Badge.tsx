import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 whitespace-nowrap font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800 border border-gray-300",
        primary: "bg-disney-blue text-white",
        secondary: "bg-gray-500 text-white",
        success: "bg-green-100 text-green-800 border border-green-300",
        warning: "bg-yellow-100 text-yellow-800 border border-yellow-300",
        error: "bg-red-100 text-red-800 border border-red-300",
        info: "bg-blue-100 text-blue-800 border border-blue-300",
        premium: "bg-gradient-to-r from-disney-gold to-disney-orange text-disney-blue border-2 border-disney-orange shadow-lg",
        disney: "bg-gradient-to-r from-disney-blue to-disney-purple text-white",
        essential: "bg-red-100 text-red-800 border border-red-300",
        weather: "bg-blue-50 text-blue-700 border border-blue-200",
        park: "bg-purple-100 text-purple-800 border border-purple-300",
        status: "bg-gray-50 text-gray-700 border border-gray-200",
        outline: "border border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50",
      },
      size: {
        xs: "px-1.5 py-0.5 text-xs rounded",
        sm: "px-2 py-1 text-xs rounded-md",
        md: "px-2.5 py-1.5 text-sm rounded-md",
        lg: "px-3 py-2 text-base rounded-lg",
      },
      interactive: {
        true: "cursor-pointer hover:opacity-80 active:scale-95",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
      interactive: false,
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
  onRemove?: () => void
  removable?: boolean
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, interactive, icon, onRemove, removable, children, onClick, ...props }, ref) => {
    const isInteractive = interactive || !!onClick || removable

    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, interactive: isInteractive }), className)}
        onClick={onClick}
        {...props}
      >
        {icon && <span className="flex items-center">{icon}</span>}
        {children}
        {removable && onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </span>
    )
  }
)

Badge.displayName = "Badge"

// Specialized badge components for common use cases

export interface PremiumBadgeProps {
  className?: string
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({ className }) => (
  <Badge variant="premium" size="sm" className={className}>
    PREMIUM
  </Badge>
)

export interface EssentialBadgeProps {
  className?: string
}

export const EssentialBadge: React.FC<EssentialBadgeProps> = ({ className }) => (
  <Badge variant="essential" size="xs" className={className}>
    Essential
  </Badge>
)

export interface WeatherBadgeProps {
  weather: string
  icon?: string
  className?: string
  onClick?: () => void
  active?: boolean
}

export const WeatherBadge: React.FC<WeatherBadgeProps> = ({
  weather,
  icon,
  className,
  onClick,
  active = false
}) => (
  <Badge
    variant={active ? "primary" : "weather"}
    size="sm"
    className={className}
    onClick={onClick}
    interactive={!!onClick}
    icon={icon && <span>{icon}</span>}
  >
    {weather}
  </Badge>
)

export interface StatusBadgeProps {
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'overdue'
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getVariant = () => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'in-progress':
        return 'info'
      case 'cancelled':
        return 'secondary'
      case 'overdue':
        return 'error'
      default:
        return 'default'
    }
  }

  const getLabel = () => {
    switch (status) {
      case 'in-progress':
        return 'In Progress'
      case 'overdue':
        return 'Overdue'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  return (
    <Badge variant={getVariant()} size="xs" className={className}>
      {getLabel()}
    </Badge>
  )
}

export interface ParkBadgeProps {
  park: string
  className?: string
}

export const ParkBadge: React.FC<ParkBadgeProps> = ({ park, className }) => (
  <Badge variant="park" size="sm" className={className}>
    {park}
  </Badge>
)

export interface CountBadgeProps {
  count: number
  max?: number
  className?: string
}

export const CountBadge: React.FC<CountBadgeProps> = ({ count, max, className }) => {
  const displayText = max ? `${count}/${max}` : count.toString()
  const variant = max && count >= max ? 'success' : 'default'

  return (
    <Badge variant={variant} size="xs" className={className}>
      {displayText}
    </Badge>
  )
}

export interface CategoryBadgeProps {
  category: string
  color?: string
  className?: string
  removable?: boolean
  onRemove?: () => void
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  color,
  className,
  removable = false,
  onRemove
}) => (
  <Badge
    variant="outline"
    size="sm"
    className={cn(color && `border-${color}-300 text-${color}-700 bg-${color}-50`, className)}
    removable={removable}
    onRemove={onRemove}
  >
    {category}
  </Badge>
)

export { Badge, badgeVariants }
export default Badge