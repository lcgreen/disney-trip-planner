import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Check, Minus } from 'lucide-react'

const checkboxVariants = cva(
  "peer h-4 w-4 shrink-0 rounded border-2 border-gray-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
  {
    variants: {
      variant: {
        default: "data-[state=checked]:bg-disney-blue data-[state=checked]:border-disney-blue data-[state=checked]:text-white focus-visible:ring-disney-blue",
        disney: "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-disney-blue data-[state=checked]:to-disney-purple data-[state=checked]:border-disney-purple data-[state=checked]:text-white focus-visible:ring-disney-purple",
        premium: "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-disney-gold data-[state=checked]:to-disney-orange data-[state=checked]:border-disney-orange data-[state=checked]:text-disney-blue focus-visible:ring-disney-gold",
        success: "data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 data-[state=checked]:text-white focus-visible:ring-green-500",
        warning: "data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500 data-[state=checked]:text-white focus-visible:ring-yellow-500",
        error: "data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 data-[state=checked]:text-white focus-visible:ring-red-500",
      },
      size: {
        sm: "h-3 w-3",
        md: "h-4 w-4",
        lg: "h-5 w-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof checkboxVariants> {
  label?: string
  description?: string
  indeterminate?: boolean
  onCheckedChange?: (checked: boolean | 'indeterminate') => void
  labelPosition?: 'left' | 'right'
  required?: boolean
  error?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({
    className,
    variant,
    size,
    label,
    description,
    indeterminate = false,
    onCheckedChange,
    labelPosition = 'right',
    required = false,
    error,
    checked,
    onChange,
    disabled,
    ...props
  }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = event.target.checked
      if (onChange) {
        onChange(event)
      }
      if (onCheckedChange) {
        onCheckedChange(newChecked)
      }
    }

    const checkboxElement = (
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          ref={ref}
          className={cn(
            checkboxVariants({ variant, size }),
            "absolute opacity-0 pointer-events-none",
            className
          )}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          data-state={indeterminate ? "indeterminate" : checked ? "checked" : "unchecked"}
          {...props}
        />
        <div
          className={cn(
            checkboxVariants({ variant, size }),
            "flex items-center justify-center",
            checked && "bg-current border-current",
            indeterminate && "bg-current border-current",
            error && "border-red-500"
          )}
          data-state={indeterminate ? "indeterminate" : checked ? "checked" : "unchecked"}
        >
          {checked && !indeterminate && (
            <Check className={cn(
              "text-current",
              size === 'sm' ? "w-2 h-2" : size === 'lg' ? "w-4 h-4" : "w-3 h-3"
            )} />
          )}
          {indeterminate && (
            <Minus className={cn(
              "text-current",
              size === 'sm' ? "w-2 h-2" : size === 'lg' ? "w-4 h-4" : "w-3 h-3"
            )} />
          )}
        </div>
      </div>
    )

    if (!label && !description) {
      return checkboxElement
    }

    const labelContent = (
      <div className="flex flex-col">
        <label className={cn(
          "text-sm font-medium text-gray-700 cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed",
          error && "text-red-700"
        )}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {description && (
          <span className={cn(
            "text-xs text-gray-500 mt-1",
            disabled && "opacity-50",
            error && "text-red-600"
          )}>
            {description}
          </span>
        )}
        {error && (
          <span className="text-xs text-red-600 mt-1">
            {error}
          </span>
        )}
      </div>
    )

    return (
      <div className={cn(
        "flex items-start gap-3",
        labelPosition === 'left' ? 'flex-row-reverse' : 'flex-row',
        disabled && "cursor-not-allowed"
      )}>
        {checkboxElement}
        {labelContent}
      </div>
    )
  }
)

Checkbox.displayName = "Checkbox"

// Specialized checkbox components for common use cases

export interface SettingsCheckboxProps {
  setting: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export const SettingsCheckbox: React.FC<SettingsCheckboxProps> = ({
  setting,
  description,
  checked,
  onChange,
  disabled = false,
}) => (
  <Checkbox
    variant="disney"
    label={setting}
    description={description}
    checked={checked}
    onCheckedChange={(checked) => onChange(checked as boolean)}
    disabled={disabled}
  />
)

export interface PackingItemCheckboxProps {
  item: string
  isEssential?: boolean
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export const PackingItemCheckbox: React.FC<PackingItemCheckboxProps> = ({
  item,
  isEssential = false,
  checked,
  onChange,
  disabled = false,
}) => (
  <Checkbox
    variant={isEssential ? "error" : "success"}
    label={item}
    description={isEssential ? "Essential item" : undefined}
    checked={checked}
    onCheckedChange={(checked) => onChange(checked as boolean)}
    disabled={disabled}
  />
)

export interface FeatureCheckboxProps {
  feature: string
  isPremium?: boolean
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export const FeatureCheckbox: React.FC<FeatureCheckboxProps> = ({
  feature,
  isPremium = false,
  checked,
  onChange,
  disabled = false,
}) => (
  <Checkbox
    variant={isPremium ? "premium" : "disney"}
    label={feature}
    description={isPremium ? "Premium feature" : undefined}
    checked={checked}
    onCheckedChange={(checked) => onChange(checked as boolean)}
    disabled={disabled}
  />
)

export interface AgreeCheckboxProps {
  agreementText: string
  checked: boolean
  onChange: (checked: boolean) => void
  required?: boolean
  error?: string
}

export const AgreeCheckbox: React.FC<AgreeCheckboxProps> = ({
  agreementText,
  checked,
  onChange,
  required = true,
  error,
}) => (
  <Checkbox
    variant="default"
    label={agreementText}
    checked={checked}
    onCheckedChange={(checked) => onChange(checked as boolean)}
    required={required}
    error={error}
  />
)

export { Checkbox, checkboxVariants }
export default Checkbox