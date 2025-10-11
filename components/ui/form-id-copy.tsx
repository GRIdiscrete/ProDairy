"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface FormIdCopyProps {
  displayId: string
  actualId: string
  showCopyButton?: boolean
  size?: "sm" | "md" | "lg"
}

export function FormIdCopy({ displayId, actualId, showCopyButton = true, size = "md" }: FormIdCopyProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(actualId)
      setCopied(true)
      toast.success("Form ID copied to clipboard")
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      toast.error("Failed to copy form ID")
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          text: "text-xs",
          subtitle: "text-xs",
          button: "h-6 w-6",
          icon: "h-3 w-3"
        }
      case "lg":
        return {
          text: "text-lg",
          subtitle: "text-sm",
          button: "h-10 w-10",
          icon: "h-5 w-5"
        }
      default:
        return {
          text: "text-sm",
          subtitle: "text-xs",
          button: "h-8 w-8",
          icon: "h-4 w-4"
        }
    }
  }

  const sizeClasses = getSizeClasses()

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col">
        <div className={`font-light ${sizeClasses.text}`}>{displayId}</div>
        <div className={`text-gray-500 font-light ${sizeClasses.subtitle}`}>
          Driver Form
        </div>
      </div>
      
      {showCopyButton && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`${sizeClasses.button} p-0 hover:bg-gray-100 rounded-full`}
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className={`${sizeClasses.icon} text-green-600`} />
                ) : (
                  <Copy className={`${sizeClasses.icon} text-gray-500`} />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{copied ? "Copied!" : "Copy full form ID"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}