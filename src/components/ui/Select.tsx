import React, { forwardRef } from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, Check } from 'lucide-react'

const selectVariants = cva(
  "flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-gray-300 focus:ring-disney-blue focus:border-disney-blue data-[state=open]:ring-disney-blue data-[state=open]:border-disney-blue",
        error: "border-red-500 focus:ring-red-500 focus:border-red-500 data-[state=open]:ring-red-500 data-[state=open]:border-red-500",
        success: "border-green-500 focus:ring-green-500 focus:border-green-500 data-[state=open]:ring-green-500 data-[state=open]:border-green-500",
        disney: "border-disney-purple focus:ring-disney-purple focus:border-disney-purple data-[state=open]:ring-disney-purple data-[state=open]:border-disney-purple",
        outline: "border-gray-300 bg-transparent focus:ring-gray-500 focus:border-gray-500 data-[state=open]:ring-gray-500 data-[state=open]:border-gray-500",
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
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>,
    VariantProps<typeof selectVariants> {
  options: SelectOption[]
  placeholder?: string
  label?: string
  helperText?: string
  error?: string
  success?: string
  leftIcon?: React.ReactNode
  className?: string
}

const Select = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectProps
>(({
  className,
  variant,
  size,
  options,
  placeholder = "Select an option...",
  label,
  helperText,
  error,
  success,
  leftIcon,
  children,
  ...props
}, ref) => {
  const generatedId = React.useId()
  const selectId = props.name || generatedId

  // Determine variant based on state
  const currentVariant = error ? 'error' : success ? 'success' : variant

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <SelectPrimitive.Root {...props}>
        <SelectPrimitive.Trigger
          ref={ref}
          id={selectId}
          className={cn(selectVariants({ variant: currentVariant, size }), className)}
        >
          <div className="flex items-center space-x-2 flex-1">
            {leftIcon && (
              <span className="text-gray-400 flex-shrink-0">
                {leftIcon}
              </span>
            )}
            <SelectPrimitive.Value placeholder={placeholder} />
          </div>
          <SelectPrimitive.Icon asChild>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className={cn(
              "relative z-50 min-w-[8rem] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
              "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            )}
            position="popper"
            sideOffset={4}
          >
            <SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-1">
              <ChevronUp className="h-4 w-4 text-gray-400" />
            </SelectPrimitive.ScrollUpButton>

            <SelectPrimitive.Viewport className="p-1">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-lg py-2.5 px-3 text-sm outline-none",
                    "focus:bg-disney-blue focus:text-white",
                    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  )}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {option.icon && (
                      <span className="flex-shrink-0">
                        {option.icon}
                      </span>
                    )}
                    <div className="flex-1">
                      <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                      {option.description && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <SelectPrimitive.ItemIndicator>
                    <Check className="h-4 w-4" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>

            <SelectPrimitive.ScrollDownButton className="flex cursor-default items-center justify-center py-1">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      {/* Helper text, error, or success message */}
      {(helperText || error || success) && (
        <div className="mt-2">
          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}
          {success && !error && (
            <p className="text-xs text-green-600">{success}</p>
          )}
          {helperText && !error && !success && (
            <p className="text-xs text-gray-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  )
})

Select.displayName = SelectPrimitive.Trigger.displayName

// Specialized select components for common use cases
export const ParkSelect = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  Omit<SelectProps, 'variant' | 'options'> & {
    includedParks?: string[]
  }
>(({ includedParks, ...props }, ref) => {
  const parkOptions: SelectOption[] = [
    { value: 'magic-kingdom', label: 'Magic Kingdom', icon: '🏰' },
    { value: 'epcot', label: 'EPCOT', icon: '🌍' },
    { value: 'hollywood-studios', label: 'Hollywood Studios', icon: '🎬' },
    { value: 'animal-kingdom', label: 'Animal Kingdom', icon: '🦁' },
    { value: 'disneyland', label: 'Disneyland', icon: '🎡' },
    { value: 'california-adventure', label: 'California Adventure', icon: '🎢' },
  ].filter(park => !includedParks || includedParks.includes(park.value))

  return (
    <Select
      ref={ref}
      variant="disney"
      options={parkOptions}
      placeholder="Select a Disney park..."
      {...props}
    />
  )
})

export const CategorySelect = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  Omit<SelectProps, 'variant' | 'options'> & {
    categories: SelectOption[]
  }
>(({ categories, ...props }, ref) => (
  <Select
    ref={ref}
    variant="default"
    options={categories}
    placeholder="Select a category..."
    {...props}
  />
))

export const FilterSelect = forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  Omit<SelectProps, 'variant'>
>(({ ...props }, ref) => (
  <Select
    ref={ref}
    variant="outline"
    {...props}
  />
))

ParkSelect.displayName = "ParkSelect"
CategorySelect.displayName = "CategorySelect"
FilterSelect.displayName = "FilterSelect"

export { Select, selectVariants }