import React, { forwardRef } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const tooltipVariants = cva(
  "z-50 overflow-hidden rounded-lg px-3 py-2 text-sm shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  {
    variants: {
      variant: {
        default: "bg-gray-900 text-white",
        disney: "bg-gradient-to-r from-disney-blue to-disney-purple text-white shadow-xl border border-disney-purple/20",
        premium: "bg-gradient-to-r from-disney-gold to-disney-orange text-disney-blue shadow-xl border border-disney-gold/30",
        success: "bg-green-600 text-white border border-green-500/20",
        warning: "bg-yellow-600 text-white border border-yellow-500/20",
        error: "bg-red-600 text-white border border-red-500/20",
        light: "bg-white text-gray-900 border border-gray-200 shadow-lg",
      },
      size: {
        sm: "px-2 py-1 text-xs",
        md: "px-3 py-2 text-sm",
        lg: "px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

const TooltipProvider = TooltipPrimitive.Provider

const TooltipRoot = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> &
    VariantProps<typeof tooltipVariants>
>(({ className, variant, size, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(tooltipVariants({ variant, size }), className)}
    {...props}
  />
))

TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Compound component for easier usage
export interface TooltipProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>,
    VariantProps<typeof tooltipVariants> {
  children: React.ReactNode
  content: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
  delayDuration?: number
  disableHoverableContent?: boolean
  className?: string
  contentClassName?: string
}

const Tooltip = forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  TooltipProps
>(({
  children,
  content,
  variant,
  size,
  side = 'top',
  sideOffset = 4,
  delayDuration = 300,
  disableHoverableContent = false,
  className,
  contentClassName,
  ...props
}, ref) => (
  <TooltipRoot delayDuration={delayDuration} disableHoverableContent={disableHoverableContent} {...props}>
    <TooltipTrigger ref={ref} className={className} asChild>
      {children}
    </TooltipTrigger>
    <TooltipContent
      side={side}
      sideOffset={sideOffset}
      variant={variant}
      size={size}
      className={contentClassName}
    >
      {content}
    </TooltipContent>
  </TooltipRoot>
))

Tooltip.displayName = "Tooltip"

// Specialized tooltip components for Disney app
export const DisneyTooltip = forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  Omit<TooltipProps, 'variant'>
>((props, ref) => (
  <Tooltip ref={ref} variant="disney" {...props} />
))

export const PremiumTooltip = forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  Omit<TooltipProps, 'variant'>
>((props, ref) => (
  <Tooltip ref={ref} variant="premium" {...props} />
))

export const HelpTooltip = forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  Omit<TooltipProps, 'variant' | 'size' | 'side'>
>((props, ref) => (
  <Tooltip ref={ref} variant="light" size="sm" side="top" {...props} />
))

export const FeatureTooltip = forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  Omit<TooltipProps, 'variant' | 'delayDuration'>
>(({ children, content, ...props }, ref) => (
  <Tooltip
    ref={ref}
    variant="disney"
    delayDuration={100}
    content={
      <div className="max-w-xs">
        <div className="font-semibold mb-1">✨ Disney Feature</div>
        <div className="text-xs opacity-90">{content}</div>
      </div>
    }
    {...props}
  >
    {children}
  </Tooltip>
))

DisneyTooltip.displayName = "DisneyTooltip"
PremiumTooltip.displayName = "PremiumTooltip"
HelpTooltip.displayName = "HelpTooltip"
FeatureTooltip.displayName = "FeatureTooltip"

export {
  Tooltip,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
  tooltipVariants,
}