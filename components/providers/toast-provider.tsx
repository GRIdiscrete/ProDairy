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
        error: {
          style: {
            background: '#fef2f2',
            color: '#dc2626',
            border: '2px solid #fecaca',
            fontWeight: '700',
            fontSize: '15px',
          },
        },
        success: {
          style: {
            background: '#f0fdf4',
            color: '#16a34a',
            border: '2px solid #bbf7d0',
            fontWeight: '600',
            fontSize: '15px',
          },
        },
        warning: {
          style: {
            background: '#fffbeb',
            color: '#d97706',
            border: '2px solid #fed7aa',
            fontWeight: '600',
            fontSize: '15px',
          },
        },
        info: {
          style: {
            background: '#eff6ff',
            color: '#2563eb',
            border: '2px solid #bfdbfe',
            fontWeight: '600',
            fontSize: '15px',
          },
        },
      }}
    />
  )
}
