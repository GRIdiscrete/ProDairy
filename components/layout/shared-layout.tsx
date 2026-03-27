"use client"

import type React from "react"
import { Header } from "./header"

interface SharedLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export function SharedLayout({ children, title, subtitle }: SharedLayoutProps) {
  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-1 flex-col">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}


