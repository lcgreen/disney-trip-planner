import React, { forwardRef } from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Check, Minus } from 'lucide-react'

const checkboxVariants = cva(
  "peer h-4 w-4 shrink-0 rounded border-2 border-gray-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 data-[state=checked]:text-white",
  {
    variants: {
      variant: {
        default: "data-[state=checked]:bg-disney-blue data-[state=checked]:border-disney-blue focus-visible:ring-disney-blue",
        disney: "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-disney-blue data-[state=checked]:to-disney-purple data-[state=checked]:border-disney-purple focus-visible:ring-disney-purple",
        premium: "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-disney-gold data-[state=checked]:to-disney-orange data-[state=checked]:border-disney-orange data-[state=checked]:text-disney-blue focus-visible:ring-disney-gold",
        success: "data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 focus-visible:ring-green-500",
        warning: "data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500 focus-visible:ring-yellow-500",
        error: "data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 focus-visible:ring-red-500",
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
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {
  label?: string
  description?: string
  labelPosition?: 'left' | 'right'
  error?: string
}

const Checkbox = forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({
  className,
  variant,
  size,
  label,
  description,
  labelPosition = 'right',
  error,
  id,
  ...props
}, ref) => {
  const generatedId = React.useId()
  const checkboxId = id || generatedId

  const CheckboxComponent = (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(checkboxVariants({ variant, size }), className)}
      id={checkboxId}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        {props.checked === 'indeterminate' ? (
          <Minus className="h-3 w-3" />
        ) : (
          <Check className="h-3 w-3" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )

  if (!label && !description) {
    return CheckboxComponent
  }

  return (
    <div className="flex items-start space-x-3">
      {labelPosition === 'left' && (
        <div className="flex-1">
          {label && (
            <label
              htmlFor={checkboxId}
              className={cn(
                "text-sm font-medium leading-none cursor-pointer",
                error ? "text-red-600" : "text-gray-900",
                props.disabled && "cursor-not-allowed opacity-50"
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p className={cn(
              "text-xs mt-1 leading-relaxed",
              error ? "text-red-500" : "text-gray-600",
              props.disabled && "opacity-50"
            )}>
              {description}
            </p>
          )}
          {error && (
            <p className="text-xs text-red-500 mt-1">{error}</p>
          )}
        </div>
      )}

      <div className="flex">
        {CheckboxComponent}
      </div>

      {labelPosition === 'right' && (
        <div className="flex-1">
          {label && (
            <label
              htmlFor={checkboxId}
              className={cn(
                "text-sm font-medium leading-none cursor-pointer",
                error ? "text-red-600" : "text-gray-900",
                props.disabled && "cursor-not-allowed opacity-50"
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p className={cn(
              "text-xs mt-1 leading-relaxed",
              error ? "text-red-500" : "text-gray-600",
              props.disabled && "opacity-50"
            )}>
              {description}
            </p>
          )}
          {error && (
            <p className="text-xs text-red-500 mt-1">{error}</p>
          )}
        </div>
      )}
    </div>
  )
})

Checkbox.displayName = CheckboxPrimitive.Root.displayName

// Specialized checkbox components for common use cases
export const SettingsCheckbox = forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  Omit<CheckboxProps, 'variant'>
>((props, ref) => (
  <Checkbox ref={ref} variant="disney" {...props} />
))

export const PackingItemCheckbox = forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  Omit<CheckboxProps, 'variant'>
>((props, ref) => (
  <Checkbox ref={ref} variant="success" {...props} />
))

export const FeatureCheckbox = forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  Omit<CheckboxProps, 'variant'>
>((props, ref) => (
  <Checkbox ref={ref} variant="premium" {...props} />
))

export const AgreeCheckbox = forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  Omit<CheckboxProps, 'variant'>
>((props, ref) => (
  <Checkbox ref={ref} variant="default" {...props} />
))

SettingsCheckbox.displayName = "SettingsCheckbox"
PackingItemCheckbox.displayName = "PackingItemCheckbox"
FeatureCheckbox.displayName = "FeatureCheckbox"
AgreeCheckbox.displayName = "AgreeCheckbox"

export { Checkbox, checkboxVariants }