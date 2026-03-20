"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { fetchSiloManagerSilos, fetchSiloTransfers } from "@/lib/store/slices/siloSlice"
import { SiloGauge } from "@/components/ui/silo-gauge"
import { SiloDetailsDrawer } from "@/components/forms/silo-details-drawer"
import { BMTControlFormDrawer } from "@/components/forms/bmt-control-form-drawer"
import { BMTControlFormViewDrawer } from "@/components/forms/bmt-control-form-view-drawer"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { LoadingButton } from "@/components/ui/loading-button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Droplets, ArrowRightLeft, Clock, History, Package, Plus, Eye, Edit, LayoutGrid, List } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function SiloManagementPage() {
  const dispatch = useAppDispatch()
  const { silos, transfers, operationLoading } = useAppSelector((state) => state.silo)
  
  const [selectedSilo, setSelectedSilo] = useState<any | null>(null)
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false)

  const [selectedTransfer, setSelectedTransfer] = useState<any | null>(null)
  const [transferDrawerOpen, setTransferDrawerOpen] = useState(false)
  const [viewTransferDrawerOpen, setViewTransferDrawerOpen] = useState(false)
  const [transferMode, setTransferMode] = useState<"create" | "edit">("create")

  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      dispatch(fetchSiloManagerSilos())
      dispatch(fetchSiloTransfers())
    }
  }, [dispatch])

  const handleSiloClick = (silo: any) => {
    setSelectedSilo(silo)
    setDetailsDrawerOpen(true)
  }

  const handleAddTransfer = () => {
    setSelectedTransfer(null)
    setTransferMode("create")
    setTransferDrawerOpen(true)
  }

  const handleEditTransfer = (transfer: any) => {
    setSelectedTransfer(transfer)
    setTransferMode("edit")
    setTransferDrawerOpen(true)
  }

  const handleViewTransfer = (transfer: any) => {
    setSelectedTransfer(transfer)
    setViewTransferDrawerOpen(true)
  }

  // Table columns for Silo Transfers (BMT forms)
  const transferColumns = [
    {
      accessorKey: "tag",
      header: "Transfer Tag",
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <ArrowRightLeft className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-medium text-sm text-gray-700">{row.original.tag || row.original.id.slice(0, 8)}</span>
        </div>
      )
    },
    {
      accessorKey: "product",
      header: "Product",
      cell: ({ row }: any) => (
        <Badge variant="outline" className="capitalize font-light text-[10px]">
          {row.original.product}
        </Badge>
      )
    },
    {
      accessorKey: "movement",
      header: "Movement",
      cell: ({ row }: any) => {
        const details = row.original.source_destination_details?.[0]
        if (!details) return "—"
        return (
          <div className="flex items-center space-x-3 text-sm font-light italic text-gray-500">
            <span className="text-gray-900 font-normal">{details.source_silo_details?.silo_name}</span>
            <ArrowRightLeft className="w-3 h-3" />
            <span className="text-gray-900 font-normal">{details.destination_silo_details?.silo_name}</span>
          </div>
        )
      }
    },
    {
      accessorKey: "volume",
      header: "Volume",
      cell: ({ row }: any) => {
        const details = row.original.source_destination_details?.[0]
        const vol = details?.source_silo_details?.volume || details?.destination_silo_details?.volume
        return (
          <span className="text-blue-600 font-medium">
            {vol ? `${vol.toLocaleString()} L` : "—"}
          </span>
        )
      }
    },
    {
      accessorKey: "created_at",
      header: "Time",
      cell: ({ row }: any) => (
        <div className="flex items-center text-xs text-gray-400 font-light">
          <Clock className="w-3 h-3 mr-1" />
          {new Date(row.original.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }: any) => (
          <div className="flex space-x-2">
            <LoadingButton
              size="sm"
              onClick={() => handleViewTransfer(row.original)}
              className="bg-[#006BC4] text-white border-0 rounded-full h-8 w-8 p-0"
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton
              size="sm"
              onClick={() => handleEditTransfer(row.original)}
              className="bg-[#A0CF06] text-[#211D1E] border-0 rounded-full h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </LoadingButton>
          </div>
        )
      }
  ]

  return (
    <DataCaptureDashboardLayout title="Silo Management" subtitle="Monitor and manage milk storage and transfers">
      <div className="space-y-8 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-light text-foreground tracking-tight">Storage Facilities</h1>
            <p className="text-sm font-light text-muted-foreground flex items-center">
              <Package className="w-4 h-4 mr-2 text-blue-500" />
              Real-time monitoring and transfer control
            </p>
          </div>
          <LoadingButton
            onClick={handleAddTransfer}
            className="bg-[#006BC4] text-white px-6 py-2 rounded-full shadow-lg shadow-blue-100"
          >
            <Plus className="mr-2 h-4 w-4" />
            Initiate Transfer
          </LoadingButton>
        </div>

        <Tabs defaultValue="volumes" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-gray-100/50 p-1 rounded-xl border border-gray-100">
                <TabsTrigger value="volumes" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2 flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" />
                    Volume Levels
                </TabsTrigger>
                <TabsTrigger value="transfers" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2 flex items-center gap-2">
                    <List className="w-4 h-4" />
                    Recent Transfers
                </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="volumes" className="mt-0">
            {/* Silo Gauges Grid */}
            <div className="space-y-4">
              {operationLoading.fetch ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
                 </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {silos.map((silo) => (
                    <SiloGauge
                      key={silo.id}
                      name={silo.name}
                      volume={silo.milk_volume}
                      capacity={silo.capacity}
                      status={silo.status}
                      onClick={() => handleSiloClick(silo)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="transfers" className="mt-0">
            {/* Transfers Section */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <DataTable 
                columns={transferColumns} 
                data={transfers} 
                showSearch={true}
                searchPlaceholder="Filter transfers..."
                />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <SiloDetailsDrawer
        open={detailsDrawerOpen}
        onOpenChange={setDetailsDrawerOpen}
        silo={selectedSilo}
        onTransfer={() => {
            setDetailsDrawerOpen(false)
            handleAddTransfer()
        }}
      />

      <BMTControlFormDrawer
        open={transferDrawerOpen}
        onOpenChange={setTransferDrawerOpen}
        form={selectedTransfer}
        mode={transferMode}
      />

      <BMTControlFormViewDrawer
        open={viewTransferDrawerOpen}
        onClose={() => setViewTransferDrawerOpen(false)}
        form={selectedTransfer}
        onEdit={() => {
            setViewTransferDrawerOpen(false)
            handleEditTransfer(selectedTransfer)
        }}
      />
    </DataCaptureDashboardLayout>
  )
}
