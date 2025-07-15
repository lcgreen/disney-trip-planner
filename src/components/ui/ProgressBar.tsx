import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const progressVariants = cva(
  "transition-all duration-500 rounded-full",
  {
    variants: {
      variant: {
        default: "bg-disney-blue",
        success: "bg-green-500",
        warning: "bg-yellow-500",
        error: "bg-red-500",
        disney: "bg-gradient-to-r from-disney-blue to-disney-purple",
        premium: "bg-gradient-to-r from-disney-gold to-disney-orange",
        park: "bg-gradient-to-r from-park-magic to-park-epcot",
      },
      size: {
        sm: "h-1",
        md: "h-2",
        lg: "h-3",
        xl: "h-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

const containerVariants = cva(
  "bg-gray-200 rounded-full overflow-hidden",
  {
    variants: {
      size: {
        sm: "h-1",
        md: "h-2",
        lg: "h-3",
        xl: "h-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface ProgressBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value: number
  max?: number
  showPercentage?: boolean
  showValues?: boolean
  label?: string
  description?: string
  animated?: boolean
  striped?: boolean
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant,
  size,
  showPercentage = false,
  showValues = false,
  label,
  description,
  animated = false,
  striped = false,
  className,
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const formattedValue = typeof value === 'number' ? value.toFixed(0) : '0'
  const formattedMax = typeof max === 'number' ? max.toFixed(0) : '100'

  return (
    <div className={cn("w-full", className)} {...props}>
      {/* Label and value display */}
      {(label || showPercentage || showValues) && (
        <div className="flex justify-between items-center mb-2">
          <div>
            {label && (
              <div className="text-sm font-medium text-gray-700">
                {label}
              </div>
            )}
            {description && (
              <div className="text-xs text-gray-500">
                {description}
              </div>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {showPercentage && `${percentage.toFixed(1)}%`}
            {showValues && `${formattedValue}/${formattedMax}`}
            {showPercentage && showValues && ' • '}
          </div>
        </div>
      )}

      {/* Progress bar container */}
      <div className={containerVariants({ size })}>
        <div
          className={cn(
            progressVariants({ variant, size }),
            striped && "bg-stripe",
            animated && "animate-pulse"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// Specialized progress components for common use cases

export interface BudgetProgressProps {
  spent: number
  budget: number
  category?: string
  currency?: string
  className?: string
}

export const BudgetProgress: React.FC<BudgetProgressProps> = ({
  spent,
  budget,
  category,
  currency = '£',
  className,
}) => {
  const percentage = budget > 0 ? (spent / budget) * 100 : 0
  const remaining = budget - spent
  const isOverBudget = spent > budget

  const getVariant = () => {
    if (isOverBudget) return 'error'
    if (percentage >= 90) return 'warning'
    if (percentage >= 75) return 'warning'
    return 'disney'
  }

  return (
    <ProgressBar
      value={spent}
      max={budget}
      variant={getVariant()}
      label={category}
      description={`${currency}${remaining.toFixed(2)} remaining`}
      showPercentage
      className={className}
    />
  )
}

export interface PackingProgressProps {
  completed: number
  total: number
  essential?: number
  completedEssential?: number
  className?: string
}

export const PackingProgress: React.FC<PackingProgressProps> = ({
  completed,
  total,
  essential,
  completedEssential,
  className,
}) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0
  const essentialComplete = essential && completedEssential ? completedEssential >= essential : true

  const getVariant = () => {
    if (!essentialComplete) return 'warning'
    if (percentage === 100) return 'success'
    if (percentage >= 75) return 'disney'
    return 'default'
  }

  const getDescription = () => {
    if (essential && completedEssential !== undefined) {
      return `${completedEssential}/${essential} essential items packed`
    }
    return `${completed} of ${total} items packed`
  }

  return (
    <ProgressBar
      value={completed}
      max={total}
      variant={getVariant()}
      label="Packing Progress"
      description={getDescription()}
      showPercentage
      className={className}
    />
  )
}

export interface TaskProgressProps {
  completed: number
  total: number
  title?: string
  className?: string
}

export const TaskProgress: React.FC<TaskProgressProps> = ({
  completed,
  total,
  title = "Task Progress",
  className,
}) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0

  const getVariant = () => {
    if (percentage === 100) return 'success'
    if (percentage >= 50) return 'disney'
    return 'default'
  }

  return (
    <ProgressBar
      value={completed}
      max={total}
      variant={getVariant()}
      label={title}
      showValues
      showPercentage
      className={className}
    />
  )
}

export default ProgressBar