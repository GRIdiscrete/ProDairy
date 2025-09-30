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
  responsive?: boolean
}

export function SignaturePad({ 
  value, 
  onChange, 
  onClear,
  width = 400, 
  height = 100,
  className = "",
  responsive = true
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width, height })

  // Handle responsive sizing
  useEffect(() => {
    if (!responsive) return

    const updateSize = () => {
      const container = containerRef.current
      if (!container) return

      const containerWidth = container.offsetWidth
      const containerHeight = container.offsetHeight
      
      // Use full container dimensions
      setCanvasSize({ width: containerWidth, height: containerHeight })
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [responsive])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Use responsive size if enabled, otherwise use props
    const finalWidth = responsive ? canvasSize.width : width
    const finalHeight = responsive ? canvasSize.height : height

    // Set canvas size
    canvas.width = finalWidth
    canvas.height = finalHeight

    // Set drawing styles
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Load existing signature if provided
    if (value) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, finalWidth, finalHeight)
        setHasSignature(true)
      }
      img.src = value
    }
  }, [value, width, height, canvasSize, responsive])

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

  const finalWidth = responsive ? canvasSize.width : width
  const finalHeight = responsive ? canvasSize.height : height

  return (
    <div className={`w-full h-full flex flex-col ${className}`} ref={containerRef}>
      <div className="flex-1 w-full h-full relative bg-white border-2 border-dashed border-gray-300">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ 
            width: '100%', 
            height: '100%'
          }}
        />
        
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm text-gray-400 font-light bg-white/90 px-4 py-2 rounded-full border border-gray-200">
              Sign here to capture your signature
            </p>
          </div>
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