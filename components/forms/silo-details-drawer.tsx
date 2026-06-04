"use client"

import React, { useEffect, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { fetchCIPStatus, fetchSiloBMTs, updateSilo, deleteSiloByName } from "@/lib/store/slices/siloSlice"
import { Droplets, Thermometer, FlaskConical, ShieldCheck, Timer, ArrowRightLeft, Edit, Package, X, History, ExternalLink, Trash2, FlaskRound } from "lucide-react"
import { SiloBMTSheet } from "@/components/forms/silo-bmt-sheet"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { CIPControlFormDrawer } from "@/components/forms/cip-control-form-drawer"
import { getCIPsForSilo } from "@/lib/api/data-capture-forms"
import type { CIPControlForm } from "@/lib/api/data-capture-forms"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

const PRODUCT_OPTIONS = [
  "Raw Milk",
  "Bulk Skimmed Milk",
  "Bulk Standardized Milk",
  "Bulk Standardized Milk 3.4%",
  "Bulk Lactose Free",
]

interface SiloDetailsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  silo: any | null
  onTransfer?: (silo: any) => void
  onEdit?: (silo: any) => void
}

export function SiloDetailsDrawer({
  open,
  onOpenChange,
  silo,
  onTransfer,
  onEdit,
}: SiloDetailsDrawerProps) {
  const dispatch = useAppDispatch()
  const cipStatuses = useAppSelector((state) => state.silo.cipStatuses)
  const siloBMTs = useAppSelector((state) => state.silo.siloBMTs)
  const cipData = silo ? cipStatuses[silo.name] : null
  const bmts: any[] = silo ? (siloBMTs[silo.name] ?? []) : []
  const [editingProduct, setEditingProduct] = useState(false)
  const [productValue, setProductValue] = useState("")
  const [bmtSheetOpen, setBmtSheetOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [cipDrawerOpen, setCipDrawerOpen] = useState(false)
  const [siloCIPs, setSiloCIPs] = useState<CIPControlForm[]>([])
  const [cipLoading, setCipLoading] = useState(false)

  useEffect(() => {
    if (open && silo) {
      dispatch(fetchCIPStatus(silo.name))
      dispatch(fetchSiloBMTs(silo.name))
      setProductValue(silo.product ?? "")
      setEditingProduct(false)
      // Fetch CIPs for this silo
      setCipLoading(true)
      getCIPsForSilo(silo.name)
        .then(setSiloCIPs)
        .catch(() => {})
        .finally(() => setCipLoading(false))
    }
  }, [open, silo, dispatch])

  const handleDelete = async () => {
    if (!silo) return
    setDeleteLoading(true)
    try {
      await dispatch(deleteSiloByName(silo.name)).unwrap()
      toast.success(`${silo.name} deleted`)
      setDeleteDialogOpen(false)
      onOpenChange(false)
    } catch {
      toast.error("Failed to delete silo")
    } finally {
      setDeleteLoading(false)
    }
  }

  const cancelEdit = () => {
    setProductValue(silo?.product ?? "")
    setEditingProduct(false)
  }

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl p-0 overflow-hidden flex flex-col border-l-0 shadow-2xl">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-8 space-y-10">
            <SheetHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-light">{silo?.name || "Silo Details"}</SheetTitle>
            <div className="flex items-center gap-2">
              {silo?.status && (
                <Badge variant={silo.status === 'active' ? 'default' : 'secondary'} className="rounded-full px-3">
                  {silo.status}
                </Badge>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(silo)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#006BC4] text-white rounded-full hover:bg-[#005ba6] transition-colors"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
              )}
              <button
                onClick={() => setCipDrawerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full hover:bg-emerald-100 transition-colors"
              >
                <FlaskRound className="w-3 h-3" />
                Create CIP
              </button>
              <button
                onClick={() => setDeleteDialogOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>
          <SheetDescription className="font-light">
            Comprehensive real-time metrics and CIP status
          </SheetDescription>
        </SheetHeader>

        {!silo ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="space-y-8 pb-10">
            {/* Volume Metric */}
            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-blue-500 font-medium text-opacity-70">Current Volume</p>
                <p className="text-3xl font-light text-blue-900">{silo.milk_volume?.toLocaleString()} <span className="text-sm">L</span></p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Droplets className="text-blue-600 w-6 h-6" />
              </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-gray-100 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-orange-500">
                  <Thermometer className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-semibold">Temperature</span>
                </div>
                <p className="text-xl font-light">
                  {silo.temperature != null ? <>{silo.temperature} <span className="text-xs">°C</span></> : <span className="text-sm text-gray-400">N/A</span>}
                </p>
              </div>
              <div className="p-4 bg-white border border-gray-100 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-emerald-500">
                  <FlaskConical className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-semibold">Fat Content</span>
                </div>
                <p className="text-xl font-light">
                  {silo.fat_content != null ? <>{silo.fat_content} <span className="text-xs">%</span></> : <span className="text-sm text-gray-400">N/A</span>}
                </p>
              </div>
            </div>

            <Separator className="my-4 text-gray-100" />

            {/* Current Product */}
            <div className="p-4 bg-white border border-gray-100 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-violet-500">
                  <Package className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-semibold">Current Product</span>
                </div>
                {!editingProduct && (
                  <button
                    onClick={() => setEditingProduct(true)}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {editingProduct ? (
                <div className="flex items-center gap-2">
                  <Select value={productValue} onValueChange={(val) => { setProductValue(val); dispatch(updateSilo({ ...silo, product: val })).unwrap().then(() => toast.success("Product updated")).catch(() => toast.error("Failed to update product")); setEditingProduct(false) }}>
                    <SelectTrigger className="flex-1 rounded-lg text-sm">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button onClick={cancelEdit} className="p-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <p className="text-xl font-light capitalize">
                  {productValue || <span className="text-sm text-gray-400">Not set</span>}
                </p>
              )}
            </div>

            {/* CIP Status Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  CIP Clean Status
                </h4>
                {cipData ? (
                   <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-normal">
                    Latest Passed
                   </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-400 font-normal italic">
                    Fetching...
                  </Badge>
                )}
              </div>

              {cipData && (
                <div className="p-4 bg-emerald-50 bg-opacity-50 border border-emerald-100 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Timer className="w-3 h-3" /> Last Cleaned
                    </span>
                    <span className="text-xs font-medium text-emerald-800">{new Date(cipData.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Transfers */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-600" />
                  Recent Transfers
                </h4>
                {bmts.length > 0 && (
                  <button
                    onClick={() => setBmtSheetOpen(true)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    View All <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
              {bmts.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No transfers found</p>
              ) : (
                <div className="space-y-2">
                  {[...bmts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((bmt, i) => {
                    const isDebit = bmt.source === silo.name
                    const vol = bmt.volume_moved
                    const sign = vol == null ? "" : vol === 0 ? "" : isDebit ? "-" : "+"
                    const color = vol == null || vol === 0 ? "text-gray-500" : isDebit ? "text-red-500" : "text-emerald-600"
                    return (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${vol === 0 || vol == null ? "bg-gray-300" : isDebit ? "bg-red-400" : "bg-emerald-400"}`} />
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-700">{bmt.product}</span>
                            <span className="text-[10px] text-gray-400">
                              {isDebit ? `To: ${bmt.destination}` : `From: ${bmt.source}`}
                            </span>
                            <span className="text-[10px] text-gray-400">{new Date(bmt.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className={`text-sm font-medium ${color}`}>
                          {vol != null ? `${sign}${vol.toLocaleString()} L` : "—"}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* CIP History */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <FlaskRound className="w-4 h-4 text-emerald-600" />
                CIP History
              </h4>
              {cipLoading ? (
                <p className="text-xs text-gray-400 italic">Loading…</p>
              ) : siloCIPs.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No CIP records found</p>
              ) : (
                <div className="space-y-2">
                  {[...siloCIPs]
                    .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime())
                    .slice(0, 5)
                    .map((cip, i) => (
                      <div key={cip.id ?? i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-700">{(cip as any).tag ?? "—"}</span>
                          <span className="text-[10px] text-gray-400">{cip.date ? new Date(cip.date).toLocaleDateString() : "—"}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          cip.status === "Approved" ? "bg-purple-100 text-purple-700" :
                          cip.status === "Completed" ? "bg-green-100 text-green-700" :
                          cip.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {cip.status ?? "Draft"}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <Separator className="my-4 text-gray-100" />

            <div className="pt-4">
                <button
                  onClick={() => onTransfer?.(silo)}
                  className="w-full py-4 bg-[#006BC4] text-white rounded-2xl font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                    <ArrowRightLeft className="w-5 h-5" />
                    Initiate Transfer
                </button>
            </div>
          </div>
        )}
            </div>
          </div>
      </SheetContent>
    </Sheet>

    {silo && (
      <SiloBMTSheet
        open={bmtSheetOpen}
        onOpenChange={setBmtSheetOpen}
        siloName={silo.name}
      />
    )}

    <DeleteConfirmationDialog
      open={deleteDialogOpen}
      onOpenChange={setDeleteDialogOpen}
      title={`Delete ${silo?.name ?? "Silo"}`}
      description={`Are you sure you want to delete ${silo?.name}? This action cannot be undone.`}
      onConfirm={handleDelete}
      loading={deleteLoading}
    />

    {silo && (
      <CIPControlFormDrawer
        open={cipDrawerOpen}
        onOpenChange={(v) => {
          setCipDrawerOpen(v)
          if (!v) {
            // Refresh CIP list after closing
            setCipLoading(true)
            getCIPsForSilo(silo.name)
              .then(setSiloCIPs)
              .catch(() => {})
              .finally(() => setCipLoading(false))
          }
        }}
        form={null}
        mode="create"
        defaultSilo={{ id: silo.id, name: silo.name }}
      />
    )}
  </>
  )
}
