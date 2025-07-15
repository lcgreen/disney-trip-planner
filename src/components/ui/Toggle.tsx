import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const toggleVariants = cva(
  "relative inline-flex items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "data-[state=checked]:bg-disney-blue data-[state=unchecked]:bg-gray-200",
        disney: "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-disney-blue data-[state=checked]:to-disney-purple data-[state=unchecked]:bg-gray-200",
        premium: "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-disney-gold data-[state=checked]:to-disney-orange data-[state=unchecked]:bg-gray-200",
        success: "data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200",
        warning: "data-[state=checked]:bg-yellow-500 data-[state=unchecked]:bg-gray-200",
        error: "data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-gray-200",
      },
      size: {
        sm: "h-5 w-9",
        md: "h-6 w-11",
        lg: "h-7 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

const thumbVariants = cva(
  "pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform",
  {
    variants: {
      size: {
        sm: "h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
        md: "h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
        lg: "h-6 w-6 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

export interface ToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'>,
    VariantProps<typeof toggleVariants> {
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  name?: string
  value?: string
  labelPosition?: 'left' | 'right'
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({
    className,
    variant,
    size,
    checked = false,
    onChange,
    label,
    description,
    disabled = false,
    name,
    value,
    labelPosition = 'right',
    ...props
  }, ref) => {
    const handleToggle = () => {
      if (!disabled && onChange) {
        onChange(!checked)
      }
    }

    const toggleElement = (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        disabled={disabled}
        className={cn(toggleVariants({ variant, size }), className)}
        onClick={handleToggle}
        {...props}
      >
        <span
          aria-hidden="true"
          data-state={checked ? "checked" : "unchecked"}
          className={thumbVariants({ size })}
        />
      </button>
    )

    if (!label && !description) {
      return toggleElement
    }

    const labelContent = (
      <div className="flex flex-col">
        {label && (
          <span className="text-sm font-medium text-gray-700">
            {label}
          </span>
        )}
        {description && (
          <span className="text-xs text-gray-500">
            {description}
          </span>
        )}
      </div>
    )

    return (
      <div className={cn(
        "flex items-center gap-3",
        labelPosition === 'left' ? 'flex-row-reverse' : 'flex-row'
      )}>
        {toggleElement}
        <label
          htmlFor={name}
          className="cursor-pointer"
          onClick={handleToggle}
        >
          {labelContent}
        </label>
        {/* Hidden input for form integration */}
        {name && (
          <input
            type="hidden"
            name={name}
            value={checked ? (value || 'true') : 'false'}
          />
        )}
      </div>
    )
  }
)

Toggle.displayName = "Toggle"

// Specialized toggle components for common use cases

export interface SettingToggleProps {
  setting: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  variant?: ToggleProps['variant']
}

export const SettingToggle: React.FC<SettingToggleProps> = ({
  setting,
  description,
  checked,
  onChange,
  disabled = false,
  variant = "disney",
}) => (
  <Toggle
    variant={variant}
    checked={checked}
    onChange={onChange}
    disabled={disabled}
    label={setting}
    description={description}
  />
)

export interface FeatureToggleProps {
  feature: string
  isPremium?: boolean
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export const FeatureToggle: React.FC<FeatureToggleProps> = ({
  feature,
  isPremium = false,
  checked,
  onChange,
  disabled = false,
}) => (
  <Toggle
    variant={isPremium ? "premium" : "disney"}
    checked={checked}
    onChange={onChange}
    disabled={disabled}
    label={feature}
    description={isPremium ? "Premium feature" : undefined}
  />
)

export interface NotificationToggleProps {
  type: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export const NotificationToggle: React.FC<NotificationToggleProps> = ({
  type,
  checked,
  onChange,
  disabled = false,
}) => (
  <Toggle
    variant="success"
    checked={checked}
    onChange={onChange}
    disabled={disabled}
    label={`${type} Notifications`}
    description={checked ? 'You will receive notifications' : 'Notifications are disabled'}
  />
)

export { Toggle, toggleVariants }
export default Toggle