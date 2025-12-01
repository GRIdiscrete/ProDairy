import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer hover:cursor-pointer relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transform hover:scale-105",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 transform hover:scale-105",
        outline:
          "border-2 border-blue-500 bg-transparent text-blue-600 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 hover:text-white transform hover:scale-105 transition-all duration-300",
        secondary:
          "bg-gradient-to-r from-gray-500 to-slate-500 text-white hover:from-gray-600 hover:to-slate-600 transform hover:scale-105",
        ghost: "hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-600 transition-all duration-300",
        link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 transition-colors duration-300",
        gdairen: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transform hover:scale-105",
        gdairenOutline: "border-2 border-blue-500 bg-transparent text-blue-600 hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-600 hover:text-white transform hover:scale-105 transition-all duration-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "gdairen",
      size: "default",
    },
  }
)

export interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, loadingText, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading && loadingText ? loadingText : children}
      </Comp>
    )
  }
)
LoadingButton.displayName = "LoadingButton"

export { LoadingButton, buttonVariants }
