import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-[#006BC4] text-white hover:bg-[#0056a0]",
        destructive:
          "bg-red-600 text-white hover:bg-red-700",
        outline:
          "border-2 border-[#006BC4] bg-transparent text-blue-600 hover:bg-[#006BC4] hover:text-white transition-all duration-300",
        secondary:
          "bg-gray-500 text-white hover:bg-gray-600",
        ghost:
          "hover:bg-blue-50 hover:text-blue-600 transition-all duration-300",
        link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 transition-colors duration-300",
        gdairen: "bg-[#006BC4] text-white hover:bg-[#0056a0]",
        gdairenOutline: "border-2 border-[#006BC4] bg-transparent text-blue-600 hover:bg-[#006BC4] hover:text-white transition-all duration-300",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "gdairen",
      size: "default",
    },
  }
)

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
