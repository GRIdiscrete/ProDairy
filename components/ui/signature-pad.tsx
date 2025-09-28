"use client"

import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, RotateCcw } from 'lucide-react'

interface SignaturePadProps {
  value?: string
  onChange: (signature: string) => void
  onClear?: () => void
  width?: number
  height?: number
  className?: string
}

export function SignaturePad({ 
  value, 
  onChange, 
  onClear,
  width = 300, 
  height = 150,
  className = ""
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = width
    canvas.height = height

    // Set drawing styles
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Load existing signature if provided
    if (value) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height)
        setHasSignature(true)
      }
      img.src = value
    }
  }, [value, width, height])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (!isDrawing) return

    setIsDrawing(false)
    setHasSignature(true)
    
    // Get signature data URL
    const canvas = canvasRef.current
    if (!canvas) return

    const dataURL = canvas.toDataURL('image/png')
    onChange(dataURL)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    onChange('')
    onClear?.()
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const touch = e.touches[0]
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    })
    canvasRef.current?.dispatchEvent(mouseEvent)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const touch = e.touches[0]
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    })
    canvasRef.current?.dispatchEvent(mouseEvent)
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const mouseEvent = new MouseEvent('mouseup', {})
    canvasRef.current?.dispatchEvent(mouseEvent)
  }

  return (
    <div className={`border border-gray-200 rounded-lg bg-white ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-light text-gray-700">Signature</h3>
          {hasSignature && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearSignature}
              className="h-8 px-3 text-xs font-light border-gray-200 rounded-full"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="block cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ width: `${width}px`, height: `${height}px` }}
          />
        </div>
        
        {!hasSignature && (
          <p className="text-xs text-gray-500 mt-2 text-center font-light">
            Sign above to capture your signature
          </p>
        )}
      </div>
    </div>
  )
}

// Export utility function to get signature data URL from canvas
export function getSignatureDataUrl(canvas: HTMLCanvasElement | null): string {
  if (!canvas) return ''
  return canvas.toDataURL('image/png')
}