"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/store"
import { fetchProductionPlans } from "@/lib/store/slices/productionPlanSlice"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Eye, ClipboardList, Calendar, User, Settings, Trash2 } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { ProductionPlanFormDrawer } from "@/components/forms/production-plan-form-drawer"
import { ProductionPlanViewDrawer } from "@/components/forms/production-plan-view-drawer"
import { LoadingButton } from "@/components/ui/loading-button"
import type { ProductionPlan } from "@/lib/types"

export default function ProductionPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { productionPlans, operationLoading } = useSelector((state: RootState) => state.productionPlan)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<ProductionPlan | null>(null)
  const [viewingPlan, setViewingPlan] = useState<ProductionPlan | null>(null)

  useEffect(() => {
    dispatch(fetchProductionPlans())
  }, [dispatch])

  const handleAddPlan = () => {
    setEditingPlan(null)
    setIsDrawerOpen(true)
  }

  const handleEditPlan = (plan: ProductionPlan) => {
    setEditingPlan(plan)
    setIsDrawerOpen(true)
  }

  const handleViewPlan = (plan: ProductionPlan) => {
    setViewingPlan(plan)
    setIsViewDrawerOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned":
        return "bg-blue-100 text-blue-800"
      case "ongoing":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const columns = [
    {
      accessorKey: "name",
      header: "Plan Name",
      cell: ({ row }: any) => {
        const plan = row.original as ProductionPlan
        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <ClipboardList className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{plan.name}</p>
              <p className="text-muted-foreground text-xs">ID: {plan.id.slice(0, 8)}...</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "supervisor",
      header: "Supervisor",
      cell: ({ row }: any) => {
        const plan = row.original as ProductionPlan
        return (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              {plan.production_plan_supervisor_fkey ? 
                `${plan.production_plan_supervisor_fkey.first_name} ${plan.production_plan_supervisor_fkey.last_name}` :
                'N/A'
              }
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "start_date",
      header: "Start Date",
      cell: ({ row }: any) => {
        const plan = row.original as ProductionPlan
        return (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            {new Date(plan.start_date).toLocaleDateString()}
          </div>
        )
      },
    },
    {
      accessorKey: "end_date",
      header: "End Date",
      cell: ({ row }: any) => {
        const plan = row.original as ProductionPlan
        return (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            {new Date(plan.end_date).toLocaleDateString()}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const plan = row.original as ProductionPlan
        return (
          <Badge className={getStatusColor(plan.status)}>
            {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
          </Badge>
        )
      },
    },
    {
      accessorKey: "raw_products",
      header: "Materials",
      cell: ({ row }: any) => {
        const plan = row.original as ProductionPlan
        return (
          <span className="text-sm">{plan.raw_products.length} materials</span>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const plan = row.original as ProductionPlan
        return (
          <div className="flex space-x-2">
            <LoadingButton 
              variant="outline" 
              size="sm" 
              onClick={() => handleViewPlan(plan)}
            >
              <Eye className="w-4 h-4" />
            </LoadingButton>
            <LoadingButton 
              variant="outline" 
              size="sm" 
              onClick={() => handleEditPlan(plan)}
            >
              <Settings className="w-4 h-4" />
            </LoadingButton>
          </div>
        )
      },
    },
  ]

  const isLoading = operationLoading.fetch

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Production Plans</h1>
            <p className="text-muted-foreground">Manage and monitor production planning</p>
          </div>
          <LoadingButton onClick={handleAddPlan} loading={isLoading}>
            <Plus className="mr-2 h-4 w-4" />
            Create Plan
          </LoadingButton>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Production Plans</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-muted-foreground">Loading production plans...</p>
                </div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={productionPlans || []}
                searchKey="name"
                searchPlaceholder="Search production plans by name..."
              />
            )}
          </CardContent>
        </Card>

        <ProductionPlanFormDrawer 
          open={isDrawerOpen} 
          onOpenChange={setIsDrawerOpen} 
          productionPlan={editingPlan} 
          mode={editingPlan ? "edit" : "create"}
          onSuccess={() => {
            setIsDrawerOpen(false)
            setEditingPlan(null)
          }}
        />
        <ProductionPlanViewDrawer
          open={isViewDrawerOpen}
          onOpenChange={setIsViewDrawerOpen}
          productionPlan={viewingPlan}
          onEdit={(plan) => {
            setEditingPlan(plan)
            setIsDrawerOpen(true)
            setIsViewDrawerOpen(false)
          }}
        />
      </div>
    </MainLayout>
  )
}