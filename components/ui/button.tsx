import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border-2",
  {
    variants: {
      variant: {
        // Original shadcn variants
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        
        // Supabase-style variants with custom orange-red colors (lighter on hover)
        "supabase-primary": 
          "bg-[#FF4B18] text-white border-[#e6420f] hover:bg-[#FF6B3D] hover:border-[#FF4B18] active:bg-[#e6420f] shadow-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF4B18]/20 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
        "supabase-default":
          "bg-white dark:bg-[#1c1c1c] text-[#1f2937] dark:text-white border-[#d1d5db] dark:border-[#374151] hover:bg-[#ffffff] dark:hover:bg-[#2a2a2a] hover:border-[#e5e7eb] dark:hover:border-[#525252] shadow-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6b7280]/20 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
        "supabase-secondary":
          "bg-[#f3f4f6] dark:bg-[#262626] text-[#1f2937] dark:text-white border-[#d1d5db] dark:border-[#404040] hover:bg-[#f9fafb] dark:hover:bg-[#333333] hover:border-[#e5e7eb] dark:hover:border-[#525252] shadow-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6b7280]/20 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
        "supabase-warning":
          "bg-[#f59e0b] text-white border-[#d97706] hover:bg-[#fbbf24] hover:border-[#f59e0b] active:bg-[#d97706] shadow-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/20 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
        "supabase-destructive":
          "bg-[#ef4444] text-white border-[#dc2626] hover:bg-[#f87171] hover:border-[#ef4444] active:bg-[#dc2626] shadow-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#ef4444]/20 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
        "supabase-outline":
          "bg-transparent text-[#1f2937] dark:text-white border-[#d1d5db] dark:border-[#374151] hover:bg-[#f9fafb] dark:hover:bg-[#1c1c1c] hover:border-[#e5e7eb] dark:hover:border-[#525252] shadow-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6b7280]/20 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
        "supabase-ghost":
          "bg-transparent text-[#1f2937] dark:text-white border-transparent hover:bg-[#f9fafb] dark:hover:bg-[#2a2a2a] hover:border-[#f3f4f6] dark:hover:border-[#404040] font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6b7280]/20 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
        "supabase-link":
          "bg-transparent text-[#FF4B18] hover:text-[#FF6B3D] border-transparent underline-offset-4 hover:underline font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF4B18]/20 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-11 rounded-md px-6 has-[>svg]:px-4 text-base",
        icon: "size-9",
        "supabase-tiny": "h-6 px-2 py-1 text-xs rounded",
        "supabase-small": "h-8 px-3 py-1.5 text-sm rounded-md",
        "supabase-medium": "h-9 px-4 py-2 text-sm rounded-md", 
        "supabase-large": "h-11 px-6 py-2.5 text-base rounded-md",
        "supabase-xlarge": "h-12 px-8 py-3 text-lg rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface ButtonProps extends Omit<React.ComponentProps<"button">, 'type'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconRight?: React.ReactNode
  // Support for Supabase-style appearance prop (maps to variant)
  appearance?: 'primary' | 'default' | 'secondary' | 'warning' | 'destructive' | 'danger' | 'outline' | 'ghost' | 'text' | 'link'
  // Keep native HTML button type separate
  type?: 'button' | 'submit' | 'reset'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, icon, iconRight, appearance, children, disabled, type = 'button', ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Map Supabase appearance prop to variant
    const getVariant = () => {
      if (appearance) {
        switch (appearance) {
          case 'primary':
            return 'supabase-primary'
          case 'default':
            return 'supabase-default'
          case 'secondary':
            return 'supabase-secondary'
          case 'warning':
            return 'supabase-warning'
          case 'destructive':
          case 'danger':
            return 'supabase-destructive'
          case 'outline':
            return 'supabase-outline'
          case 'ghost':
          case 'text':
            return 'supabase-ghost'
          case 'link':
            return 'supabase-link'
          default:
            return variant
        }
      }
      return variant
    }

    const isDisabled = disabled || loading

    return (
      <Comp
        ref={ref}
        data-slot="button"
        type={asChild ? undefined : type}
        className={cn(buttonVariants({ variant: getVariant(), size, className }))}
        disabled={isDisabled}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" />}
        {!loading && icon && icon}
        {children}
        {!loading && iconRight && iconRight}
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
export type { ButtonProps }