"use client"

import { useEffect, useMemo, useState } from 'react'
import { getNotifications, getModuleNotifications, humanizeModule, moduleToRoute, type NotificationItem } from '@/lib/api/notifications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'
import { formatDistanceToNow, parseISO, isValid } from 'date-fns'
import { Bell, ExternalLink } from 'lucide-react'
import { NotificationsLayout } from '@/components/layout/notifications-layout'

export default function NotificationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [items, setItems] = useState<NotificationItem[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [moduleFilter, setModuleFilter] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const m = searchParams.get('module') || undefined
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

  const uniqueModules = useMemo(() => {
    const set = new Set(items.map(i => i.module))
    return Array.from(set)
  }, [items])

  return (
    <NotificationsLayout title="Notifications" subtitle="View all system notifications">
      <div className="space-y-6">
        {/* Current Filter Display */}
        {moduleFilter && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Bell className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Showing notifications for: <span className="font-medium">{humanizeModule(moduleFilter)}</span>
            </span>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-light flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              Recent Activity
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
                  const label = `${humanizeModule(n.module)} · ${n.action}`
                  return (
                    <li key={n.id} className="py-3">
                      <button
                        className="w-full text-left hover:bg-zinc-50 px-2 py-2 rounded-md transition-colors"
                        onClick={() => {
                          const href = moduleToRoute(n.module, n.form_id)
                          if (href) router.push(href)
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <Bell className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-sm text-zinc-900">{label}</div>
                            <div className="text-xs text-zinc-500">{when}</div>
                          </div>
                          <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
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
                variant="outline" 
                disabled={page <= 1} 
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <div className="text-xs text-zinc-500">
                Page {page}
              </div>
              <Button 
                variant="outline" 
                onClick={() => setPage((p) => p + 1)}
                disabled={items.length < limit}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </NotificationsLayout>
  )
}


