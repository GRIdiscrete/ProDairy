import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ReduxProvider } from "@/lib/providers/redux-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { ToastProvider } from "@/components/providers/toast-provider"
import { AuthProvider } from "@/components/providers/auth-provider"
import { OfflineProvider } from "@/components/providers/offline-provider"
import { OrientationLock } from "@/components/layout/orientation-lock"

export const metadata: Metadata = {
  title: "ProDairy Admin - Dairy Management System",
  description: "ProDairy Admin Dashboard - Comprehensive dairy manufacturing and production management system",
  generator: "ProDairy Admin",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ReduxProvider>
            <AuthProvider>
              <OfflineProvider>
                <OrientationLock>
                  {children}
                  <ToastProvider />
                </OrientationLock>
              </OfflineProvider>
            </AuthProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
