import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

const selectVariants = cva(
  "flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-disney-blue focus:border-disney-blue disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-gray-300 focus:ring-disney-blue focus:border-disney-blue",
        error: "border-red-500 focus:ring-red-500 focus:border-red-500",
        success: "border-green-500 focus:ring-green-500 focus:border-green-500",
        disney: "border-disney-purple focus:ring-disney-purple focus:border-disney-purple",
      },
      size: {
        sm: "h-8 px-2 text-xs",
        md: "h-10 px-3 text-sm",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  icon?: React.ReactNode
  description?: string
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  options: SelectOption[]
  placeholder?: string
  label?: string
  helperText?: string
  error?: string
  success?: string
  leftIcon?: React.ReactNode
  onValueChange?: (value: string) => void
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({
    className,
    variant,
    size,
    options,
    placeholder,
    label,
    helperText,
    error,
    success,
    leftIcon,
    onValueChange,
    disabled,
    value,
    onChange,
    ...props
  }, ref) => {
    // Determine variant based on state
    const currentVariant = error ? 'error' : success ? 'success' : variant

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = event.target.value
      if (onChange) {
        onChange(event)
      }
      if (onValueChange) {
        onValueChange(newValue)
      }
    }

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10">
              {leftIcon}
            </div>
          )}

          <select
            ref={ref}
            className={cn(
              selectVariants({ variant: currentVariant, size }),
              leftIcon && "pl-10",
              "appearance-none cursor-pointer",
              className
            )}
            disabled={disabled}
            value={value}
            onChange={handleChange}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* Helper text, error, or success message */}
        {(helperText || error || success) && (
          <div className="mt-2 text-xs">
            {error && <span className="text-red-600">{error}</span>}
            {success && <span className="text-green-600">{success}</span>}
            {!error && !success && helperText && (
              <span className="text-gray-500">{helperText}</span>
            )}
          </div>
        )}
      </div>
    )
  }
)

Select.displayName = "Select"

// Specialized select components for common use cases

export interface ParkSelectProps {
  value: string
  onChange: (parkId: string) => void
  disabled?: boolean
  className?: string
}

const disneyParks: SelectOption[] = [
  { value: 'magic-kingdom', label: 'Magic Kingdom', icon: '🏰' },
  { value: 'epcot', label: 'EPCOT', icon: '🌐' },
  { value: 'hollywood-studios', label: 'Hollywood Studios', icon: '🎬' },
  { value: 'animal-kingdom', label: 'Animal Kingdom', icon: '🦁' },
  { value: 'disneyland', label: 'Disneyland', icon: '🎠' },
  { value: 'california-adventure', label: 'California Adventure', icon: '🎢' },
  { value: 'disneyland-paris', label: 'Disneyland Paris', icon: '🗼' },
  { value: 'tokyo-disneyland', label: 'Tokyo Disneyland', icon: '🗾' },
  { value: 'tokyo-disney-sea', label: 'Tokyo DisneySea', icon: '🌊' },
]

export const ParkSelect: React.FC<ParkSelectProps> = ({
  value,
  onChange,
  disabled = false,
  className,
}) => (
  <Select
    variant="disney"
    options={disneyParks}
    value={value}
    onValueChange={onChange}
    disabled={disabled}
    placeholder="Select a Disney park"
    label="Disney Park"
    className={className}
  />
)

export interface CategorySelectProps {
  value: string
  onChange: (category: string) => void
  categories: SelectOption[]
  disabled?: boolean
  placeholder?: string
  label?: string
  className?: string
}

export const CategorySelect: React.FC<CategorySelectProps> = ({
  value,
  onChange,
  categories,
  disabled = false,
  placeholder = "Select category",
  label = "Category",
  className,
}) => (
  <Select
    variant="default"
    options={categories}
    value={value}
    onValueChange={onChange}
    disabled={disabled}
    placeholder={placeholder}
    label={label}
    className={className}
  />
)

export interface FilterSelectProps {
  value: string
  onChange: (filter: string) => void
  filters: SelectOption[]
  disabled?: boolean
  placeholder?: string
  className?: string
}

export const FilterSelect: React.FC<FilterSelectProps> = ({
  value,
  onChange,
  filters,
  disabled = false,
  placeholder = "All items",
  className,
}) => (
  <Select
    variant="default"
    size="sm"
    options={[
      { value: 'all', label: 'All items' },
      ...filters
    ]}
    value={value}
    onValueChange={onChange}
    disabled={disabled}
    placeholder={placeholder}
    className={className}
  />
)

export { Select, selectVariants }
export default Select