"use client"

import { Toaster } from "sonner"

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      expand={false}
      richColors
      closeButton
      style={{
        zIndex: 9999,
      }}
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          backdropFilter: 'blur(8px)',
          fontSize: '14px',
          fontWeight: '500',
          padding: '16px',
          minHeight: '64px',
          width: '400px',
          zIndex: 9999,
        },
        className: 'toast-notification',
        classNames: {
          success: 'toast-success',
          error: 'toast-error',
          warning: 'toast-warning',
          info: 'toast-info',
        },
      }}
    />
  )
}
