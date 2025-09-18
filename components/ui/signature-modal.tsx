"use client"

import React, { useMemo, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { SignaturePad, getSignatureDataUrl } from "@/components/ui/signature-pad"

interface SignatureModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  onSave: (dataUrl: string) => void
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  open,
  onOpenChange,
  title = "Add Signature",
  onSave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isEmpty, setIsEmpty] = useState(true)

  // Bridge to get canvas element from SignaturePad
  const setCanvasRef = (el: HTMLDivElement | null) => {
    if (!el) return
    const c = el.querySelector("canvas") as HTMLCanvasElement | null
    canvasRef.current = c
  }

  const handleClear = () => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, c.width, c.height)
    setIsEmpty(true)
  }

  const handleSave = () => {
    const data = getSignatureDataUrl(canvasRef.current)
    onSave(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-light">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div ref={setCanvasRef}>
            <SignaturePad width={600} height={240} onChange={(empty) => setIsEmpty(empty)} />
          </div>
          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" onClick={handleClear} className="rounded-full">
              Clear
            </Button>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
                Cancel
              </Button>
              <Button type="button" onClick={handleSave} disabled={isEmpty} className="rounded-full">
                Save Signature
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


