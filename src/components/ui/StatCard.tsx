import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

const statCardVariants = cva(
  "rounded-xl shadow-lg p-6 transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-white border border-gray-200",
        disney: "bg-gradient-to-br from-disney-blue to-disney-purple text-white",
        premium: "bg-gradient-to-br from-disney-gold to-disney-orange text-disney-blue",
        success: "bg-gradient-to-br from-green-500 to-emerald-600 text-white",
        warning: "bg-gradient-to-br from-yellow-500 to-orange-500 text-white",
        error: "bg-gradient-to-br from-red-500 to-rose-600 text-white",
        info: "bg-gradient-to-br from-blue-500 to-cyan-600 text-white",
        neutral: "bg-gradient-to-br from-gray-500 to-slate-600 text-white",
      },
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      interactive: {
        true: "cursor-pointer hover:scale-105 hover:shadow-xl",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      interactive: false,
    },
  }
)

export interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statCardVariants> {
  title: string
  value: string | number
  description?: string
  change?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
    label?: string
  }
  icon?: LucideIcon | React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  loading?: boolean
  actionButton?: React.ReactNode
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({
    className,
    variant,
    size,
    interactive,
    title,
    value,
    description,
    change,
    icon,
    trend,
    loading = false,
    actionButton,
    onClick,
    ...props
  }, ref) => {
    const isInteractive = interactive || !!onClick

    const formatValue = (val: string | number): string => {
      if (typeof val === 'number') {
        return val.toLocaleString()
      }
      return val
    }

    const getChangeColor = () => {
      if (!change) return ''
      switch (change.type) {
        case 'increase':
          return variant === 'default' ? 'text-green-600' : 'text-green-200'
        case 'decrease':
          return variant === 'default' ? 'text-red-600' : 'text-red-200'
        default:
          return variant === 'default' ? 'text-gray-600' : 'text-gray-200'
      }
    }

    const getChangeIcon = () => {
      if (!change) return null
      switch (change.type) {
        case 'increase':
          return '↗️'
        case 'decrease':
          return '↘️'
        default:
          return '➡️'
      }
    }

    const IconComponent = icon as LucideIcon

    return (
      <div
        ref={ref}
        className={cn(statCardVariants({ variant, size, interactive: isInteractive }), className)}
        onClick={onClick}
        {...props}
      >
        {/* Header with icon */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex items-center justify-center">
                {React.isValidElement(icon) ? (
                  icon
                ) : (
                  <IconComponent className="w-6 h-6" />
                )}
              </div>
            )}
            <h3 className={cn(
              "text-sm font-medium",
              variant === 'default' ? 'text-gray-600' : 'text-current opacity-90'
            )}>
              {title}
            </h3>
          </div>
          {actionButton && (
            <div onClick={(e) => e.stopPropagation()}>
              {actionButton}
            </div>
          )}
        </div>

        {/* Main value */}
        <div className="mb-2">
          {loading ? (
            <div className={cn(
              "h-8 w-24 rounded animate-pulse",
              variant === 'default' ? 'bg-gray-200' : 'bg-white/20'
            )} />
          ) : (
            <div className="text-3xl font-bold">
              {formatValue(value)}
            </div>
          )}
        </div>

        {/* Description and change */}
        <div className="flex items-center justify-between">
          <div>
            {description && (
              <p className={cn(
                "text-sm",
                variant === 'default' ? 'text-gray-500' : 'text-current opacity-75'
              )}>
                {description}
              </p>
            )}
          </div>
          {change && (
            <div className={cn("flex items-center gap-1 text-sm", getChangeColor())}>
              <span>{getChangeIcon()}</span>
              <span className="font-medium">
                {change.value > 0 ? '+' : ''}{change.value}%
              </span>
              {change.label && (
                <span className="text-xs opacity-75">
                  {change.label}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }
)

StatCard.displayName = "StatCard"

// Specialized stat card components for common use cases

export interface CountdownStatProps {
  days: number
  hours: number
  minutes: number
  seconds: number
  loading?: boolean
  className?: string
}

export const CountdownStat: React.FC<CountdownStatProps> = ({
  days,
  hours,
  minutes,
  seconds,
  loading = false,
  className,
}) => (
  <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
    <StatCard
      variant="disney"
      title="Days"
      value={days}
      loading={loading}
      size="sm"
    />
    <StatCard
      variant="disney"
      title="Hours"
      value={hours}
      loading={loading}
      size="sm"
    />
    <StatCard
      variant="disney"
      title="Minutes"
      value={minutes}
      loading={loading}
      size="sm"
    />
    <StatCard
      variant="disney"
      title="Seconds"
      value={seconds}
      loading={loading}
      size="sm"
    />
  </div>
)

export interface BudgetStatProps {
  total: number
  spent: number
  remaining: number
  currency?: string
  className?: string
}

export const BudgetStat: React.FC<BudgetStatProps> = ({
  total,
  spent,
  remaining,
  currency = '£',
  className,
}) => {
  const spentPercentage = total > 0 ? ((spent / total) * 100) : 0
  const isOverBudget = spent > total

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
      <StatCard
        variant="premium"
        title="Total Budget"
        value={`${currency}${total.toFixed(2)}`}
        description="Allocated budget"
      />
      <StatCard
        variant={isOverBudget ? "error" : "info"}
        title="Spent"
        value={`${currency}${spent.toFixed(2)}`}
        description={`${spentPercentage.toFixed(1)}% of budget`}
        change={isOverBudget ? {
          value: Math.round(spentPercentage - 100),
          type: 'decrease',
          label: 'over budget'
        } : undefined}
      />
      <StatCard
        variant={remaining > 0 ? "success" : "warning"}
        title="Remaining"
        value={`${currency}${remaining.toFixed(2)}`}
        description={remaining > 0 ? "Available to spend" : "Budget exceeded"}
      />
    </div>
  )
}

export interface ProgressStatProps {
  completed: number
  total: number
  title?: string
  description?: string
  className?: string
}

export const ProgressStat: React.FC<ProgressStatProps> = ({
  completed,
  total,
  title = "Progress",
  description,
  className,
}) => {
  const percentage = total > 0 ? ((completed / total) * 100) : 0
  const isComplete = completed >= total

  return (
    <StatCard
      variant={isComplete ? "success" : "disney"}
      title={title}
      value={`${completed}/${total}`}
      description={description || `${percentage.toFixed(1)}% complete`}
      change={isComplete ? {
        value: 100,
        type: 'increase',
        label: 'complete'
      } : undefined}
      className={className}
    />
  )
}

export interface PackingStatProps {
  packed: number
  total: number
  essential: number
  packedEssential: number
  className?: string
}

export const PackingStat: React.FC<PackingStatProps> = ({
  packed,
  total,
  essential,
  packedEssential,
  className,
}) => {
  const totalPercentage = total > 0 ? ((packed / total) * 100) : 0
  const essentialComplete = packedEssential >= essential

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      <StatCard
        variant="disney"
        title="Items Packed"
        value={`${packed}/${total}`}
        description={`${totalPercentage.toFixed(1)}% complete`}
        change={totalPercentage > 0 ? {
          value: Math.round(totalPercentage),
          type: totalPercentage >= 75 ? 'increase' : 'neutral'
        } : undefined}
      />
      <StatCard
        variant={essentialComplete ? "success" : "warning"}
        title="Essential Items"
        value={`${packedEssential}/${essential}`}
        description={essentialComplete ? "All essentials packed" : "Missing essentials"}
        change={essentialComplete ? {
          value: 100,
          type: 'increase',
          label: 'complete'
        } : undefined}
      />
    </div>
  )
}

export { StatCard, statCardVariants }
export default StatCard