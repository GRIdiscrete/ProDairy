import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground focus-visible:border-[#006BC4] focus-visible:ring-[#006BC4]/20 aria-invalid:ring-red-500/20 aria-invalid:border-red-500 dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base transition-all duration-300 outline-none focus-visible:ring-4 hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm gdairen-textarea",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
