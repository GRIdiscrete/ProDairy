"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/store"
import { fetchProductionPlans } from "@/lib/store/slices/productionPlanSlice"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Eye, ClipboardList, Calendar, User, Settings, Trash2, Package } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { ProductionPlanFormDrawer } from "@/components/forms/production-plan-form-drawer"
import { ProductionPlanViewDrawer } from "@/components/forms/production-plan-view-drawer"
import { LoadingButton } from "@/components/ui/loading-button"
import type { ProductionPlan } from "@/lib/types"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { PermissionGuard } from "@/components/auth/permission-guard"
import { PermissionButton } from "@/components/ui/permission-table-actions"
import { PermissionTableActions } from "@/components/ui/permission-table-actions"

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
      header: "Plan",
      cell: ({ row }: any) => {
        const plan = row.original as ProductionPlan
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-light">{plan.name}</span>
                <Badge className={getStatusColor(plan.status)}>
                  {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">ID: {plan.id.slice(0, 8)}...</p>
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
          <div className="space-y-1">
            <p className="text-sm font-light">
              {plan.production_plan_supervisor_fkey ? 
                `${plan.production_plan_supervisor_fkey.first_name} ${plan.production_plan_supervisor_fkey.last_name}` :
                'N/A'
              }
            </p>
            <p className="text-xs text-gray-500">Assigned supervisor</p>
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
          <div className="space-y-1">
            <p className="text-sm font-light">{new Date(plan.start_date).toLocaleDateString()}</p>
            <p className="text-xs text-gray-500">Plan start</p>
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
          <div className="space-y-1">
            <p className="text-sm font-light">{new Date(plan.end_date).toLocaleDateString()}</p>
            <p className="text-xs text-gray-500">Plan end</p>
          </div>
        )
      },
    },
    {
      accessorKey: "raw_products",
      header: "Materials",
      cell: ({ row }: any) => {
        const plan = row.original as ProductionPlan
        return (
          <div className="space-y-1">
            <p className="text-sm font-light">{plan.raw_products.length} materials</p>
            <p className="text-xs text-gray-500">Raw materials</p>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const plan = row.original as ProductionPlan
        return (
          <PermissionTableActions
            feature="production_plan"
            onView={() => handleViewPlan(plan)}
            onEdit={() => handleEditPlan(plan)}
            showDropdown={true}
          />
        )
      },
    },
  ]

  const isLoading = operationLoading.fetch

  return (
    <PermissionGuard requiredView="production_plan_tab">
      <AdminDashboardLayout title="Production Plans" subtitle="Manage and monitor production planning">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light text-foreground">Production Plans</h1>
            <p className="text-sm font-light text-muted-foreground">Manage and monitor production planning</p>
          </div>
          <PermissionButton
            feature="production_plan"
            permission="create"
            onClick={handleAddPlan}
            className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white border-0 rounded-full px-6 py-2 font-light"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Plan
          </PermissionButton>
        </div>

        {/* Counter Widgets with Icons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-row items-center justify-between mb-4">
              <h3 className="text-sm text-gray-600">Total Plans</h3>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <ClipboardList className="h-4 w-4 text-gray-500" />
              </div>
            </div>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            ) : (
              <>
                <div className="text-3xl text-gray-900">{productionPlans?.length || 0}</div>
                <p className="text-xs text-gray-500 mt-1">Active in system</p>
              </>
            )}
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-row items-center justify-between mb-4">
              <h3 className="text-sm text-gray-600">Ongoing</h3>
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            ) : (
              <>
                <div className="text-3xl text-green-600">
                  {productionPlans?.filter(p => p.status === "ongoing").length || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">Currently active</p>
              </>
            )}
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-row items-center justify-between mb-4">
              <h3 className="text-sm text-gray-600">Completed</h3>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <ClipboardList className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            ) : (
              <>
                <div className="text-3xl text-blue-600">
                  {productionPlans?.filter(p => p.status === "completed").length || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">Finished plans</p>
              </>
            )}
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-row items-center justify-between mb-4">
              <h3 className="text-sm text-gray-600">Total Materials</h3>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            ) : (
              <>
                <div className="text-3xl text-blue-600">
                  {productionPlans?.reduce((total, p) => total + p.raw_products.length, 0) || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">Material requests</p>
              </>
            )}
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg bg-white">
          <div className="p-6 pb-0">
            <div className="text-lg font-light">Production Plans</div>
          </div>
          <div className="p-6 space-y-4">
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
                showSearch={false}
              />
            )}
          </div>
        </div>

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
    </AdminDashboardLayout>
    </PermissionGuard>
  )
}