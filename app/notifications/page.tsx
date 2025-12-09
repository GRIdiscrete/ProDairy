"use client"

import { useEffect, useMemo, useState, Suspense } from 'react'
import { getNotifications, getModuleNotifications, humanizeModule, type NotificationItem } from '@/lib/api/notifications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatDistanceToNow, parseISO, isValid } from 'date-fns'
import { Bell, ExternalLink } from 'lucide-react'
import { NotificationsLayout } from '@/components/layout/notifications-layout'
import { unstable_noStore as noStore } from 'next/cache'

export const dynamic = 'force-dynamic'

// Force this page to be dynamic
noStore()

// --- Add moduleToRoute mapping helper ---
function moduleToRoute(module: string, formId?: string): string | null {
  // Hardcoded formId for routes that require it
  const hardcodedId = "a4de97cc-e132-431e-a0a7-5c5e85e53d11";
  const map: Record<string, (id?: string) => string> = {
    // Drivers
    "drivers_form": (id) => `/drivers/forms${id ? `?form_id=${formId}` : ""}`,

    // Tools
    "bmt_control_form": (id) => `/tools/bmt-control-form${id ? `?form_id=${formId}` : ""}`,
    "cip_control_form": (id) => `/tools/cip-control-form${id ? `?form_id=${formId}` : ""}`,
    "ist_control_form": (id) => `/tools/ist-control-form${id ? `?form_id=${formId}` : ""}`,
    "general_lab_test": (id) => `/tools/general-lab-test${id ? `?form_id=${formId}` : ""}`,

    // Admin
    "production_plan": (id) => `/admin/production-plan${id ? `?form_id=${formId}` : ""}`,
    "process": (id) => `/admin/processes${id ? `?form_id=${formId}` : ""}`,
    "filmatic_line_groups_2": (id) => `/admin/filmatic-lines-groups${id ? `?form_id=${formId}` : ""}`,
    "silo": (id) => `/admin/silos${id ? `?form_id=${formId}` : ""}`,

    // Data Capture - no formId in URL, now append formId as query param
    "raw-milk-intake": (id) => `/data-capture/raw-milk-intake${id ? `?form_id=${formId}` : ""}`,
    "raw_milk_intake_lab_test": (id) => `/data-capture/raw-milk-intake${id ? `?form_id=${formId}` : ""}`,
    "raw_milk_intake_form": (id) => `/data-capture/raw-milk-intake${id ? `?form_id=${formId}` : ""}`,
    "raw_milk_result_slip": (id) => `/data-capture/raw-milk-intake${id ? `?form_id=${formId}` : ""}`,
    "standardizing_form": (id) => `/data-capture/standardizing${id ? `?form_id=${formId}` : ""}`,
    "standardizing_form_no_skim": (id) => `/data-capture/standardizing${id ? `?form_id=${formId}` : ""}`,

    // Data Capture - with formId in URL (use formId from notification, fallback to hardcodedId)
    "steri_milk_pasteurizing_form": (id) => `/data-capture/${id || hardcodedId}/pasteurizing`,
    "lab_test_mixing_and_pasteurizing": (id) => `/data-capture/${id || hardcodedId}/pasteurizing`,
    "filmatic_line_form_1": (id) => `/data-capture/${id || hardcodedId}/filmatic-lines${id ? `?form_id=${formId}` : ""}`,
    "steri_milk_process_log": (id) => `/data-capture/${id || hardcodedId}/process-log${id ? `?form_id=${formId}` : ""}`,
    "lab_test_post_process": (id) => `/data-capture/${id || hardcodedId}/process-log${id ? `?form_id=${formId}` : ""}`,
    "steri_milk_test_report": (id) => `/data-capture/${id || hardcodedId}/process-log${id ? `?form_id=${formId}` : ""}`,
    "filmatic_line_form_2": (id) => `/data-capture/${id || hardcodedId}/filmatic-lines-2${id ? `?form_id=${formId}` : ""}`,
    "palletiser_sheet": (id) => `/data-capture/${id || hardcodedId}/palletiser-sheet${id ? `?form_id=${formId}` : ""}`,
    "incubation_tracking_form": (id) => `/data-capture/${id || hardcodedId}/incubation${id ? `?form_id=${formId}` : ""}`,
    "uht_quality_check_after_incubation": (id) => `/data-capture/${id || hardcodedId}/test${id ? `?form_id=${formId}` : ""}`,
    "qa_corrective_action": (id) => `/data-capture/${id || hardcodedId}/qa-corrective-measures${id ? `?form_id=${formId}` : ""}`,
    "qa_release_note": (id) => `/data-capture/${id || hardcodedId}/dispatch${id ? `?form_id=${formId}` : ""}`,
    "qa_reject_note": (id) => `/data-capture/${id || hardcodedId}/dispatch${id ? `?form_id=${formId}` : ""}`,
  }

  if (map[module]) {
    return map[module](formId)
  }
  return null
}

// --- Correct module names mapping for left sidebar ---
const moduleLabels: Record<string, string> = {
  "drivers_form": "Drivers Forms",
  "bmt_control_form": "BMT Control Form",
  "cip_control_form": "CIP Control Form",
  "ist_control_form": "IST Control Form",
  "general_lab_test": "General Lab Test",
  "production_plan": "Production Plan",
  "process": "Process",
  "filmatic_line_groups_2": "Filmatic Line Groups",
  "silo": "Silos",
  "raw-milk-intake": "Raw Milk Intake",
  "raw_milk_intake_lab_test": "Raw Milk Intake Lab Test",
  "raw_milk_intake_form": "Raw Milk Intake Form",
  "raw_milk_result_slip": "Raw Milk Result Slip",
  "standardizing_form": "Standardizing Form",
  "standardizing_form_no_skim": "Standardizing Form No Skim",
  "steri_milk_pasteurizing_form": "Pasteurizing",
  "lab_test_mixing_and_pasteurizing": "Lab Test Mixing & Pasteurizing",
  "filmatic_line_form_1": "Filmatic Line 1",
  "steri_milk_process_log": "Process Log",
  "lab_test_post_process": "Lab Test Post Process",
  "steri_milk_test_report": "Test Report",
  "filmatic_line_form_2": "Filmatic Line 2",
  "palletiser_sheet": "Palletiser Sheet",
  "incubation_tracking_form": "Incubation Tracking",
  "uht_quality_check_after_incubation": "UHT Quality Check",
  "qa_corrective_action": "QA Corrective Action",
  "qa_release_note": "QA Release Note",
  "qa_reject_note": "QA Reject Note",
}

function NotificationsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [items, setItems] = useState<NotificationItem[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [moduleFilter, setModuleFilter] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const m = searchParams?.get('module') || undefined
    setModuleFilter(m)
  }, [searchParams])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const data = moduleFilter
          ? await getModuleNotifications(moduleFilter, { page, limit })
          : await getNotifications({ page, limit })
        if (!cancelled) setItems(data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [page, limit, moduleFilter])

  // Unique modules for sidebar
  const uniqueModules = useMemo(() => {
    const set = new Set(items.map(i => i.module))
    return Array.from(set)
  }, [items])

  // --- Design: Sidebar + Recent notifications ---
  return (
    <NotificationsLayout title="Notifications" subtitle="View all system notifications">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Modules sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white border border-zinc-200 rounded-lg p-4">
            <div className="font-semibold text-zinc-700 mb-2 text-sm">Modules</div>
            <ul className="space-y-1">
              <li>
                <Button
                  variant={!moduleFilter ? "default" : "outline"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setModuleFilter(undefined)}
                >
                  All Modules
                </Button>
              </li>
              {uniqueModules.map(mod => (
                <li key={mod}>
                  <Button
                    variant={moduleFilter === mod ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setModuleFilter(mod)}
                  >
                    {moduleLabels[mod] || humanizeModule(mod)}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        {/* Right: Recent notifications */}
        <main className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-light flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                Recent Notifications
                {items.length > 0 && (
                  <span className="text-sm font-normal text-zinc-500">
                    ({items.length} notification{items.length !== 1 ? 's' : ''})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="p-6 text-sm text-zinc-500 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Loading notifications...
                  </div>
                </div>
              ) : items.length === 0 ? (
                <div className="p-6 text-sm text-zinc-500 text-center">
                  <Bell className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                  <p>No notifications found</p>
                  {moduleFilter && (
                    <p className="text-xs mt-1">
                      Try selecting a different module or view all notifications
                    </p>
                  )}
                </div>
              ) : (
                <ul className="divide-y">
                  {items.map(n => {
                    const d = typeof n.created_at === 'string' ? parseISO(n.created_at) : new Date(n.created_at)
                    const when = isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : ''
                    const label = `${moduleLabels[n.module] || humanizeModule(n.module)} · ${n.action}`
                    return (
                      <li key={n.id} className="py-3">
                        <button
                          className="w-full text-left hover:bg-blue-50 px-2 py-3 rounded-md transition-colors flex items-center gap-3"
                          onClick={() => {
                            const href = moduleToRoute(n.module, n.form_id)
                            if (href) router.push(href)
                          }}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <Bell className="h-5 w-5 text-blue-600" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-zinc-900">{moduleLabels[n.module] || humanizeModule(n.module)}</span>
                                <span className="text-xs text-zinc-500">{n.action}</span>
                              </div>
                              <div className="text-xs text-zinc-500">{when}</div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-zinc-400" />
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <Button
                  
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <div className="text-xs text-zinc-500">
                  Page {page}
                </div>
                <Button
                  
                  onClick={() => setPage((p) => p + 1)}
                  disabled={items.length < limit}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </NotificationsLayout>
  )
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={
      <NotificationsLayout title="Notifications" subtitle="View all system notifications">
        <div className="p-6 text-sm text-zinc-500 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            Loading notifications...
          </div>
        </div>
      </NotificationsLayout>
    }>
      <NotificationsContent />
    </Suspense>
  )
}


