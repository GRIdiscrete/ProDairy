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
      <DialogContent className="max-w-6xl w-[98vw] h-[90vh] flex flex-col p-2">
        <DialogHeader className="flex-shrink-0 pb-2">
          <DialogTitle className="text-base font-light">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 flex flex-col min-h-0">
          <div ref={setCanvasRef} className="flex-1 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <SignaturePad 
              width={800}
              height={500}
              onChange={(signature) => setIsEmpty(!signature)} 
            />
          </div>
          <div className="flex-shrink-0 flex items-center justify-between pt-3 border-t bg-white mt-2">
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


