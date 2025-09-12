import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-10 w-full min-w-0 rounded-full border border-gray-300 bg-white px-4 py-3 text-base transition-all duration-300 outline-none file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-blue-500 focus-visible:ring-blue-500/20 focus-visible:ring-4",
          "hover:border-gray-400",
          "aria-invalid:ring-red-500/20 aria-invalid:border-red-500",
          "gdairen-input",
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
