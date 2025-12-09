/**
 * Tablet Data Entry Form
 * 
 * Optimized form component for tablet data entry with:
 * - Large touch targets
 * - Floating behavior when keyboard appears
 * - Tablet-specific input patterns
 * - Better spacing and typography
 */

"use client"

import { ReactNode, useState } from 'react'
import { FloatingForm } from '@/components/ui/floating-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTablet } from '@/hooks/use-tablet'
import { motion } from 'framer-motion'

interface TabletDataEntryFormProps {
  title: string
  children: ReactNode
  onSubmit?: () => void
  onCancel?: () => void
  isLoading?: boolean
  className?: string
}

export function TabletDataEntryForm({
  title,
  children,
  onSubmit,
  onCancel,
  isLoading = false,
  className = '',
}: TabletDataEntryFormProps) {
  const { isTablet, isLandscape } = useTablet()

  if (!isTablet || !isLandscape) {
    return <>{children}</>
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-lg">
          <CardHeader className=" from-blue-500 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <FloatingForm>
              <div className="space-y-6">
                {children}
              </div>
            </FloatingForm>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              {onCancel && (
                <Button
                  onClick={onCancel}
                  
                  size="lg"
                  className="min-w-[120px] h-12 text-base"
                >
                  Cancel
                </Button>
              )}
              {onSubmit && (
                <Button
                  onClick={onSubmit}
                  size="lg"
                  className="min-w-[120px] h-12 text-base"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// Tablet-optimized form field components
export function TabletFormField({ 
  label, 
  children, 
  required = false,
  className = '' 
}: {
  label: string
  children: ReactNode
  required?: boolean
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-base font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="min-h-[48px]">
        {children}
      </div>
    </div>
  )
}

export function TabletInput({ 
  className = '', 
  ...props 
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      className={`h-12 text-base px-4 ${className}`}
      {...props}
    />
  )
}

export function TabletTextarea({ 
  className = '', 
  ...props 
}: React.ComponentProps<typeof Textarea>) {
  return (
    <Textarea
      className={`min-h-[120px] text-base px-4 py-3 ${className}`}
      {...props}
    />
  )
}

export function TabletSelect({ 
  children, 
  className = '',
  ...props 
}: React.ComponentProps<typeof Select>) {
  return (
    <Select {...props}>
      <SelectTrigger className={`h-12 text-base ${className}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {children}
      </SelectContent>
    </Select>
  )
}

export function TabletSelectItem({ 
  children, 
  className = '',
  ...props 
}: React.ComponentProps<typeof SelectItem>) {
  return (
    <SelectItem className={`text-base py-3 ${className}`} {...props}>
      {children}
    </SelectItem>
  )
}

// Grid layout for tablet forms
export function TabletFormGrid({ 
  children, 
  columns = 2,
  className = '' 
}: {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
      {children}
    </div>
  )
}
