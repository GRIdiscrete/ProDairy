"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Mail, MapPin, Star } from "lucide-react"

interface SupplierViewDrawerProps {
  open: boolean
  onClose: () => void
  supplier: any
}

export function SupplierViewDrawer({ open, onClose, supplier }: SupplierViewDrawerProps) {
  if (!supplier) return null

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[500px] sm:w-[500px] p-6 overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Supplier Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Supplier Name</label>
                <p className="text-lg font-semibold">{supplier.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge variant={supplier.status === "active" ? "default" : "secondary"}>{supplier.status}</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Rating</label>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{supplier.rating}</span>
                  <span className="text-muted-foreground">/5.0</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
                <p className="text-sm font-semibold">{supplier.contactPerson}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{supplier.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{supplier.email}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-sm">{supplier.address || "Address not provided"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Business Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Products Supplied</label>
                <p className="text-sm">{supplier.productsSupplied || "Raw milk, Feed supplements"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contract Start</label>
                <p className="text-sm">{supplier.contractStart || "2023-01-01"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contract End</label>
                <p className="text-sm">{supplier.contractEnd || "2024-12-31"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
