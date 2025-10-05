/**
 * Floating Form Container
 * 
 * Automatically adjusts form position when keyboard appears on tablets.
 * Ensures form fields remain visible and accessible above the keyboard.
 */

"use client"

import { ReactNode, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFloatingForm } from '@/hooks/use-tablet'

interface FloatingFormProps {
  children: ReactNode
  className?: string
  maxHeight?: string
}

export function FloatingForm({ 
  children, 
  className = '',
  maxHeight = '80vh'
}: FloatingFormProps) {
  const { isFormFloating, isKeyboardOpen, viewportHeight } = useFloatingForm()
  const [formHeight, setFormHeight] = useState(0)
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (formRef.current) {
      setFormHeight(formRef.current.scrollHeight)
    }
  }, [children])

  // Calculate available height when keyboard is open
  const availableHeight = isKeyboardOpen ? viewportHeight * 0.6 : viewportHeight
  const shouldFloat = isFormFloating && formHeight > availableHeight

  return (
    <motion.div
      ref={formRef}
      className={`relative ${className}`}
      animate={{
        y: shouldFloat ? -50 : 0,
        scale: shouldFloat ? 0.95 : 1,
      }}
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 300,
      }}
    >
      <AnimatePresence>
        {shouldFloat && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute -top-12 left-0 right-0 bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-lg z-10"
          >
            <div className="flex items-center space-x-2 text-blue-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">
                Form floating above keyboard for better visibility
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div 
        className="overflow-y-auto"
        style={{
          maxHeight: shouldFloat ? `${availableHeight}px` : maxHeight,
        }}
      >
        {children}
      </div>
    </motion.div>
  )
}
