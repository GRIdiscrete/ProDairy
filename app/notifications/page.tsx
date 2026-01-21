"use client"

import { useEffect, useMemo, Suspense } from 'react'
import { humanizeModule, moduleToRoute, type NotificationItem } from '@/lib/api/notifications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatDistanceToNow, parseISO, isValid } from 'date-fns'
import { Bell, ExternalLink } from 'lucide-react'
import { NotificationsLayout } from '@/components/layout/notifications-layout'
import { unstable_noStore as noStore } from 'next/cache'
import { useAppDispatch, useAppSelector } from '@/lib/store'
import { fetchNotifications, fetchModuleNotifications, setPage, setLimit, setModuleFilter } from '@/lib/store/slices/notificationsSlice'

export const dynamic = 'force-dynamic'

// Force this page to be dynamic
noStore()

// --- Add moduleToRoute mapping helper ---
function moduleToRouteLocal(module: string, formId?: string): string | null {
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
  const dispatch = useAppDispatch()

  // Get state from Redux
  const { items, loading, page, limit, moduleFilter } = useAppSelector((state) => state.notifications)

  useEffect(() => {
    const m = searchParams?.get('module') || undefined
    dispatch(setModuleFilter(m))
  }, [searchParams, dispatch])

  useEffect(() => {
    if (moduleFilter) {
      dispatch(fetchModuleNotifications({ module: moduleFilter, params: { page, limit } }))
    } else {
      dispatch(fetchNotifications({ page, limit }))
    }
  }, [page, limit, moduleFilter, dispatch])

  // Unique modules for sidebar
  const uniqueModules = useMemo(() => {
    const set = new Set(items.map(i => i.module))
    return Array.from(set)
  }, [items])

  // Group notifications by module
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, NotificationItem[]> = {}
    items.forEach(item => {
      if (!groups[item.module]) {
        groups[item.module] = []
      }
      groups[item.module].push(item)
    })
    return groups
  }, [items])

  // --- Design: Sidebar + Recent notifications ---
  return (
    <NotificationsLayout title="Recent Notifications" subtitle="Stay updated with system activities">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Modules sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white border border-zinc-200 rounded-lg p-4 shadow-sm">
            <div className="font-semibold text-zinc-700 mb-3 text-sm">Filter by Module</div>
            <ul className="space-y-1.5">
              <li>
                <Button
                  variant={!moduleFilter ? "default" : "outline"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => dispatch(setModuleFilter(undefined))}
                >
                  All Modules
                </Button>
              </li>
              {uniqueModules.map(mod => (
                <li key={mod}>
                  <Button
                    variant={moduleFilter === mod ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => dispatch(setModuleFilter(mod))}
                  >
                    {moduleLabels[mod] || humanizeModule(mod)}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        {/* Right: Grouped notifications */}
        <main className="flex-1">
          <Card className="shadow-md">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-white">
              <CardTitle className="text-xl font-semibold flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Bell className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div>Recent Notifications</div>
                  {items.length > 0 && (
                    <div className="text-sm font-normal text-zinc-500 mt-0.5">
                      {items.length} notification{items.length !== 1 ? 's' : ''} across {Object.keys(groupedNotifications).length} module{Object.keys(groupedNotifications).length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="p-12 text-sm text-zinc-500 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p>Loading notifications...</p>
                  </div>
                </div>
              ) : items.length === 0 ? (
                <div className="p-12 text-sm text-zinc-500 text-center">
                  <Bell className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                  <p className="text-base font-medium text-zinc-700">No notifications found</p>
                  {moduleFilter && (
                    <p className="text-xs mt-2">
                      Try selecting a different module or view all notifications
                    </p>
                  )}
                </div>
              ) : (
                <Accordion type="multiple" className="space-y-3">
                  {Object.entries(groupedNotifications).map(([module, notifications]) => (
                    <AccordionItem
                      key={module}
                      value={module}
                      className="border border-zinc-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <AccordionTrigger className="px-4 py-3 hover:bg-zinc-50 hover:no-underline">
                        <div className="flex items-center gap-3 w-full">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="p-2 bg-blue-50 rounded-md">
                              <Bell className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="text-left">
                              <div className="font-semibold text-zinc-900">
                                {moduleLabels[module] || humanizeModule(module)}
                              </div>
                              <div className="text-xs text-zinc-500 mt-0.5">
                                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                          <div className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                            {notifications.length}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-3">
                        <ul className="space-y-2 mt-2">
                          {notifications.map(n => {
                            const d = typeof n.created_at === 'string' ? parseISO(n.created_at) : new Date(n.created_at)
                            const when = isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : ''
                            return (
                              <li key={n.id}>
                                <button
                                  className="w-full text-left hover:bg-blue-50 p-3 rounded-md transition-all border border-transparent hover:border-blue-200 flex items-start gap-3 group"
                                  onClick={() => {
                                    const href = moduleToRouteLocal(n.module, n.form_id)
                                    if (href) router.push(href)
                                  }}
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-zinc-900 group-hover:text-blue-600 transition-colors">
                                        {n.action}
                                      </span>
                                      <span className="text-xs px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-full">
                                        {when}
                                      </span>
                                    </div>
                                    <div className="text-xs text-zinc-500">
                                      Form ID: {n.form_id.substring(0, 8)}...
                                    </div>
                                  </div>
                                  <ExternalLink className="h-4 w-4 text-zinc-400 group-hover:text-blue-600 transition-colors mt-0.5" />
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => dispatch(setPage(Math.max(1, page - 1)))}
                >
                  Previous
                </Button>
                <div className="text-sm text-zinc-600 font-medium">
                  Page {page}
                </div>
                <Button
                  variant="outline"
                  onClick={() => dispatch(setPage(page + 1))}
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


