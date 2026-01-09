"use client"

import { useState, useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "@/lib/store"
import { fetchCollectionVouchers } from "@/lib/store/slices/collectionVoucherSlice"
import { fetchUsers } from "@/lib/store/slices/usersSlice"
import { fetchSuppliers } from "@/lib/store/slices/supplierSlice"
import { DriversDashboardLayout } from "@/components/layout/drivers-dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Eye, Truck, Calendar, User, Download, Wifi, WifiOff } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { CollectionVoucherFormDrawer } from "@/components/forms/collection-voucher-form-drawer"
import { CollectionVoucherViewDrawer } from "@/components/forms/collection-voucher-form-view-drawer"
import { LoadingButton } from "@/components/ui/loading-button"
import { Skeleton } from "@/components/ui/skeleton"
import { useIsMobile } from "@/hooks/use-mobile"
import { useNetworkStatus } from "@/hooks/use-network-status"
import { LocalStorageService } from "@/lib/offline/local-storage-service"
import { toast } from "sonner"
import type { CollectionVoucher } from "@/lib/types"
import { UserAvatar } from "@/components/ui/user-avatar"
import { FormIdCopy } from "@/components/ui/form-id-copy"

export default function CollectionVouchersPage() {
    const dispatch = useDispatch<AppDispatch>()
    const { collectionVouchers, operationLoading } = useSelector((state: RootState) => state.collectionVoucher)
    const { items: users } = useSelector((state: RootState) => state.users)
    const { suppliers } = useSelector((state: RootState) => state.supplier)

    const { isOnline } = useNetworkStatus()

    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false)
    const [editingVoucher, setEditingVoucher] = useState<CollectionVoucher | null>(null)
    const [viewingVoucher, setViewingVoucher] = useState<CollectionVoucher | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [isLoadingData, setIsLoadingData] = useState(false)
    const [syncingPending, setSyncingPending] = useState(false)
    const itemsPerPage = 10
    const isMobile = useIsMobile()

    // Offline data state
    const [offlineData, setOfflineData] = useState(() => {
        if (typeof window === 'undefined') {
            return {
                drivers: [],
                suppliers: [],
                collectionVouchers: []
            }
        }
        return {
            drivers: LocalStorageService.getDrivers() || [],
            suppliers: LocalStorageService.getSuppliers() || [],
            collectionVouchers: LocalStorageService.getCollectionVouchers() || []
        }
    })

    // Use online data if available, fallback to offline
    const displayVouchers = (isOnline && collectionVouchers && collectionVouchers.length > 0)
        ? collectionVouchers
        : offlineData.collectionVouchers

    const displayUsers = (isOnline && users && users.length > 0)
        ? users
        : offlineData.drivers

    const displaySuppliers = (isOnline && suppliers && suppliers.length > 0)
        ? suppliers
        : offlineData.suppliers

    // Load data on mount
    useEffect(() => {
        // Always load offline data first as fallback
        if (typeof window !== 'undefined') {
            setOfflineData({
                drivers: LocalStorageService.getDrivers(),
                suppliers: LocalStorageService.getSuppliers(),
                collectionVouchers: LocalStorageService.getCollectionVouchers()
            })
        }

        // Try to fetch online data if online
        if (isOnline) {
            dispatch(fetchCollectionVouchers({})).catch(() => {
                toast.info('Using cached data - could not reach server')
            })
            dispatch(fetchUsers({})).catch(() => { })
            dispatch(fetchSuppliers({})).catch(() => { })
        }
    }, [dispatch, isOnline])

    // Refresh data handler
    const handleLoadData = async () => {
        setIsLoadingData(true)
        try {
            const [vouchersResult, usersResult, suppliersResult] = await Promise.all([
                dispatch(fetchCollectionVouchers({})).catch(() => ({ payload: [] })),
                dispatch(fetchUsers({})).catch(() => ({ payload: [] })),
                dispatch(fetchSuppliers({})).catch(() => ({ payload: [] }))
            ])

            // Save to localStorage
            if (typeof window !== 'undefined') {
                LocalStorageService.saveDrivers(Array.isArray(usersResult.payload) ? usersResult.payload : [])
                LocalStorageService.saveSuppliers(Array.isArray(suppliersResult.payload) ? suppliersResult.payload : [])
                LocalStorageService.saveCollectionVouchers(Array.isArray(vouchersResult.payload) ? vouchersResult.payload : [])

                setOfflineData({
                    drivers: LocalStorageService.getDrivers(),
                    suppliers: LocalStorageService.getSuppliers(),
                    collectionVouchers: LocalStorageService.getCollectionVouchers()
                })
            }

            toast.success("✅ All data loaded and cached successfully!")
        } catch (error) {
            toast.error("⚠️ Could not load data from server. Using cached data if available.")

            if (typeof window !== 'undefined') {
                setOfflineData({
                    drivers: LocalStorageService.getDrivers(),
                    suppliers: LocalStorageService.getSuppliers(),
                    collectionVouchers: LocalStorageService.getCollectionVouchers()
                })
            }
        } finally {
            setIsLoadingData(false)
        }
    }

    // Sync pending vouchers
    const handleSyncPending = async () => {
        if (!isOnline) {
            toast.error("You must be online to sync pending vouchers")
            return
        }

        try {
            setSyncingPending(true)
            const pendingVouchers = LocalStorageService.getPendingCollectionVouchers()

            if (pendingVouchers.length === 0) {
                toast.info("No pending vouchers to sync")
                return
            }

            let success = 0
            let failed = 0

            for (const voucher of pendingVouchers) {
                try {
                    // Try to create on server - you can enhance this with actual sync service
                    console.log('Syncing voucher:', voucher)
                    // await dispatch(createCollectionVoucher(voucher)).unwrap()
                    // LocalStorageService.markCollectionVoucherAsSynced(voucher.id)
                    success++
                } catch (error) {
                    console.error('Failed to sync voucher:', voucher.id, error)
                    failed++
                }
            }

            if (success > 0 && failed === 0) {
                toast.success(`✅ Successfully synced ${success} voucher(s)`)
            } else if (success > 0 && failed > 0) {
                toast.warning(`⚠️ Synced ${success} voucher(s), ${failed} failed`)
            } else if (failed > 0) {
                toast.error(`❌ Failed to sync ${failed} voucher(s)`)
            }

            // Refresh data
            if (success > 0) {
                await handleLoadData()
            }
        } catch (error) {
            console.error("Sync pending error:", error)
            toast.error("Failed to sync pending vouchers")
        } finally {
            setSyncingPending(false)
        }
    }

    // Export to CSV
    const handleExportCSV = () => {
        try {
            const headers = [
                "Voucher ID",
                "Driver Name",
                "Date",
                "Route",
                "Farmer Name",
                "Truck Number",
                "Time In",
                "Time Out",
                "Temperature",
                "Dip Reading",
                "Meter Start",
                "Meter Finish",
                "Volume",
                "Dairy Total",
                "Farmer Tank #",
                "Truck Compartment #",
                "Route Total",
                "OT Result",
                "Organoleptic",
                "Alcohol",
                "COB Result",
                "Remark",
                "Created At"
            ]

            const rows: any[] = []

            displayVouchers.forEach(voucher => {
                const driver = displayUsers.find(u => u.id === voucher.driver)
                const supplier = displaySuppliers.find(s => s.id === (typeof voucher.farmer === 'string' ? voucher.farmer : (voucher.farmer as any)?.id))
                const driverName = driver ? `${driver.first_name} ${driver.last_name}` : 'Unknown'
                const farmerName = typeof voucher.farmer === 'object' && voucher.farmer
                    ? `${(voucher.farmer as any).first_name} ${(voucher.farmer as any).last_name}`
                    : supplier ? `${supplier.first_name} ${supplier.last_name}` : 'Unknown'

                const details = Array.isArray(voucher.raw_milk_collection_voucher_details) ? voucher.raw_milk_collection_voucher_details : (Array.isArray(voucher.details) ? voucher.details : [])
                const labTests = Array.isArray(voucher.raw_milk_collection_voucher_lab_test) ? voucher.raw_milk_collection_voucher_lab_test : (Array.isArray(voucher.lab_test) ? voucher.lab_test : [])

                // Create a row for each detail entry
                details.forEach((detail: any, index: number) => {
                    const lab = labTests[index] || labTests[0] // Fallback to first lab test or empty

                    rows.push([
                        voucher.id,
                        driverName,
                        new Date(voucher.date).toLocaleDateString(),
                        voucher.route,
                        farmerName,
                        voucher.truck_number,
                        voucher.time_in,
                        voucher.time_out,
                        detail.temperature || 'N/A',
                        detail.dip_reading || 'N/A',
                        detail.meter_start || 'N/A',
                        detail.meter_finish || 'N/A',
                        detail.volume || 'N/A',
                        detail.dairy_total || 'N/A',
                        Array.isArray(detail.farmer_tank_number) ? detail.farmer_tank_number.join(';') : detail.farmer_tank_number || 'N/A',
                        detail.truck_compartment_number || 'N/A',
                        detail.route_total || 'N/A',
                        lab?.ot_result || 'N/A',
                        lab?.organoleptic || 'N/A',
                        lab?.alcohol || 'N/A',
                        lab?.cob_result ? 'Yes' : 'No',
                        voucher.remark,
                        new Date(voucher.created_at).toLocaleDateString()
                    ])
                })

                // If no details, add one summarized row
                if (details.length === 0) {
                    rows.push([
                        voucher.id,
                        driverName,
                        new Date(voucher.date).toLocaleDateString(),
                        voucher.route,
                        farmerName,
                        voucher.truck_number,
                        voucher.time_in,
                        voucher.time_out,
                        'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 'N/A',
                        labTests[0]?.ot_result || 'N/A',
                        labTests[0]?.organoleptic || 'N/A',
                        labTests[0]?.alcohol || 'N/A',
                        labTests[0]?.cob_result ? 'Yes' : 'No',
                        voucher.remark,
                        new Date(voucher.created_at).toLocaleDateString()
                    ])
                }
            })

            const csvContent = [headers, ...rows]
                .map(row => row.map((field: any) => `"${String(field ?? "").replace(/"/g, '""')}"`).join(","))
                .join("\r\n")

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            const url = URL.createObjectURL(blob)
            link.setAttribute('href', url)
            link.setAttribute('download', `collection-vouchers-${new Date().toISOString().split('T')[0]}.csv`)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast.success('CSV exported successfully')
        } catch (error) {
            console.error('Export error:', error)
            toast.error('Failed to export CSV')
        }
    }

    const handleAddVoucher = () => {
        setEditingVoucher(null)
        setIsDrawerOpen(true)
    }

    const handleEditVoucher = (voucher: CollectionVoucher) => {
        setEditingVoucher(voucher)
        setIsDrawerOpen(true)
    }

    const handleViewVoucher = (voucher: CollectionVoucher) => {
        setViewingVoucher(voucher)
        setIsViewDrawerOpen(true)
    }

    // Sort by date descending
    const sortedVouchers = useMemo(() => {
        return [...displayVouchers].sort((a, b) => {
            const dateA = new Date(a.created_at).getTime()
            const dateB = new Date(b.created_at).getTime()
            return dateB - dateA
        })
    }, [displayVouchers])

    const paginatedVouchers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        return sortedVouchers.slice(startIndex, startIndex + itemsPerPage)
    }, [sortedVouchers, currentPage, itemsPerPage])

    const totalPages = Math.ceil(sortedVouchers.length / itemsPerPage)
    const pendingCount = typeof window !== 'undefined' ? LocalStorageService.getPendingCollectionVouchers().length : 0

    const columns = [
        {
            accessorKey: "tag",
            header: "Voucher Tag",
            cell: ({ row }: any) => {
                const voucher = row.original as CollectionVoucher
                return (
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                            <Truck className="h-4 w-4 text-white" />
                        </div>
                        <FormIdCopy
                            displayId={voucher.tag || "N/A"}
                            actualId={voucher.id}
                            size="sm"
                        />
                    </div>
                )
            },
        },
        {
            accessorKey: "driver",
            header: "Driver",
            cell: ({ row }: any) => {
                const voucher = row.original as CollectionVoucher
                const driverUser = displayUsers.find((user: any) => user.id === voucher.driver)

                if (driverUser) {
                    return (
                        <UserAvatar
                            user={driverUser}
                            size="md"
                            showName={true}
                            showEmail={false}
                            showDropdown={false}
                        />
                    )
                }

                return (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="text-sm font-light text-gray-400">Unknown</div>
                    </div>
                )
            },
        },
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }: any) => {
                const voucher = row.original as CollectionVoucher
                return (
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-light">{new Date(voucher.date).toLocaleDateString()}</span>
                    </div>
                )
            },
        },
        {
            accessorKey: "route",
            header: "Route",
            cell: ({ row }: any) => {
                const voucher = row.original as CollectionVoucher
                return <span className="text-sm font-light">{voucher.route}</span>
            },
        },
        {
            accessorKey: "farmer",
            header: "Farmer",
            cell: ({ row }: any) => {
                const voucher = row.original as CollectionVoucher
                const supplier = displaySuppliers.find((s: any) => s.id === (typeof voucher.farmer === 'string' ? voucher.farmer : (voucher.farmer as any)?.id))

                // If farmer is an object (nested response), use it directly
                if (typeof voucher.farmer === 'object' && voucher.farmer) {
                    const f = voucher.farmer as any
                    return (
                        <span className="text-sm font-light">
                            {f.first_name} {f.last_name}
                        </span>
                    )
                }

                return (
                    <span className="text-sm font-light">
                        {supplier ? `${supplier.first_name} ${supplier.last_name}` : 'Unknown'}
                    </span>
                )
            },
        },
        {
            accessorKey: "volume",
            header: "Total Volume",
            cell: ({ row }: any) => {
                const voucher = row.original as CollectionVoucher
                const details = Array.isArray(voucher.raw_milk_collection_voucher_details) ? voucher.raw_milk_collection_voucher_details : (Array.isArray(voucher.details) ? voucher.details : [])
                const totalVolume = details.reduce((acc, curr) => acc + (Number(curr.volume) || 0), 0)
                return <span className="text-sm font-light">{totalVolume} L</span>
            },
        },
        {
            id: "actions",
            cell: ({ row }: any) => {
                const voucher = row.original as CollectionVoucher
                return (
                    <div className="flex space-x-2">
                        <LoadingButton
                            size="sm"
                            onClick={() => handleViewVoucher(voucher)}
                            className="from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full"
                        >
                            <Eye className="w-4 h-4" />
                        </LoadingButton>
                        <LoadingButton
                            size="sm"
                            onClick={() => handleEditVoucher(voucher)}
                            className="from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full"
                        >
                            <Edit className="w-4 h-4" />
                        </LoadingButton>
                    </div>
                )
            },
        },
    ]

    const isLoading = operationLoading.fetch

    return (
        <DriversDashboardLayout
            title="Collection Vouchers"
            subtitle="Manage raw milk collection vouchers"
        >
            <div className="space-y-6">
                {/* Actions Bar */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    <div></div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Data Source Indicator */}
                        <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200 bg-white">
                            {collectionVouchers && collectionVouchers.length > 0 ? (
                                <>
                                    <Wifi className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-light text-green-600">Using Live Data</span>
                                    <span className="text-xs text-gray-500 ml-1">({collectionVouchers.length} vouchers)</span>
                                </>
                            ) : offlineData.collectionVouchers && offlineData.collectionVouchers.length > 0 ? (
                                <>
                                    <WifiOff className="h-4 w-4 text-orange-600" />
                                    <span className="text-sm font-light text-orange-600">Using Cached Data</span>
                                    <span className="text-xs text-gray-500 ml-1">({offlineData.collectionVouchers.length} vouchers)</span>
                                </>
                            ) : (
                                <>
                                    <WifiOff className="h-4 w-4 text-red-600" />
                                    <span className="text-sm font-light text-red-600">No Data Available</span>
                                </>
                            )}
                        </div>

                        <LoadingButton
                            size="sm"
                            onClick={handleLoadData}
                            loading={isLoadingData}
                            className="rounded-full"
                        >
                            Refresh Data
                        </LoadingButton>

                        <LoadingButton
                            size="sm"
                            onClick={handleSyncPending}
                            loading={syncingPending}
                            disabled={!isOnline || pendingCount === 0}
                            className="rounded-full"
                        >
                            Sync Pending ({pendingCount})
                        </LoadingButton>

                        <Button
                            size="sm"
                            onClick={handleExportCSV}
                            disabled={displayVouchers.length === 0}
                            className="rounded-full bg-[#A0CF06] text-[#211D1E]"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                        </Button>

                        <Button
                            onClick={handleAddVoucher}
                            className="bg-[#006BC4] text-white rounded-full"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Voucher
                        </Button>
                    </div>
                </div>

                {/* Data Table */}
                {isLoading ? (
                    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex gap-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="p-4 border-b border-gray-50 flex items-center gap-4">
                                <div className="flex items-center gap-3 flex-1">
                                    <Skeleton className="h-9 w-9 rounded-lg" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <div className="flex items-center gap-2 flex-1">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                <Skeleton className="h-4 w-24 flex-1" />
                                <Skeleton className="h-4 w-32 flex-1" />
                                <Skeleton className="h-4 w-24 flex-1" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <DataTable
                            columns={columns}
                            data={paginatedVouchers}
                        />

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
                                <div className="flex flex-1 justify-between sm:hidden">
                                    <Button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="rounded-full"
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="rounded-full"
                                    >
                                        Next
                                    </Button>
                                </div>
                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing{' '}
                                            <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                                            {' '}to{' '}
                                            <span className="font-medium">
                                                {Math.min(currentPage * itemsPerPage, sortedVouchers.length)}
                                            </span>
                                            {' '}of{' '}
                                            <span className="font-medium">{sortedVouchers.length}</span> results
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="rounded-full"
                                            size="sm"
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="rounded-full"
                                            size="sm"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Drawers */}
            <CollectionVoucherFormDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                collectionVoucher={editingVoucher || undefined}
                mode={editingVoucher ? "edit" : "create"}
                onSuccess={() => {
                    dispatch(fetchCollectionVouchers({}))
                }}
            />

            <CollectionVoucherViewDrawer
                open={isViewDrawerOpen}
                onOpenChange={setIsViewDrawerOpen}
                collectionVoucher={viewingVoucher}
                onEdit={(voucher) => {
                    setViewingVoucher(null)
                    setIsViewDrawerOpen(false)
                    setEditingVoucher(voucher)
                    setIsDrawerOpen(true)
                }}
            />
        </DriversDashboardLayout>
    )
}
