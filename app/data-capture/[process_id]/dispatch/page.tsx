"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { LoadingButton } from "@/components/ui/loading-button"
import { Plus, Eye, Edit, Trash2, Package } from "lucide-react"
import { QaReleaseNoteDrawer } from "@/components/forms/qa-release-note-drawer"
import { QaReleaseNoteViewDrawer } from "@/components/forms/qa-release-note-view-drawer"
import { QaRejectNoteDrawer } from "@/components/forms/qa-reject-note-drawer"
import { QaRejectNoteViewDrawer } from "@/components/forms/qa-reject-note-view-drawer"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import { DataTable } from "@/components/ui/data-table"
import { DataTableFilters } from "@/components/ui/data-table-filters"
import { useAppDispatch, useAppSelector, RootState } from "@/lib/store"
import { fetchQaReleaseNotes, deleteQaReleaseNoteAction, clearError as clearReleaseError } from "@/lib/store/slices/qaReleaseNoteSlice"
import { fetchQaRejectNotes, deleteQaRejectNoteAction, clearError as clearRejectError } from "@/lib/store/slices/qaRejectNoteSlice"
import { fetchUsers } from "@/lib/store/slices/usersSlice"
import { toast } from "sonner"
import ContentSkeleton from "@/components/ui/content-skeleton"
import { FormIdCopy } from "@/components/ui/form-id-copy"
import { rolesApi } from "@/lib/api/roles"
import { useRouter, useSearchParams } from "next/navigation"

interface Props { params: { process_id: string } }

export default function DispatchPage({ params }: Props) {
    const dispatch = useAppDispatch()
    const router = useRouter()

    const { items: releaseNotes, loading: releaseLoading, operationLoading: releaseOp, error: releaseError, isInitialized: releaseInit } = useAppSelector((s: any) => s.qaReleaseNotes)
    const { items: rejectNotes, loading: rejectLoading, operationLoading: rejectOp, error: rejectError, isInitialized: rejectInit } = useAppSelector((s: any) => s.qaRejectNotes)

    const { items: users } = useAppSelector((s: RootState) => s.users)
    const [tableFilters, setTableFilters] = useState<any>({})
    const hasFetchedRef = useRef(false)
    const [activeTab, setActiveTab] = useState<"release" | "reject">("release")

    useEffect(() => {
        if (!releaseInit && !rejectInit && !hasFetchedRef.current) {
            hasFetchedRef.current = true
            dispatch(fetchQaReleaseNotes())
            dispatch(fetchQaRejectNotes())
            dispatch(fetchUsers({}))
        }
    }, [dispatch, releaseInit, rejectInit])

    // roles map for display (robust: pick common name properties)
    const [rolesMap, setRolesMap] = useState<Record<string, string>>({})
    const [rolesList, setRolesList] = useState<any[]>([])
    useEffect(() => {
        let mounted = true
            ; (async () => {
                try {
                    const res = await rolesApi.getRoles()
                    if (!mounted) return
                    const list = res.data || []
                    const m: Record<string, string> = {}
                    list.forEach((r: any) => {
                        // prefer common name-like fields
                        const name = r.role_name || r.name || r.display_name || r.title || r.label || ""
                        m[r.id] = name || r.id
                    })
                    setRolesList(list)
                    setRolesMap(m)
                } catch {
                    // ignore
                }
            })()
        return () => { mounted = false }
    }, [])

    // helper: resolve role name with fallbacks
    const getRoleName = (id?: string | null) => {
        if (!id) return "N/A"
        if (rolesMap[id]) return rolesMap[id]
        const r = rolesList.find((x: any) => x.id === id)
        if (r) return r.role_name || r.name || r.display_name || id
        // fallback: truncate id for readability
        return typeof id === "string" && id.length > 8 ? `${id.slice(0, 8)}...` : id
    }

    // Filter fields configuration
    const filterFields = useMemo(() => [
        {
            key: "created_at",
            label: "Date",
            type: "date" as const,
            placeholder: "Filter by date"
        },
        {
            key: "approved_by",
            label: "Approver",
            type: "text" as const,
            placeholder: "Filter by approver"
        },
        {
            key: "status",
            label: "Status",
            type: "text" as const,
            placeholder: "Filter by status"
        }
    ], [])

    // Frontend Filtering Logic
    const filteredNotes = useMemo(() => {
        const notes = activeTab === "release" ? (Array.isArray(releaseNotes) ? releaseNotes : []) : (Array.isArray(rejectNotes) ? rejectNotes : [])

        return notes.filter((n: any) => {
            // 1. Search filter (Global search)
            if (tableFilters.search) {
                const searchLower = tableFilters.search.toLowerCase()
                const tag = String(n.tag || "").toLowerCase()
                const approver = getRoleName(n.approved_by).toLowerCase()
                const details = activeTab === "release"
                    ? String(n.qa_release_note_details?.[0]?.status || "").toLowerCase()
                    : String(n.qa_reject_note_details?.[0]?.status || "").toLowerCase()

                if (!tag.includes(searchLower) && !approver.includes(searchLower) && !details.includes(searchLower)) return false
            }

            // 2. Specific filter fields
            if (tableFilters.created_at) {
                const filterDate = new Date(tableFilters.created_at)
                const noteDate = new Date(n.created_at)
                if (filterDate.toDateString() !== noteDate.toDateString()) return false
            }

            if (tableFilters.approved_by) {
                const approverLower = tableFilters.approved_by.toLowerCase()
                if (!getRoleName(n.approved_by).toLowerCase().includes(approverLower)) return false
            }

            if (tableFilters.status) {
                const statusLower = tableFilters.status.toLowerCase()
                const status = activeTab === "release"
                    ? (n.qa_release_note_details?.[0]?.status || "").toLowerCase()
                    : (n.qa_reject_note_details?.[0]?.status || "").toLowerCase()
                if (!status.includes(statusLower)) return false
            }

            // 3. Date Range filter
            if (tableFilters.dateRange) {
                const noteDate = new Date(n.created_at)
                if (tableFilters.dateRange.from) {
                    const from = new Date(tableFilters.dateRange.from)
                    from.setHours(0, 0, 0, 0)
                    if (noteDate < from) return false
                }
                if (tableFilters.dateRange.to) {
                    const to = new Date(tableFilters.dateRange.to)
                    to.setHours(23, 59, 59, 999)
                    if (noteDate > to) return false
                }
            }

            return true
        })
    }, [activeTab, releaseNotes, rejectNotes, tableFilters, rolesMap, rolesList])

    useEffect(() => {
        if (releaseError) { toast.error(String(releaseError)); dispatch(clearReleaseError()) }
        if (rejectError) { toast.error(String(rejectError)); dispatch(clearRejectError()) }
    }, [releaseError, rejectError, dispatch])

    const [formOpen, setFormOpen] = useState(false)
    const [viewOpen, setViewOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [selected, setSelected] = useState<any | null>(null)
    const [mode, setMode] = useState<"create" | "edit">("create")

    const handleAdd = () => { setSelected(null); setMode("create"); setFormOpen(true) }
    const handleEdit = (n: any) => { setSelected(n); setMode("edit"); setFormOpen(true) }
    const handleView = (n: any) => { setSelected(n); setViewOpen(true) }
    const handleDelete = (n: any) => { setSelected(n); setDeleteOpen(true) }

    const confirmDelete = async () => {
        if (!selected) return
        try {
            if (activeTab === "release") {
                await dispatch(deleteQaReleaseNoteAction(selected.id)).unwrap()
            } else {
                await dispatch(deleteQaRejectNoteAction(selected.id)).unwrap()
            }
            toast.success("Deleted")
            setDeleteOpen(false)
        } catch (err: any) {
            toast.error(err?.message || String(err) || "Failed to delete")
        }
    }

    // helper: show product name or shorten GUID-like product id
    const formatProductDisplay = (product?: string | null) => {
        if (!product) return "N/A"
        // if looks like a GUID or long id, shorten
        if (/^[0-9a-fA-F-]{20,}$/.test(product) || product.length > 16) return product.slice(0, 8) + "..."
        return product
    }

    // decide effective dataset & loading based on active tab
    const effectiveNotes = activeTab === "release" ? (Array.isArray(releaseNotes) ? releaseNotes : []) : (Array.isArray(rejectNotes) ? rejectNotes : [])
    const loading = activeTab === "release" ? releaseLoading : rejectLoading
    const operationLoading = activeTab === "release" ? releaseOp : rejectOp
    const latest = effectiveNotes.length > 0 ? effectiveNotes[0] : null

    // columns for release vs reject (show richer info)
    const releaseColumns = useMemo(() => [
        {
            accessorKey: "info",
            header: "Release Note",
            cell: ({ row }: any) => {
                const n = row.original
                const d = (n.qa_release_note_details && n.qa_release_note_details[0]) || {}
                return (
                    <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">Tag</span>
                                <FormIdCopy displayId={n.tag!} actualId={n.id} size="sm" />
                            </div>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "details",
            header: "Details",
            cell: ({ row }: any) => {
                const n = row.original
                const d = (n.qa_release_note_details && n.qa_release_note_details[0]) || {}
                return (
                    <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-3">
                            <div className="text-xs text-gray-500">Status</div>
                            <div className="font-light">{d.status || "N/A"}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
                            <div>Batch: <span className="font-light text-sm">{d.batch_no || "N/A"}</span></div>
                            <div>Pack (ml): <span className="font-light text-sm">{d.pack_size_ml ?? "N/A"}</span></div>
                            <div>Pallets on Hold: <span className="font-light text-sm">{d.pallets_on_hold ?? 0}</span></div>
                            <div>Hold Times: <span className="font-light text-sm">{d.hold_times ?? 0}</span></div>
                            <div>MNF: <span className="font-light text-sm">{d.mnf_date || "N/A"}</span></div>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "approver",
            header: "Approver (Role)",
            cell: ({ row }: any) => {
                const n = row.original
                return <div className="text-sm font-light">{getRoleName(n.approved_by)}</div>
            }
        },
        {
            accessorKey: "created",
            header: "Created",
            cell: ({ row }: any) => <div className="text-sm font-light">{row.original.created_at ? new Date(row.original.created_at).toLocaleString() : "N/A"}</div>
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }: any) => {
                const n = row.original
                return (
                    <div className="flex space-x-2">
                        <LoadingButton size="sm" onClick={() => handleView(n)} className="bg-[#006BC4] text-white rounded-full"><Eye className="w-4 h-4" /></LoadingButton>
                        <LoadingButton size="sm" onClick={() => handleEdit(n)} className="bg-[#A0CF06] text-[#211D1E] rounded-full"><Edit className="w-4 h-4" /></LoadingButton>
                        <LoadingButton className="rounded-full" variant="destructive" size="sm" onClick={() => handleDelete(n)} loading={operationLoading?.delete}><Trash2 className="w-4 h-4" /></LoadingButton>
                    </div>
                )
            }
        }
    ], [operationLoading, rolesMap, rolesList])

    const rejectColumns = useMemo(() => [
        {
            accessorKey: "info",
            header: "Reject Note",
            cell: ({ row }: any) => {
                const n = row.original
                return (
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">Tag</span>
                                <FormIdCopy displayId={n.tag!} actualId={n.id} size="sm" />
                            </div>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "details",
            header: "Details",
            cell: ({ row }: any) => {
                const n = row.original
                const d = (n.qa_reject_note_details && n.qa_reject_note_details[0]) || n.details_id || {}
                return (
                    <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-3">
                            <div className="text-xs text-gray-500">Status</div>
                            <div className="font-light">{d.status || "N/A"}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">


                            <div>Batch: <span className="font-light text-sm">{d.batch_no || "N/A"}</span></div>
                            <div>Pack: <span className="font-light text-sm">{d.pack_size ?? "N/A"}</span></div>
                            <div>Pallets Rejected: <span className="font-light text-sm">{d.pallets_rejected ?? 0}</span></div>
                            <div>Reject Date: <span className="font-light text-sm">{d.reject_date || "N/A"}</span></div>
                            {/* <div>Reason: <span className="font-light text-sm">{d.reason || "N/A"}</span></div> */}
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "approver",
            header: "Approver (Role)",
            cell: ({ row }: any) => <div className="text-sm font-light">{getRoleName(row.original.approved_by)}</div>
        },
        {
            accessorKey: "created",
            header: "Created",
            cell: ({ row }: any) => <div className="text-sm font-light">{row.original.created_at ? new Date(row.original.created_at).toLocaleString() : "N/A"}</div>
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }: any) => {
                const n = row.original
                return (
                    <div className="flex space-x-2">
                        <LoadingButton size="sm" onClick={() => handleView(n)} className="bg-[#006BC4] text-white rounded-full"><Eye className="w-4 h-4" /></LoadingButton>
                        <LoadingButton size="sm" onClick={() => handleEdit(n)} className="bg-[#A0CF06] text-[#211D1E] rounded-full"><Edit className="w-4 h-4" /></LoadingButton>
                        <LoadingButton className="rounded-full" variant="destructive" size="sm" onClick={() => handleDelete(n)} loading={operationLoading?.delete}><Trash2 className="w-4 h-4" /></LoadingButton>
                    </div>
                )
            }
        }
    ], [operationLoading, rolesMap, rolesList])

    const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

    // --- Helper: open view drawer if form_id query param is present ---
    useEffect(() => {
        if (typeof window === "undefined") return;
        const formId = searchParams?.get("form_id");
        if (formId) {
            // Search in release notes
            const foundRelease = releaseNotes.find((form: any) => String(form.id) === String(formId));
            if (foundRelease) {
                setSelected(foundRelease);
                setViewOpen(true);
                setActiveTab("release");
                return;
            }
            // Search in reject notes
            const foundReject = rejectNotes.find((form: any) => String(form.id) === String(formId));
            if (foundReject) {
                setSelected(foundReject);
                setViewOpen(true);
                setActiveTab("reject");
                return;
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [releaseNotes, rejectNotes]);

    return (
        <DataCaptureDashboardLayout title="Dispatch / QA Notes" subtitle="Manage QA release & reject notes">
            <div className="space-y-6">

                {/* page header: title + add button (tabs moved below for visibility) */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-light">Dispatch — QA Notes</h1>
                        <p className="text-sm font-light text-muted-foreground">Switch between Release and Reject notes</p>
                    </div>
                    <LoadingButton onClick={handleAdd} className="bg-[#006BC4] text-white rounded-full px-6">
                        <Plus className="mr-2 h-4 w-4" /> Add {activeTab === "release" ? "Release Note" : "Reject Note"}
                    </LoadingButton>
                </div>

                {/* Top tab row (visible, clearly indicates active tab) */}
                <div className="w-full">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setActiveTab("release")}
                            aria-pressed={activeTab === "release"}
                            className={`flex items-center gap-2 pb-2 px-3 text-sm font-medium transition-colors ${activeTab === "release"
                                ? "text-blue-600 border-b-2 border-[#006BC4]"
                                : "text-gray-600 hover:text-gray-800"
                                }`}
                        >
                            <Package className="w-4 h-4" />
                            <span>Release Notes</span>
                        </button>

                        <button
                            onClick={() => setActiveTab("reject")}
                            aria-pressed={activeTab === "reject"}
                            className={`flex items-center gap-2 pb-2 px-3 text-sm font-medium transition-colors ${activeTab === "reject"
                                ? "text-blue-600 border-b-2 border-[#006BC4]"
                                : "text-gray-600 hover:text-gray-800"
                                }`}
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>Reject Notes</span>
                        </button>
                    </div>
                </div>

                {loading ? <ContentSkeleton sections={1} cardsPerSection={4} /> : latest ? (
                    <div className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-[#006BC4]">
                        <div className="p-6 pb-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 text-lg font-light">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Package className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <span>Latest {activeTab === "release" ? "Release" : "Reject"} Note</span>
                                </div>
                                <LoadingButton onClick={() => handleView(latest)} className="bg-[#006BC4] text-white rounded-full px-4 py-2 text-sm">
                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                </LoadingButton>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-xs font-light text-gray-500">Tag</p>
                                    <div className="text-lg font-light text-blue-600"><FormIdCopy displayId={latest.tag!} actualId={latest.id} size="sm" /></div>
                                </div>
                                <div>
                                    <p className="text-xs font-light text-gray-500">Approver</p>
                                    <div className="text-lg font-light">{latest.approved_by ? getRoleName(latest.approved_by) : "N/A"}</div>
                                </div>
                                <div>
                                    <p className="text-xs font-light text-gray-500">Created</p>
                                    <p className="text-lg font-light">{latest.created_at ? new Date(latest.created_at).toLocaleString() : "N/A"}</p>
                                </div>
                                {/* <div>
                                    <p className="text-xs font-light text-gray-500">Detail Summary</p>
                                    <p className="text-lg font-light">
                                        {activeTab === "release"
                                            ? ((latest.qa_release_note_details && latest.qa_release_note_details[0]) ? `${formatProductDisplay(latest.qa_release_note_details[0].product)} • ${latest.qa_release_note_details[0].batch_no}` : "N/A")
                                            : ((latest.qa_reject_note_details && latest.qa_reject_note_details[0]) ? `${formatProductDisplay(latest.qa_reject_note_details[0].product)} • ${latest.qa_reject_note_details[0].batch_no}` : (latest.details_id ? `${formatProductDisplay(latest.details_id.product)} • ${latest.details_id.batch_no}` : "N/A"))
                                        }
                                    </p>
                                </div> */}
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="border border-gray-200 rounded-lg bg-white">
                    <div className="p-6">
                        <div className="text-lg font-light">{activeTab === "release" ? "QA Release Notes" : "QA Reject Notes"}</div>
                    </div>
                    <div className="p-6 space-y-4">
                        <DataTableFilters
                            filters={tableFilters}
                            onFiltersChange={setTableFilters}
                            onSearch={(s) => setTableFilters((p: any) => ({ ...p, search: s }))}
                            searchPlaceholder="Search QA notes..."
                            filterFields={filterFields}
                        />
                        <DataTable columns={activeTab === "release" ? releaseColumns : rejectColumns} data={filteredNotes} showSearch={false} />
                    </div>
                </div>

                {/* Drawers */}
                <QaReleaseNoteDrawer open={formOpen && activeTab === "release"} onOpenChange={(b) => { if (!b) setFormOpen(false); else setFormOpen(b) }} note={selected} mode={mode} processId={params.process_id} />
                <QaReleaseNoteViewDrawer open={viewOpen && activeTab === "release"} onOpenChange={(b) => { if (!b) setViewOpen(false); else setViewOpen(b) }} note={selected} onEdit={() => { setViewOpen(false); handleEdit(selected) }} />

                <QaRejectNoteDrawer open={formOpen && activeTab === "reject"} onOpenChange={(b) => { if (!b) setFormOpen(false); else setFormOpen(b) }} note={selected} mode={mode} processId={params.process_id} />
                <QaRejectNoteViewDrawer open={viewOpen && activeTab === "reject"} onOpenChange={(b) => { if (!b) setViewOpen(false); else setViewOpen(b) }} note={selected} onEdit={() => { setViewOpen(false); handleEdit(selected) }} />

                <DeleteConfirmationDialog open={deleteOpen} onOpenChange={setDeleteOpen} title={`Delete ${activeTab === "release" ? "QA Release Note" : "QA Reject Note"}`} description="Are you sure?" onConfirm={confirmDelete} loading={operationLoading?.delete} />
            </div>
        </DataCaptureDashboardLayout>
    )
}
