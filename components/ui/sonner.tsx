"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "hsl(var(--background))",
          "--normal-text": "hsl(var(--foreground))",
          "--normal-border": "hsl(var(--border))",
          "--success-bg": "#10b981",
          "--success-text": "#ffffff",
          "--success-border": "#059669",
          "--error-bg": "#ef4444",
          "--error-text": "#ffffff", 
          "--error-border": "#dc2626",
          "--warning-bg": "#f59e0b",
          "--warning-text": "#ffffff",
          "--warning-border": "#d97706",
          "--info-bg": "#3b82f6",
          "--info-text": "#ffffff",
          "--info-border": "#2563eb",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
