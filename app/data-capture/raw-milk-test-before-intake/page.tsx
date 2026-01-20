"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { Badge } from "@/components/ui/badge"
import { LoadingButton } from "@/components/ui/loading-button"
import {
    Plus,
    Eye,
    Edit,
    Trash2,
    FlaskConical,
    Truck,
    User,
    Calendar,
    AlertCircle
} from "lucide-react"
import { RawMilkTestBeforeIntakeFormDrawer } from "@/components/forms/raw-milk-test-before-intake-form-drawer"
import { RawMilkTestBeforeIntakeFormViewDrawer } from "@/components/forms/raw-milk-test-before-intake-form-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { FormIdCopy } from "@/components/ui/form-id-copy"
import { UserAvatar } from "@/components/ui/user-avatar"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import {
    fetchResultSlips,
    deleteResultSlip,
    fetchUntestedCompartments,
    fetchPendingVouchers
} from "@/lib/store/slices/rawMilkTestBeforeIntakeSlice"
import { fetchUsers } from "@/lib/store/slices/usersSlice"
import { fetchCollectionVouchers } from "@/lib/store/slices/collectionVoucherSlice"
import { toast } from "sonner"
import { RawMilkResultSlipBeforeIntake, TableFilters } from "@/lib/types"

export default function RawMilkTestBeforeIntakePage() {
    const dispatch = useAppDispatch()
    const {
        resultSlips,
        untestedCompartments,
        operationLoading,
        error
    } = useAppSelector((state) => state.rawMilkTestBeforeIntake)
    const { items: users } = useAppSelector((state) => state.users)
    const { collectionVouchers } = useAppSelector((state) => state.collectionVoucher)

    const [tableFilters, setTableFilters] = useState<TableFilters>({})
    const [formDrawerOpen, setFormDrawerOpen] = useState(false)
    const [viewDrawerOpen, setViewDrawerOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedSlip, setSelectedSlip] = useState<RawMilkResultSlipBeforeIntake | null>(null)
    const [formMode, setFormMode] = useState<"create" | "edit">("create")

    const hasFetchedRef = useRef(false)

    useEffect(() => {
        if (!hasFetchedRef.current) {
            hasFetchedRef.current = true
            dispatch(fetchResultSlips())
            dispatch(fetchUntestedCompartments())
            dispatch(fetchPendingVouchers())
            dispatch(fetchUsers({}))
            dispatch(fetchCollectionVouchers({}))
        }
    }, [dispatch])

    const filteredSlips = useMemo(() => {
        if (!resultSlips) return []

        return resultSlips.filter((slip: RawMilkResultSlipBeforeIntake) => {
            // 1. Search filter (Global search)
            if (tableFilters.search) {
                const searchLower = tableFilters.search.toLowerCase()
                const tag = (slip.tag || "").toLowerCase()
                const truckNumber = (collectionVouchers.find(v => v.id === slip.voucher_id)?.truck_number || "").toLowerCase()
                if (!tag.includes(searchLower) && !truckNumber.includes(searchLower)) return false
            }

            // 2. Tag filter (Specific field)
            if (tableFilters.tag) {
                const tagLower = tableFilters.tag.toLowerCase()
                const tag = (slip.tag || "").toLowerCase()
                if (!tag.includes(tagLower)) return false
            }

            // 3. Date filter (Specific field)
            if (tableFilters.date) {
                const filterDate = new Date(tableFilters.date)
                const slipDate = new Date(slip.date)
                if (filterDate.toDateString() !== slipDate.toDateString()) return false
            }

            // 4. Date Range filter
            if (tableFilters.dateRange) {
                const slipDate = new Date(slip.date)
                if (tableFilters.dateRange.from) {
                    const from = new Date(tableFilters.dateRange.from)
                    from.setHours(0, 0, 0, 0)
                    if (slipDate < from) return false
                }
                if (tableFilters.dateRange.to) {
                    const to = new Date(tableFilters.dateRange.to)
                    to.setHours(23, 59, 59, 999)
                    if (slipDate > to) return false
                }
            }

            return true
        })
    }, [resultSlips, tableFilters, collectionVouchers])

    const handleAddSlip = () => {
        setSelectedSlip(null)
        setFormMode("create")
        setFormDrawerOpen(true)
    }

    const handleEditSlip = (slip: RawMilkResultSlipBeforeIntake) => {
        setSelectedSlip(slip)
        setFormMode("edit")
        setFormDrawerOpen(true)
    }

    const handleViewSlip = (slip: RawMilkResultSlipBeforeIntake) => {
        setSelectedSlip(slip)
        setViewDrawerOpen(true)
    }

    const handleDeleteSlip = (slip: RawMilkResultSlipBeforeIntake) => {
        setSelectedSlip(slip)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (!selectedSlip) return
        try {
            await dispatch(deleteResultSlip(selectedSlip.id)).unwrap()
            toast.success("Result slip deleted successfully")
            setDeleteDialogOpen(false)
        } catch (error: any) {
            toast.error(error || "Failed to delete result slip")
        }
    }

    const columns = [
        {
            accessorKey: "tag",
            header: "Reference / Tag",
            cell: ({ row }: any) => (
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <FlaskConical className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <FormIdCopy displayId={row.original.tag} actualId={row.original.id} size="sm" />
                        <div className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">{new Date(row.original.date).toLocaleDateString()}</div>
                    </div>
                </div>
            )
        },
        {
            accessorKey: "compartment",
            header: "Compartment",
            cell: ({ row }: any) => (
                <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="rounded-md font-light">
                        Comp #{row.original.truck_compartment_number}
                    </Badge>
                </div>
            )
        },
        {
            accessorKey: "voucher",
            header: "Collection Voucher",
            cell: ({ row }: any) => {
                const voucher = collectionVouchers.find(v => v.id === row.original.voucher_id)
                return (
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-xs font-light text-gray-600">
                            <Truck className="w-3 h-3" />
                            <span>{voucher?.truck_number || "Unknown Truck"}</span>
                        </div>
                        <FormIdCopy displayId={voucher?.tag || "N/A"} actualId={row.original.voucher_id} size="sm" />
                    </div>
                )
            }
        },
        {
            accessorKey: "analyst",
            header: "Analyst",
            cell: ({ row }: any) => {
                const analyst = users.find(u => u.id === row.original.analyst)
                return analyst ? (
                    <UserAvatar user={analyst} size="sm" showName showEmail={false} />
                ) : <span className="text-xs text-gray-400">Unknown</span>
            }
        },
        {
            accessorKey: "result",
            header: "Result",
            cell: ({ row }: any) => (
                <Badge className={row.original.lab_test?.pass ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"}>
                    {row.original.lab_test ? (row.original.lab_test.pass ? "PASS" : "FAIL") : "PENDING"}
                </Badge>
            )
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }: any) => (
                <div className="flex space-x-2">
                    <LoadingButton size="sm" onClick={() => handleViewSlip(row.original)} className="bg-[#006BC4] text-white rounded-full">
                        <Eye className="w-4 h-4" />
                    </LoadingButton>
                    <LoadingButton size="sm" onClick={() => handleEditSlip(row.original)} className="bg-[#A0CF06] text-[#211D1E] rounded-full">
                        <Edit className="w-4 h-4" />
                    </LoadingButton>
                    <LoadingButton size="sm" variant="destructive" onClick={() => handleDeleteSlip(row.original)} className="rounded-full">
                        <Trash2 className="w-4 h-4" />
                    </LoadingButton>
                </div>
            )
        }
    ]

    const filterFields = useMemo(() => [
        { key: "date", label: "Date", type: "date" as const, placeholder: "Filter by date" },
        { key: "tag", label: "Tag", type: "text" as const, placeholder: "Search by tag" }
    ], [])

    return (
        <DataCaptureDashboardLayout title="Raw Milk Test Before Intake" subtitle="Laboratory testing for tankers arriving on site">
            <div className="space-y-6">

                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-light text-foreground">Test Before Intake</h1>
                        <p className="text-sm font-light text-muted-foreground italic">Scientist validation of truck compartments</p>
                    </div>
                    <LoadingButton onClick={handleAddSlip} className="bg-[#006BC4] px-6 py-2 rounded-full">
                        <Plus className="mr-2 h-4 w-4" />
                        New Test Result
                    </LoadingButton>
                </div>

                {/* Untested Compartments Alert / Card */}
                {untestedCompartments.length > 0 && (
                    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-orange-400 mr-3" />
                            <h3 className="text-sm font-medium text-orange-800">Pending Compartment Tests</h3>
                        </div>
                        <div className="mt-2 text-xs text-orange-700">
                            You have {untestedCompartments.length} compartment(s) awaiting intake testing across {new Set(untestedCompartments.map(c => c.truck_number)).size} truck(s).
                        </div>
                    </div>
                )}

                {/* Main Data Table */}
                <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                    <div className="p-6 border-b bg-gray-50/50">
                        <h3 className="text-lg font-light">Recent Test Results</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <DataTableFilters
                            filters={tableFilters}
                            onFiltersChange={setTableFilters}
                            onSearch={(s) => setTableFilters(p => ({ ...p, search: s }))}
                            searchPlaceholder="Search result slips..."
                            filterFields={filterFields}
                        />
                        {operationLoading.fetch ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-12 w-full bg-gray-100 animate-pulse rounded-md" />
                                ))}
                            </div>
                        ) : error ? (
                            <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg border border-red-100">
                                <p>{error}</p>
                            </div>
                        ) : (
                            <DataTable
                                columns={columns}
                                showSearch={false}
                                data={filteredSlips}
                            />
                        )}
                    </div>
                </div>

                {/* Form Drawer */}
                <RawMilkTestBeforeIntakeFormDrawer
                    open={formDrawerOpen}
                    onOpenChange={setFormDrawerOpen}
                    form={selectedSlip}
                    mode={formMode}
                />

                {/* View Drawer */}
                <RawMilkTestBeforeIntakeFormViewDrawer
                    open={viewDrawerOpen}
                    onOpenChange={setViewDrawerOpen}
                    form={selectedSlip}
                    onEdit={() => {
                        setViewDrawerOpen(false)
                        handleEditSlip(selectedSlip!)
                    }}
                />

                {/* Delete Dialog */}
                <DeleteConfirmationDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    title="Delete Test Result"
                    description="Are you sure you want to delete this test result? This action could invalidate the intake process for this compartment."
                    onConfirm={confirmDelete}
                    loading={operationLoading.delete}
                />

            </div>
        </DataCaptureDashboardLayout>
    )
}
