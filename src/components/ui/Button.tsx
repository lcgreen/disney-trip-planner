import React, { forwardRef, ButtonHTMLAttributes } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        disney: "bg-gradient-to-r from-disney-blue to-disney-purple text-white shadow-lg hover:shadow-xl hover:scale-[1.02] focus-visible:ring-disney-blue",
        premium: "bg-gradient-to-r from-disney-gold to-disney-orange text-disney-blue font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] focus-visible:ring-disney-gold",
        secondary: "bg-white border border-gray-300 text-gray-700 shadow-sm hover:shadow-md hover:bg-gray-50 focus-visible:ring-gray-500",
        outline: "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-500",
        ghost: "text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500",
        link: "text-disney-blue underline-offset-4 hover:underline focus-visible:ring-disney-blue",
        // Park-specific variants
        magicKingdom: "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] focus-visible:ring-blue-500",
        epcot: "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] focus-visible:ring-purple-500",
        hollywoodStudios: "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] focus-visible:ring-red-500",
        animalKingdom: "bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] focus-visible:ring-green-500",
        disneyland: "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] focus-visible:ring-orange-500",
      },
      size: {
        sm: "h-8 px-4 text-sm rounded-full",
        md: "h-10 px-6 text-base rounded-full",
        lg: "h-12 px-8 text-lg rounded-full",
        xl: "h-14 px-10 text-xl rounded-full",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
    },
    defaultVariants: {
      variant: "disney",
      size: "md",
      fullWidth: false,
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    fullWidth,
    loading,
    icon,
    iconPosition = 'left',
    children,
    disabled,
    asChild = false,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading

    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}

        {icon && iconPosition === 'left' && !loading && (
          <span className="mr-2 flex items-center">{icon}</span>
        )}

        {children}

        {icon && iconPosition === 'right' && !loading && (
          <span className="ml-2 flex items-center">{icon}</span>
        )}
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }