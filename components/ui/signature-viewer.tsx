"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { base64ToPngDataUrl } from "@/lib/utils/signature"

interface SignatureViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  value?: string | null
}

export const SignatureViewer: React.FC<SignatureViewerProps> = ({ open, onOpenChange, title = "View Signature", value }) => {
  const src = base64ToPngDataUrl(value || "")
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-base font-light">{title}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center">
          {src ? (
            <img src={src} alt="Signature" className="max-h-[60vh] border border-gray-200 rounded-md bg-white" />
          ) : (
            <div className="h-40 w-full flex items-center justify-center border border-dashed border-gray-300 rounded-md text-sm text-gray-500">
              No signature available
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}


