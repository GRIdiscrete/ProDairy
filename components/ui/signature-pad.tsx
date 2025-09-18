"use client"

import React, { useEffect, useRef, useState } from "react"

interface SignaturePadProps {
  width?: number
  height?: number
  penColor?: string
  backgroundColor?: string
  className?: string
  onChange?: (isEmpty: boolean) => void
}

// Simple canvas-based signature pad with mouse/touch support.
export const SignaturePad: React.FC<SignaturePadProps> = ({
  width = 600,
  height = 240,
  penColor = "#111827",
  backgroundColor = "#ffffff",
  className,
  onChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const [isEmpty, setIsEmpty] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctxRef.current = ctx
    // Initialize background
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [backgroundColor])

  const getCanvasPos = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    if (e instanceof TouchEvent) {
      const t = e.touches[0] || e.changedTouches[0]
      return { x: t.clientX - rect.left, y: t.clientY - rect.top }
    } else {
      const m = e as MouseEvent
      return { x: m.clientX - rect.left, y: m.clientY - rect.top }
    }
  }

  const startDrawing = (e: MouseEvent | TouchEvent) => {
    e.preventDefault()
    drawingRef.current = true
    const pos = getCanvasPos(e)
    lastPointRef.current = pos
  }

  const stopDrawing = (e?: MouseEvent | TouchEvent) => {
    if (e) e.preventDefault()
    drawingRef.current = false
    lastPointRef.current = null
  }

  const draw = (e: MouseEvent | TouchEvent) => {
    if (!drawingRef.current) return
    e.preventDefault()
    const ctx = ctxRef.current
    const canvas = canvasRef.current
    if (!ctx || !canvas) return
    const current = getCanvasPos(e)
    const last = lastPointRef.current || current
    ctx.strokeStyle = penColor
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.beginPath()
    ctx.moveTo(last.x, last.y)
    ctx.lineTo(current.x, current.y)
    ctx.stroke()
    lastPointRef.current = current
    if (isEmpty) {
      setIsEmpty(false)
      onChange?.(false)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => startDrawing(e.nativeEvent)
  const handleMouseMove = (e: React.MouseEvent) => draw(e.nativeEvent)
  const handleMouseUp = (e: React.MouseEvent) => stopDrawing(e.nativeEvent)
  const handleMouseLeave = (e: React.MouseEvent) => stopDrawing(e.nativeEvent)

  const handleTouchStart = (e: React.TouchEvent) => startDrawing(e.nativeEvent)
  const handleTouchMove = (e: React.TouchEvent) => draw(e.nativeEvent)
  const handleTouchEnd = (e: React.TouchEvent) => stopDrawing(e.nativeEvent)

  const clear = () => {
    const ctx = ctxRef.current
    const canvas = canvasRef.current
    if (!ctx || !canvas) return
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setIsEmpty(true)
    onChange?.(true)
  }

  // Expose clear via property on element
  ;(SignaturePad as any).clear = clear

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full border border-gray-200 rounded-md touch-none bg-white"
      />
    </div>
  )
}

export const getSignatureDataUrl = (canvas: HTMLCanvasElement | null) => {
  if (!canvas) return ""
  return canvas.toDataURL("image/png")
}


