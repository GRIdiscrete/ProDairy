"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Truck,
  Database,
  Droplets,
  CheckCircle2,
  XCircle,
  Clock,
  FlaskConical,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  ChevronDown,
  RefreshCw,
  Activity,
} from "lucide-react"
import { analyticsApi, type CollectionSummaryItem, type IntakeSummaryItem } from "@/lib/api/analytics"
import { siloApi } from "@/lib/api/silo"

// ─── Types ───
type TimePeriod = "volume_today" | "volume_yesterday" | "volume_wtd" | "volume_mtd" | "volume_qtd" | "volume_ytd" | "volume_last_7_days" | "volume_last_30_days"

const TIME_PERIOD_LABELS: Record<TimePeriod, string> = {
  volume_today: "Today",
  volume_yesterday: "Yesterday",
  volume_wtd: "Week to Date",
  volume_mtd: "Month to Date",
  volume_qtd: "Quarter to Date",
  volume_ytd: "Year to Date",
  volume_last_7_days: "Last 7 Days",
  volume_last_30_days: "Last 30 Days",
}

interface DashboardData {
  collectionSummary: CollectionSummaryItem[]
  failedSummary: CollectionSummaryItem[]
  successfulSummary: CollectionSummaryItem[]
  testedSummary: CollectionSummaryItem[]
  untestedSummary: CollectionSummaryItem[]
  intakeSummary: IntakeSummaryItem[]
  silos: any[]
}

// ─── Skeleton Components ───
const StatCardSkeleton = () => (
  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
      <div className="h-10 w-10 bg-gray-100 rounded-xl animate-pulse" />
    </div>
    <div className="h-8 bg-gray-200 rounded w-20 mb-2 animate-pulse" />
    <div className="h-3 bg-gray-100 rounded w-32 animate-pulse" />
  </div>
)

const SiloCardSkeleton = () => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <div className="h-5 bg-gray-200 rounded w-20 animate-pulse" />
      <div className="h-5 bg-gray-100 rounded w-14 animate-pulse" />
    </div>
    <div className="h-3 bg-gray-100 rounded w-16 mb-4 animate-pulse" />
    <div className="h-4 bg-gray-100 rounded-full w-full mb-2 animate-pulse" />
    <div className="flex justify-between">
      <div className="h-3 bg-gray-100 rounded w-16 animate-pulse" />
      <div className="h-3 bg-gray-100 rounded w-12 animate-pulse" />
    </div>
  </div>
)

const TableSkeleton = () => (
  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
    <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse" />
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
          <div className="flex-1 h-4 bg-gray-50 rounded animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-16 animate-pulse" />
          <div className="h-4 bg-gray-100 rounded w-16 animate-pulse" />
        </div>
      ))}
    </div>
  </div>
)

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse mb-2" />
        <div className="h-4 bg-gray-100 rounded w-48 animate-pulse" />
      </div>
      <div className="h-10 bg-gray-100 rounded-xl w-40 animate-pulse" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)}
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => <SiloCardSkeleton key={i} />)}
    </div>
    <TableSkeleton />
  </div>
)

// ─── Component: Stat Card ───
function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  hoverColor,
  comparison,
  comparisonLabel,
}: {
  title: string
  value: number
  icon: any
  iconBg: string
  iconColor: string
  hoverColor?: string
  comparison?: number
  comparisonLabel?: string
}) {
  const diff = comparison !== undefined ? value - comparison : 0
  const isPositive = diff >= 0

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 transition-all duration-300 cursor-pointer ${hoverColor || "hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-300"}`}>
      <div className="flex flex-row items-center justify-between mb-4">
        <h3 className="text-sm text-gray-600">{title}</h3>
        <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </div>
      <div className="text-3xl text-gray-900">
        {value.toLocaleString()}
        <span className="text-sm font-normal text-gray-400 ml-1">L</span>
      </div>
      {comparison !== undefined && (
        <div className="flex items-center gap-1 mt-1">
          {isPositive ? (
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
          )}
          <span className={`text-xs font-medium ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
            {Math.abs(diff).toLocaleString()}L
          </span>
          <span className="text-xs text-gray-400">{comparisonLabel || "vs yesterday"}</span>
        </div>
      )}
    </div>
  )
}

// ─── Component: Silo Visual Card ───
function SiloCard({ silo, onClick }: { silo: any; onClick: () => void }) {
  const fillPercent = silo.capacity > 0 ? Math.max(0, Math.min(100, (silo.milk_volume / silo.capacity) * 100)) : 0
  const statusColor =
    silo.status === "active" ? "bg-emerald-100 text-emerald-700" :
    silo.status === "maintenance" ? "bg-amber-100 text-amber-700" :
    silo.status === "inactive" ? "bg-red-100 text-red-700" :
    "bg-gray-100 text-gray-600"

  const fillColor =
    fillPercent > 80 ? "from-red-500 to-red-400" :
    fillPercent > 60 ? "from-amber-500 to-amber-400" :
    fillPercent > 30 ? "from-blue-500 to-blue-400" :
    "from-emerald-500 to-emerald-400"

  return (
    <button
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-6 transition-all duration-300 text-left w-full cursor-pointer hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-300"
    >
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-sm text-gray-900">{silo.name}</h4>
        <Badge className={`${statusColor} text-[10px] font-medium px-2 py-0.5`}>
          {silo.status || "N/A"}
        </Badge>
      </div>
      <p className="text-xs text-gray-500 mb-3">{silo.category} • {silo.location}</p>

      {/* Fill bar */}
      <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div
          className={`absolute left-0 top-0 h-full bg-gradient-to-r ${fillColor} rounded-full transition-all duration-700`}
          style={{ width: `${fillPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {(silo.milk_volume || 0).toLocaleString()}L / {(silo.capacity || 0).toLocaleString()}L
        </span>
        <span className={`text-xs font-semibold ${fillPercent > 80 ? "text-red-600" : fillPercent > 60 ? "text-amber-600" : "text-blue-600"}`}>
          {fillPercent.toFixed(1)}%
        </span>
      </div>

      {silo.product && (
        <div className="mt-2">
          <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{silo.product}</span>
        </div>
      )}
    </button>
  )
}

// ─── Component: Collection Table ───
function CollectionTable({
  data,
  period,
  truckKey = "truck_number",
}: {
  data: any[]
  period: TimePeriod
  truckKey?: string
}) {
  const rows = data.filter((d: any) => d[truckKey] !== "TOTAL")
  const total = data.find((d: any) => d[truckKey] === "TOTAL")

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Truck</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Today</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Yesterday</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">WTD</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">MTD</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">QTD</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">YTD</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any, i: number) => (
            <tr key={i} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{row[truckKey]}</span>
                </div>
              </td>
              <td className="text-right py-3 px-4 text-gray-600 font-mono">{(row.volume_today || 0).toLocaleString()}L</td>
              <td className="text-right py-3 px-4 text-gray-600 font-mono">{(row.volume_yesterday || 0).toLocaleString()}L</td>
              <td className="text-right py-3 px-4 text-gray-600 font-mono">{(row.volume_wtd || 0).toLocaleString()}L</td>
              <td className="text-right py-3 px-4 text-gray-700 font-mono font-semibold">{(row.volume_mtd || 0).toLocaleString()}L</td>
              <td className="text-right py-3 px-4 text-gray-600 font-mono">{(row.volume_qtd || 0).toLocaleString()}L</td>
              <td className="text-right py-3 px-4 text-gray-600 font-mono">{(row.volume_ytd || 0).toLocaleString()}L</td>
            </tr>
          ))}
          {total && (
            <tr className="bg-gray-50/80 font-semibold border-t-2 border-gray-200">
              <td className="py-3 px-4 text-gray-900">TOTAL</td>
              <td className="text-right py-3 px-4 text-gray-900 font-mono">{(total.volume_today || 0).toLocaleString()}L</td>
              <td className="text-right py-3 px-4 text-gray-900 font-mono">{(total.volume_yesterday || 0).toLocaleString()}L</td>
              <td className="text-right py-3 px-4 text-gray-900 font-mono">{(total.volume_wtd || 0).toLocaleString()}L</td>
              <td className="text-right py-3 px-4 text-blue-700 font-mono">{(total.volume_mtd || 0).toLocaleString()}L</td>
              <td className="text-right py-3 px-4 text-gray-900 font-mono">{(total.volume_qtd || 0).toLocaleString()}L</td>
              <td className="text-right py-3 px-4 text-gray-900 font-mono">{(total.volume_ytd || 0).toLocaleString()}L</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// ─── Component: Silo Detail Drawer ───
function SiloDetailDrawer({ silo, open, onClose }: { silo: any; open: boolean; onClose: () => void }) {
  if (!silo) return null

  const fillPercent = silo.capacity > 0 ? Math.max(0, Math.min(100, (silo.milk_volume / silo.capacity) * 100)) : 0

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-white">
        <div className="px-6 py-6">
          {/* Header */}
          <SheetHeader className="pb-5 mb-6 border-b border-gray-200 px-0">
            <SheetTitle className="text-xl font-light text-foreground">{silo.name}</SheetTitle>
            <p className="text-sm font-light text-muted-foreground mt-1">{silo.category} • {silo.location}</p>
          </SheetHeader>

          <div className="space-y-6">
            {/* Status & Quick Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">Overview</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <Badge className={
                    silo.status === "active" ? "bg-emerald-100 text-emerald-700" :
                    silo.status === "maintenance" ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-600"
                  }>
                    {silo.status || "N/A"}
                  </Badge>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Category</p>
                  <p className="text-sm font-light text-gray-900">{silo.category}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Location</p>
                  <p className="text-sm font-light text-gray-900">{silo.location}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-1">Serial Number</p>
                  <p className="text-sm font-light text-gray-900">{silo.serial_number}</p>
                </div>
              </div>
            </div>

            {/* Fill Level Visual */}
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">Fill Level</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-end justify-center gap-6 mb-4">
                  <div className="relative w-20 h-32 bg-gray-50 border-2 border-gray-200 rounded-lg overflow-hidden">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-300 transition-all duration-700"
                      style={{ height: `${fillPercent}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-800 drop-shadow-sm">{fillPercent.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-2xl text-gray-900">{(silo.milk_volume || 0).toLocaleString()}<span className="text-sm font-normal text-gray-400 ml-1">L</span></p>
                    <p className="text-xs text-gray-500 mt-1">of {(silo.capacity || 0).toLocaleString()}L capacity</p>
                    {/* Fill bar */}
                    <div className="relative w-40 h-2 bg-gray-100 rounded-full overflow-hidden mt-3">
                      <div
                        className={`absolute left-0 top-0 h-full bg-gradient-to-r ${fillPercent > 80 ? "from-red-500 to-red-400" : fillPercent > 60 ? "from-amber-500 to-amber-400" : "from-blue-500 to-blue-400"} rounded-full transition-all duration-700`}
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product */}
            {silo.product && (
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-3">Product</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-light text-gray-900 capitalize">{silo.product}</p>
                </div>
              </div>
            )}

            {/* Composition */}
            {silo.composition && silo.composition.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-3">Composition Details</h3>
                <div className="space-y-2">
                  {silo.composition.map((comp: any, i: number) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-light text-gray-900">{comp.supplier_first_name} {comp.supplier_last_name}</span>
                        <span className="text-sm font-medium text-blue-700">{comp.volume?.toLocaleString()}L</span>
                      </div>
                      <p className="text-xs text-gray-500">Tank: {comp.supplier_tank}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Voucher: {comp.voucher_tag} • {comp.voucher_date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Created: {new Date(silo.created_at).toLocaleDateString()}</span>
                <span>Updated: {new Date(silo.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ─── Main Dashboard ───
export default function ExecutiveDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [period, setPeriod] = useState<TimePeriod>("volume_mtd")
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false)
  const [selectedSilo, setSelectedSilo] = useState<any>(null)
  const [siloDrawerOpen, setSiloDrawerOpen] = useState(false)

  const [data, setData] = useState<DashboardData>({
    collectionSummary: [],
    failedSummary: [],
    successfulSummary: [],
    testedSummary: [],
    untestedSummary: [],
    intakeSummary: [],
    silos: [],
  })

  const fetchAll = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true)
      else setLoading(true)

      const [
        collectionRes,
        failedRes,
        successfulRes,
        testedRes,
        untestedRes,
        intakeRes,
        silosRes,
      ] = await Promise.allSettled([
        analyticsApi.getCollectionSummary(),
        analyticsApi.getFailedCollectionSummary(),
        analyticsApi.getSuccessfulCollectionSummary(),
        analyticsApi.getTestedCollectionSummary(),
        analyticsApi.getUntestedCollectionSummary(),
        analyticsApi.getIntakeSummary(),
        siloApi.getSiloManagerSilos(),
      ])

      setData({
        collectionSummary: collectionRes.status === "fulfilled" ? collectionRes.value.data : [],
        failedSummary: failedRes.status === "fulfilled" ? failedRes.value.data : [],
        successfulSummary: successfulRes.status === "fulfilled" ? successfulRes.value.data : [],
        testedSummary: testedRes.status === "fulfilled" ? testedRes.value.data : [],
        untestedSummary: untestedRes.status === "fulfilled" ? untestedRes.value.data : [],
        intakeSummary: intakeRes.status === "fulfilled" ? intakeRes.value.data : [],
        silos: silosRes.status === "fulfilled" ? silosRes.value.data : [],
      })
    } catch (err) {
      console.error("Failed to load dashboard data:", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Extract TOTALs from each dataset
  const getTotal = useCallback((items: any[], key: string = "truck_number") => {
    return items.find((i: any) => i[key] === "TOTAL") || {}
  }, [])

  const collectionTotal = useMemo(() => getTotal(data.collectionSummary), [data.collectionSummary, getTotal])
  const failedTotal = useMemo(() => getTotal(data.failedSummary), [data.failedSummary, getTotal])
  const successfulTotal = useMemo(() => getTotal(data.successfulSummary), [data.successfulSummary, getTotal])
  const untestedTotal = useMemo(() => getTotal(data.untestedSummary), [data.untestedSummary, getTotal])
  const intakeTotal = useMemo(() => getTotal(data.intakeSummary, "truck"), [data.intakeSummary, getTotal])

  const handleSiloClick = (silo: any) => {
    setSelectedSilo(silo)
    setSiloDrawerOpen(true)
  }

  // Sort silos: raw milk first, then by fill level descending
  const sortedSilos = useMemo(() => {
    return [...data.silos].sort((a, b) => {
      const aFill = a.capacity > 0 ? a.milk_volume / a.capacity : 0
      const bFill = b.capacity > 0 ? b.milk_volume / b.capacity : 0
      return bFill - aFill
    })
  }, [data.silos])

  return (
    <AdminDashboardLayout title="Executive Dashboard" subtitle="Real-time operational overview">
      <div className="space-y-6">
        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Executive Dashboard</h1>
                <p className="text-sm text-gray-500 mt-0.5">Real-time production & collection analytics</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Refresh */}
                <button
                  onClick={() => fetchAll(true)}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh
                </button>

                {/* Period Selector */}
                <div className="relative">
                  <button
                    onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all min-w-[160px]"
                  >
                    <Activity className="w-4 h-4 text-blue-500" />
                    {TIME_PERIOD_LABELS[period]}
                    <ChevronDown className={`w-4 h-4 ml-auto text-gray-400 transition-transform ${periodDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {periodDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setPeriodDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                        {(Object.entries(TIME_PERIOD_LABELS) as [TimePeriod, string][]).map(([key, label]) => (
                          <button
                            key={key}
                            onClick={() => { setPeriod(key); setPeriodDropdownOpen(false) }}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors ${period === key ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ─── KPI Cards ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard
                title="Total Receipts"
                value={collectionTotal[period] || 0}
                icon={Droplets}
                iconBg="bg-gradient-to-br from-blue-500 to-blue-700"
                iconColor="text-white"
                hoverColor="hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-300"
                comparison={collectionTotal.volume_yesterday}
                comparisonLabel="vs yesterday"
              />
              <StatCard
                title="Accepted"
                value={successfulTotal[period] || 0}
                icon={CheckCircle2}
                iconBg="bg-gradient-to-br from-green-500 to-emerald-600"
                iconColor="text-white"
                hoverColor="hover:shadow-lg hover:shadow-green-500/20 hover:border-green-300"
                comparison={successfulTotal.volume_yesterday}
                comparisonLabel="vs yesterday"
              />
              <StatCard
                title="Rejected"
                value={failedTotal[period] || 0}
                icon={XCircle}
                iconBg="bg-gradient-to-br from-red-500 to-red-700"
                iconColor="text-white"
                hoverColor="hover:shadow-lg hover:shadow-red-500/20 hover:border-red-300"
                comparison={failedTotal.volume_yesterday}
                comparisonLabel="vs yesterday"
              />
              <StatCard
                title="Pending"
                value={untestedTotal[period] || 0}
                icon={Clock}
                iconBg="bg-gradient-to-br from-yellow-500 to-orange-600"
                iconColor="text-white"
                hoverColor="hover:shadow-lg hover:shadow-yellow-500/20 hover:border-yellow-300"
                comparison={untestedTotal.volume_yesterday}
                comparisonLabel="vs yesterday"
              />
              <StatCard
                title="Intake Total"
                value={intakeTotal[period] || 0}
                icon={FlaskConical}
                iconBg="bg-gradient-to-br from-violet-500 to-purple-600"
                iconColor="text-white"
                hoverColor="hover:shadow-lg hover:shadow-violet-500/20 hover:border-violet-300"
                comparison={intakeTotal.volume_yesterday}
                comparisonLabel="vs yesterday"
              />
            </div>

            {/* ─── Silo / Tank Status ─── */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Tank & Silo Status</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{data.silos.length} tanks monitored • Click to view details</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> 0-30%</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> 30-60%</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> 60-80%</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> 80%+</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {sortedSilos.map((silo) => (
                  <SiloCard key={silo.id} silo={silo} onClick={() => handleSiloClick(silo)} />
                ))}
              </div>
            </div>

            {/* ─── Tabbed Data Section ─── */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <Tabs defaultValue="collection" className="w-full">
                <div className="border-b border-gray-200 px-6 pt-4">
                  <TabsList className="bg-gray-100/80 p-1 rounded-xl">
                    <TabsTrigger value="collection" className="rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">
                      <Truck className="w-3.5 h-3.5 mr-1.5" />
                      All Collections
                    </TabsTrigger>
                    <TabsTrigger value="successful" className="rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      Accepted
                    </TabsTrigger>
                    <TabsTrigger value="failed" className="rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">
                      <XCircle className="w-3.5 h-3.5 mr-1.5" />
                      Rejected
                    </TabsTrigger>
                    <TabsTrigger value="untested" className="rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">
                      <Clock className="w-3.5 h-3.5 mr-1.5" />
                      Pending
                    </TabsTrigger>
                    <TabsTrigger value="intake" className="rounded-lg text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">
                      <FlaskConical className="w-3.5 h-3.5 mr-1.5" />
                      Intake
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="collection" className="p-0">
                  <CollectionTable data={data.collectionSummary} period={period} />
                </TabsContent>
                <TabsContent value="successful" className="p-0">
                  <CollectionTable data={data.successfulSummary} period={period} />
                </TabsContent>
                <TabsContent value="failed" className="p-0">
                  <CollectionTable data={data.failedSummary} period={period} />
                </TabsContent>
                <TabsContent value="untested" className="p-0">
                  <CollectionTable data={data.untestedSummary} period={period} />
                </TabsContent>
                <TabsContent value="intake" className="p-0">
                  <CollectionTable data={data.intakeSummary} period={period} truckKey="truck" />
                </TabsContent>
              </Tabs>
            </div>

            {/* ─── Tested vs Untested Summary Strip ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-900">Tested Collections</h3>
                    <p className="text-xs text-gray-500">Lab-verified milk collections</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {data.testedSummary
                    .filter((t) => t.truck_number !== "TOTAL")
                    .slice(0, 6)
                    .map((t, i) => (
                      <div key={i} className="text-center">
                        <p className="text-xs text-gray-500 truncate">{t.truck_number}</p>
                        <p className="text-lg font-semibold text-emerald-700">{(t[period] || 0).toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400">litres</p>
                      </div>
                    ))}
                </div>
                {(() => {
                  const testedTotal = getTotal(data.testedSummary)
                  return (
                    <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-500">Total Tested</span>
                      <span className="text-xl text-emerald-700">{(testedTotal[period] || 0).toLocaleString()}L</span>
                    </div>
                  )
                })()}
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-900">Untested Collections</h3>
                    <p className="text-xs text-gray-500">Awaiting lab verification</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {data.untestedSummary
                    .filter((t) => t.truck_number !== "TOTAL")
                    .slice(0, 6)
                    .map((t, i) => (
                      <div key={i} className="text-center">
                        <p className="text-xs text-gray-500 truncate">{t.truck_number}</p>
                        <p className="text-lg font-semibold text-amber-700">{(t[period] || 0).toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400">litres</p>
                      </div>
                    ))}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-500">Total Untested</span>
                  <span className="text-xl text-amber-700">{(untestedTotal[period] || 0).toLocaleString()}L</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Silo Detail Drawer */}
        <SiloDetailDrawer
          silo={selectedSilo}
          open={siloDrawerOpen}
          onClose={() => setSiloDrawerOpen(false)}
        />
      </div>
    </AdminDashboardLayout>
  )
}
