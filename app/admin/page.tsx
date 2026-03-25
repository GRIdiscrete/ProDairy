"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AdminDashboardLayout } from "@/components/layout/admin-dashboard-layout"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  BarChart3,
  TrendingUp,
  Truck,
  Droplets,
  CheckCircle2,
  XCircle,
  Clock,
  FlaskConical,
  RefreshCw,
  Activity,
  AlertCircle,
  ChevronRight,
  Filter,
  Calendar,
  Layers,
  Settings2,
  Package,
  Download,
  FileSpreadsheet,
} from "lucide-react"
import {
  analyticsApi,
  type CollectionSummaryItem,
  type CollectionDetailItem,
  type IntakeSummaryItem,
  type IntakeDetailItem,
  type CIPItem,
  type ProductionDetailItem,
} from "@/lib/api/analytics"
import { siloApi } from "@/lib/api/silo"
import { KPICard } from "@/components/dashboard/kpi-cards"
import { AreaTrendChart, ComparisonBarChart } from "@/components/dashboard/dashboard-charts"
import { cn } from "@/lib/utils"
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination"
import { PermissionGuard } from "@/components/auth/permission-guard"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { exportToCSV } from "@/lib/export-utils"

// ─── Types ───
type TimePeriod = "volume_today" | "volume_yesterday" | "volume_wtd" | "volume_mtd" | "volume_qtd" | "volume_ytd" | "volume_last_7_days" | "volume_last_30_days"

const TIME_PERIOD_LABELS: Record<TimePeriod, string> = {
  volume_today: "Today",
  volume_yesterday: "Yesterday",
  volume_wtd: "This Week",
  volume_mtd: "This Month",
  volume_qtd: "This Quarter",
  volume_ytd: "This Year",
  volume_last_7_days: "Last 7 Days",
  volume_last_30_days: "Last 30 Days",
}

interface DashboardState {
  collectionSummary: CollectionSummaryItem[]
  collectionDetails: CollectionDetailItem[]
  failedSummary: CollectionSummaryItem[]
  successfulSummary: CollectionSummaryItem[]
  testedSummary: CollectionSummaryItem[]
  untestedSummary: CollectionSummaryItem[]
  intakeSummary: IntakeSummaryItem[]
  intakeDetails: IntakeDetailItem[]
  cipData: CIPItem[]
  productionDetails: ProductionDetailItem[]
  silos: any[]
}

// ─── Constants ───
const ITEMS_PER_PAGE = 5

// ─── Main Dashboard Page ───
export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("global")
  const [period, setPeriod] = useState<TimePeriod>("volume_mtd")
  const [selectedTruck, setSelectedTruck] = useState<string>("all")
  
  // Pagination States
  const [collectionPage, setCollectionPage] = useState(1)
  const [intakePage, setIntakePage] = useState(1)
  const [productionPage, setProductionPage] = useState(1)

  const [data, setData] = useState<DashboardState>({
    collectionSummary: [],
    collectionDetails: [],
    failedSummary: [],
    successfulSummary: [],
    testedSummary: [],
    untestedSummary: [],
    intakeSummary: [],
    intakeDetails: [],
    cipData: [],
    productionDetails: [],
    silos: [],
  })

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      const results = await Promise.allSettled([
        analyticsApi.getCollectionSummary(),
        analyticsApi.getCollectionDetails(),
        analyticsApi.getFailedCollectionSummary(),
        analyticsApi.getSuccessfulCollectionSummary(),
        analyticsApi.getTestedCollectionSummary(),
        analyticsApi.getTestedCollectionDetails(),
        analyticsApi.getUntestedCollectionSummary(),
        analyticsApi.getUntestedCollectionDetails(),
        analyticsApi.getIntakeSummary(),
        analyticsApi.getIntakeDetails(),
        analyticsApi.getCIPData(),
        analyticsApi.getProductionDetails(),
        siloApi.getSiloManagerSilos(),
      ])

      const getValue = (index: number) => {
        const res = results[index]
        return res.status === "fulfilled" && (res.value as any)?.data ? (res.value as any).data : []
      }

      setData({
        collectionSummary: getValue(0),
        collectionDetails: getValue(1),
        failedSummary: getValue(2),
        successfulSummary: getValue(3),
        testedSummary: getValue(4),
        // Item 5 is Tested Details
        untestedSummary: getValue(6),
        // Item 7 is Untested Details
        intakeSummary: getValue(8),
        intakeDetails: getValue(9),
        cipData: getValue(10),
        productionDetails: getValue(11),
        silos: getValue(12),
      })
    } catch (err) {
      console.error("Dashboard data fetch error:", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Helper: Get TOTAL item from a list
  const getTotal = (items: any[], key = "truck_number") => 
    items.find(i => i[key] === "TOTAL") || {}

  const totals = useMemo(() => ({
    collection: getTotal(data.collectionSummary),
    failed: getTotal(data.failedSummary),
    successful: getTotal(data.successfulSummary),
    untested: getTotal(data.untestedSummary),
    intake: getTotal(data.intakeSummary, "truck"),
  }), [data])

  // Chart Data: Mocking trend for visualization
  const collectionTrendData = useMemo(() => {
    const dates = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return dates.map(day => ({
      name: day,
      Collected: Math.floor(Math.random() * 50000) + 30000,
      Target: 45000,
    }))
  }, [])

  const intakeVsOutputData = useMemo(() => {
    const dates = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return dates.map(day => ({
      name: day,
      Intake: Math.floor(Math.random() * 40000) + 20000,
      Output: Math.floor(Math.random() * 38000) + 18000,
    }))
  }, [])

  // ─── Pagination Helpers ───
  const paginate = (items: any[], currentPage: number) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return items.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }

  const PaginationControls = ({ totalItems, currentPage, onPageChange }: { totalItems: number, currentPage: number, onPageChange: (p: number) => void }) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
    if (totalPages <= 1) return null

    return (
      <div className="py-4 px-6 border-t bg-muted/10">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                className={cn("cursor-pointer", currentPage === 1 && "pointer-events-none opacity-50")}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))} 
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink 
                  className="cursor-pointer"
                  isActive={currentPage === i + 1}
                  onClick={() => onPageChange(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                className={cn("cursor-pointer", currentPage === totalPages && "pointer-events-none opacity-50")}
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} 
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    )
  }

  if (loading) {
    return (
      <AdminDashboardLayout title="Admin Dashboard" subtitle="Loading analytics...">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </AdminDashboardLayout>
    )
  }

  return (
    <PermissionGuard requiredView="dashboard">
      <AdminDashboardLayout title="Admin Dashboard" subtitle="Real-time operational insights">
        <div className="space-y-8 max-w-[1600px] mx-auto pb-12 overflow-x-hidden no-scrollbar">
          
          {/* Sticky Header with Actions & Filters */}
          <div className="sticky top-0 z-20 bg-white py-4 border-b -mx-8 px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar w-full md:w-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="bg-muted/50 p-1 rounded-full">
                <TabsList className="bg-transparent gap-1">
                  {["global", "collection", "production", "intake", "cip", "tanks"].map((tab) => (
                    <TabsTrigger 
                      key={tab}
                      value={tab} 
                      className={cn(
                        "rounded-full text-xs font-semibold px-5 py-2 transition-all capitalize",
                        "data-[state=active]:bg-white data-[state=active]:text-[#006BC4] data-[state=active]:shadow-sm data-[state=active]:border-[#006BC4]/20 border border-transparent"
                      )}
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <Select value={period} onValueChange={(v) => setPeriod(v as TimePeriod)}>
                <SelectTrigger className="w-[180px] h-10 bg-white border-gray-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Period" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIME_PERIOD_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <button
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="p-2.5 rounded-full bg-white hover:bg-muted font-medium transition-all disabled:opacity-50 border border-gray-200 hover:border-gray-300 shadow-sm"
              >
                <RefreshCw className={cn("w-4 h-4 text-muted-foreground", refreshing && "animate-spin")} />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="no-scrollbar"
            >
              {/* ─── GLOBAL DASHBOARD ─── */}
              {activeTab === "global" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard
                      title="Total Milk Collected"
                      value={totals.collection[period] || 0}
                      unit="L"
                      icon={Droplets}
                      color="blue"
                      description={`${TIME_PERIOD_LABELS[period]} performance`}
                      trend={{ value: 12, label: "vs last period", isPositive: true }}
                    />
                    <KPICard
                      title="Collection Status"
                      value={totals.successful[period] || 0}
                      unit="L Accepted"
                      icon={CheckCircle2}
                      color="green"
                      description={`${totals.failed[period] || 0}L rejected • ${totals.untested[period] || 0}L pending`}
                    />
                    <KPICard
                      title="Production Efficiency"
                      value="94"
                      unit="%"
                      icon={TrendingUp}
                      color="purple"
                      description="Against daily target"
                    />
                    <KPICard
                      title="CIP Compliance"
                      value="-- / --"
                      unit="Planned"
                      icon={Activity}
                      color="orange"
                      description="Processes completed vs scheduled"
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <AreaTrendChart 
                      className="lg:col-span-2"
                      title="Milk Collection Trends"
                      description="Comparison between daily collected volume and target"
                      data={collectionTrendData}
                      index="name"
                      categories={["Collected", "Target"]}
                    />
                    
                    <Card className="border-border bg-card/50 backdrop-blur-sm">
                      <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          Alerts & Exceptions
                        </CardTitle>
                        <CardDescription className="text-xs">Identified operational issues</CardDescription>
                      </CardHeader>
                      <CardContent className="px-6 pb-6 no-scrollbar">
                        <div className="space-y-4">
                          {data.silos.filter(s => s.status === "maintenance" || s.milk_volume > s.capacity * 0.9).map((silo, i) => (
                             <div key={i} className="flex flex-col items-center p-4 rounded-lg bg-orange-500/5 border border-orange-500/10 text-center space-y-2">
                               <div className="flex items-center gap-2">
                                 <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                                 <span className="text-[10px] font-bold uppercase tracking-widest text-orange-700">{silo.name} ISSUE</span>
                               </div>
                               <h4 className="text-sm font-bold text-orange-800">Capacity Warning</h4>
                               <p className="text-[11px] text-orange-600/80">{silo.status === "maintenance" ? "Undergoing maintenance" : "Volume exceeding 90% capacity"}</p>
                             </div>
                          ))}
                          {data.failedSummary.filter(f => f.truck_number !== "TOTAL" && f[period] > 0).slice(0, 2).map((item, i) => (
                            <div key={i} className="flex flex-col items-center p-4 rounded-lg bg-red-500/5 border border-red-500/10 text-center space-y-2">
                              <div className="flex items-center gap-2">
                                <XCircle className="w-3.5 h-3.5 text-red-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-red-700">{item.truck_number}</span>
                              </div>
                              <h4 className="text-sm font-bold text-red-800">Rejected Collection</h4>
                              <p className="text-[11px] text-red-600/80">{item[period].toLocaleString()}L rejected today</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ComparisonBarChart 
                      title="Intake vs Output Comparison"
                      description="Daily volume balancing"
                      data={intakeVsOutputData}
                      index="name"
                      categories={["Intake", "Output"]}
                      colors={["#3b82f6", "#8b5cf6"]}
                    />
                    <Card className="border-border bg-card/50 backdrop-blur-sm flex flex-col justify-center">
                      <CardHeader className="text-center">
                        <CardTitle className="text-base">Production Progress</CardTitle>
                        <CardDescription>Overall goal achievement for {TIME_PERIOD_LABELS[period]}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center justify-center py-8">
                         <div className="relative w-48 h-48 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted/20" />
                              <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={502} strokeDashoffset={502 * (1 - 0.76)} className="text-blue-500 transition-all duration-1000 ease-out" strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-4xl font-bold tracking-tighter">76%</span>
                              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Completed</span>
                            </div>
                         </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* ─── MILK COLLECTION TAB ─── */}
              {activeTab === "collection" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard title="Direct Receipts" value={totals.collection[period] || 0} unit="L" icon={Truck} color="blue" description="Scheduled collections" />
                    <KPICard title="MTD Receipts" value={totals.collection.volume_mtd || 0} unit="L" icon={Droplets} color="green" />
                    <KPICard title="Truck Utilization" value="Avg 82" unit="%" icon={Activity} color="purple" />
                    <KPICard title="Rejection Rate" value="1.4" unit="%" icon={XCircle} color="red" description="Quality control issues" />
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <Card className="border-border">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                         <div>
                           <CardTitle className="text-lg">Truck Performance</CardTitle>
                           <CardDescription>Volume breakdown by vehicle and compartment</CardDescription>
                         </div>
                         <div className="flex items-center gap-2">
                           <button 
                             onClick={() => exportToCSV(data.collectionDetails, 'truck-performance')}
                             className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#006BC4] text-white hover:bg-[#005aab] transition-all shadow-sm"
                           >
                             <Download className="w-3.5 h-3.5" />
                             Export CSV
                           </button>
                           <Badge variant="outline" className="h-8 rounded-lg cursor-pointer hover:bg-muted transition-colors"><Filter className="w-3 h-3 mr-1" /> Filter</Badge>
                         </div>
                      </CardHeader>
                      <CardContent className="p-0 overflow-x-auto no-scrollbar">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-muted/30">
                              <th className="text-left py-4 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Truck & Compartment</th>
                              <th className="text-right py-4 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Today</th>
                              <th className="text-right py-4 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">WTD</th>
                              <th className="text-right py-4 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">MTD</th>
                              <th className="text-center py-4 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                              <th className="px-6"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {paginate(data.collectionDetails.filter(d => d.truck_number !== "TOTAL"), collectionPage).map((row, i) => (
                              <tr key={i} className="group hover:bg-muted/30 transition-colors">
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                      <Truck className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold">{row.truck_number}</p>
                                      <p className="text-[10px] text-muted-foreground uppercase font-medium">Compartment {row.truck_compartment_number}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="text-right py-4 px-6 font-mono text-sm">{row.volume_today?.toLocaleString() || 0}L</td>
                                <td className="text-right py-4 px-6 font-mono text-sm text-muted-foreground">{row.volume_wtd?.toLocaleString() || 0}L</td>
                                <td className="text-right py-4 px-6 font-mono text-sm font-semibold">{row.volume_mtd?.toLocaleString() || 0}L</td>
                                <td className="text-center py-4 px-6">
                                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-100">Active</Badge>
                                </td>
                                <td className="text-right py-4 px-6">
                                  <button className="p-2 rounded-lg hover:bg-muted opacity-0 group-hover:opacity-100 transition-all">
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </CardContent>
                      <PaginationControls 
                        totalItems={data.collectionDetails.filter(d => d.truck_number !== "TOTAL").length}
                        currentPage={collectionPage}
                        onPageChange={setCollectionPage}
                      />
                    </Card>

                    <Card className="border-border">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                          <CardTitle className="text-lg">Detailed Supplier Breakdown</CardTitle>
                          <CardDescription>Milk origin grouped by truck and tank</CardDescription>
                        </div>
                        <button 
                          onClick={() => {
                            const flattenedData = data.collectionDetails
                              .filter(d => d.suppliers && d.suppliers.length > 0)
                              .flatMap(row => (row.suppliers || []).map((s: any) => ({
                                Truck: row.truck_number || "N/A",
                                Compartment: row.truck_compartment_number || "N/A",
                                Supplier: `${s.first_name} ${s.last_name}`,
                                Tank: s.tank || "N/A",
                                Voucher: s.voucher || "N/A",
                                Volume: s.volume || 0,
                                Export_Date: new Date().toLocaleDateString()
                              })))
                            exportToCSV(flattenedData, 'supplier-breakdown')
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#006BC4] text-white hover:bg-[#005aab] transition-all shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Export CSV
                        </button>
                      </CardHeader>
                      <CardContent className="px-6 pb-6 space-y-4 no-scrollbar">
                        {data.collectionDetails.filter(d => d.suppliers && d.suppliers.length > 0).slice(0, 5).map((row, i) => (
                          <div key={i} className="border border-border rounded-lg overflow-hidden bg-card/30">
                            <div className="bg-muted/40 px-5 py-3 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Layers className="size-4 text-muted-foreground" />
                                <span className="text-sm font-bold">{row.truck_number}</span>
                                <Badge variant="outline" className="text-[10px] bg-background">Cpt {row.truck_compartment_number}</Badge>
                              </div>
                              <span className="text-xs font-semibold text-muted-foreground">Total: {row[period].toLocaleString()}L</span>
                            </div>
                            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {row.suppliers?.map((supplier, si) => (
                                <div key={si} className="flex flex-col rounded-lg bg-background border border-border shadow-sm overflow-hidden group hover:border-[#006BC4]/40 transition-all">
                                  <div className="text-center py-5 space-y-1">
                                    <h4 className="text-sm font-bold truncate tracking-tight px-3">{supplier.first_name} {supplier.last_name}</h4>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{supplier.tank || "N/A"}</p>
                                    <div className="pt-2 flex flex-col items-center">
                                      <span className="text-base font-mono font-bold text-[#006BC4]">{supplier.volume.toLocaleString()}<span className="text-[10px] text-muted-foreground ml-0.5">L</span></span>
                                      <span className="text-[9px] text-muted-foreground/60">Voucher: {supplier.voucher}</span>
                                    </div>
                                  </div>
                                  <div className="h-1 w-full bg-muted mt-auto">
                                     <div className="h-full bg-[#006BC4]" style={{ width: '100%' }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* ─── PRODUCTION TAB ─── */}
              {activeTab === "production" && (
                <div className="space-y-6 overflow-x-hidden no-scrollbar">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-4">
                       <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">Ongoing Plans</h3>
                       {data.productionDetails.slice(0, 3).map((plan, i) => (
                         <Card key={i} className="border-border hover:shadow-md transition-all cursor-pointer overflow-hidden group">
                           <div className="h-1 bg-[#006BC4] w-full" />
                           <div className="text-center py-5 space-y-1">
                             <div className="flex items-center justify-center gap-2 mb-1">
                               <Badge className="bg-[#006BC4]/10 text-[#006BC4] text-[9px] hover:bg-[#006BC4]/20">{plan.production_plan_id}</Badge>
                               <div className="flex items-center gap-1.5">
                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                 <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter">Live</span>
                               </div>
                             </div>
                             <h4 className="text-sm font-bold truncate tracking-tight px-4">{plan.product_name}</h4>
                             <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{plan.plan_name}</p>
                             <div className="pt-2 flex flex-col items-center">
                               <span className="text-base font-mono font-bold">{plan.total_expected_output?.toLocaleString()}<span className="text-[10px] text-muted-foreground ml-0.5">L</span></span>
                               <span className="text-[9px] text-muted-foreground/60">Efficiency: 88%</span>
                             </div>
                             <div className="px-6 pt-3">
                                <Progress value={88} className="h-1" />
                             </div>
                           </div>
                         </Card>
                       ))}
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                      <Card className="border-border">
                        <CardHeader className="border-b bg-muted/20">
                           <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">Shift Performance Breakdown</CardTitle>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => exportToCSV(data.productionDetails, 'shift-performance')}
                                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Export CSV
                                </button>
                                <Badge className="bg-orange-500/10 text-orange-600 border-none">Day Shift</Badge>
                                <Badge className="bg-indigo-500/10 text-indigo-600 border-none">Night Shift</Badge>
                              </div>
                           </div>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto no-scrollbar">
                           <table className="w-full text-sm">
                             <thead>
                               <tr className="bg-muted/10 text-muted-foreground border-b text-xs font-semibold uppercase">
                                 <th className="text-left py-4 px-6">Product</th>
                                 <th className="text-right py-4 px-6">Day Bottles</th>
                                 <th className="text-right py-4 px-6">Day Litres</th>
                                 <th className="text-right py-4 px-6">Night Bottles</th>
                                 <th className="text-right py-4 px-6">Night Litres</th>
                               </tr>
                             </thead>
                             <tbody className="divide-y">
                               {paginate(data.productionDetails, productionPage).map((plan, i) => (
                                 <tr key={i} className="hover:bg-muted/30 transition-colors">
                                   <td className="py-5 px-6">
                                     <div className="flex flex-col">
                                       <span className="font-bold text-foreground">{plan.product_name}</span>
                                       <span className="text-[10px] text-muted-foreground font-mono">{plan.production_plan_id}</span>
                                     </div>
                                   </td>
                                   <td className="text-right py-5 px-6 font-mono text-orange-600 bg-orange-500/5">{plan.total_day_bottles?.toLocaleString() || "--"}</td>
                                   <td className="text-right py-5 px-6 font-mono font-bold text-orange-700 bg-orange-500/5">{plan.total_day_litres?.toLocaleString() || "--"} L</td>
                                   <td className="text-right py-5 px-6 font-mono text-indigo-600 bg-indigo-500/5">{plan.total_night_bottles?.toLocaleString() || "--"}</td>
                                   <td className="text-right py-5 px-6 font-mono font-bold text-indigo-700 bg-indigo-500/5">{plan.total_night_litres?.toLocaleString() || "--"} L</td>
                                 </tr>
                               ))}
                             </tbody>
                           </table>
                        </CardContent>
                        <PaginationControls 
                          totalItems={data.productionDetails.length}
                          currentPage={productionPage}
                          onPageChange={setProductionPage}
                        />
                      </Card>

                      <ComparisonBarChart 
                        title="Bottles Produced by Product"
                        description="Day vs Night shift bottling performance"
                        data={data.productionDetails.map(p => ({
                          name: p.product_name,
                          Day: p.total_day_bottles || 0,
                          Night: p.total_night_bottles || 0
                        }))}
                        index="name"
                        categories={["Day", "Night"]}
                        colors={["#f59e0b", "#6366f1"]}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ─── INTAKE TAB ─── */}
              {activeTab === "intake" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard title="Total Intake" value={totals.intake[period] || 0} unit="L" icon={FlaskConical} color="blue" description={`${TIME_PERIOD_LABELS[period]} processed`} />
                    <KPICard title="Direct Comparison" value="98" unit="%" icon={TrendingUp} color="green" description="Intake vs Collection match" />
                    <KPICard title="Avg Loss" value="0.8" unit="%" icon={Activity} color="red" description="Milk loss during transfer" />
                    <KPICard title="Processing Cost" value="1.2" unit="$/L" icon={Settings2} color="purple" />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="border-border">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Intake Volume Analysis</CardTitle>
                          <CardDescription>Breakdown by truck and compartment</CardDescription>
                        </div>
                        <button 
                          onClick={() => exportToCSV(data.intakeDetails, 'intake-analysis')}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#006BC4] text-white hover:bg-[#005aab] transition-all shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Export
                        </button>
                      </CardHeader>
                      <CardContent className="p-0 overflow-x-auto no-scrollbar">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/30">
                            <tr className="border-b text-xs font-semibold uppercase text-muted-foreground">
                              <th className="text-left py-4 px-6">Truck</th>
                              <th className="text-center py-4 px-6">Cpt</th>
                              <th className="text-right py-4 px-6">Today</th>
                              <th className="text-right py-4 px-6">WTD</th>
                              <th className="text-right py-4 px-6">MTD</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {paginate(data.intakeDetails.filter(d => d.truck !== "TOTAL"), intakePage).map((row, i) => (
                              <tr key={i} className="hover:bg-muted/30 transition-colors">
                                <td className="py-4 px-6 font-bold">{row.truck}</td>
                                <td className="py-4 px-6 text-center"><Badge variant="outline">{row.truck_compartment_number}</Badge></td>
                                <td className="text-right py-4 px-6 font-mono">{row.volume_today?.toLocaleString() || 0}L</td>
                                <td className="text-right py-4 px-6 font-mono text-muted-foreground">{row.volume_wtd?.toLocaleString() || 0}L</td>
                                <td className="text-right py-4 px-6 font-mono font-bold text-[#006BC4]">{row.volume_mtd?.toLocaleString() || 0}L</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </CardContent>
                      <PaginationControls 
                        totalItems={data.intakeDetails.filter(d => d.truck !== "TOTAL").length}
                        currentPage={intakePage}
                        onPageChange={setIntakePage}
                      />
                    </Card>
                    
                    <ComparisonBarChart 
                      title="Intake vs Collection by Truck"
                      description="Verification of collected vs received milk volume"
                      data={data.collectionSummary.filter(c => c.truck_number !== "TOTAL").map(c => {
                         const intake = data.intakeSummary.find(i => i.truck === c.truck_number)
                         return {
                           name: c.truck_number,
                           Collected: c[period],
                           Received: intake ? intake[period] : 0
                         }
                      })}
                      index="name"
                      categories={["Collected", "Received"]}
                      colors={["#3b82f6", "#10b981"]}
                    />
                  </div>
                </div>
              )}

              {/* ─── CIP TAB ─── */}
              {activeTab === "cip" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard title="Completed CIP" value={data.cipData.filter(c => c.status === "Completed").length} unit="Today" icon={CheckCircle2} color="green" />
                    <KPICard title="In Progress" value={data.cipData.filter(c => c.status === "In Progress").length} icon={Activity} color="blue" />
                    <KPICard title="Failed Processes" value={data.cipData.filter(c => c.status === "Failed").length} icon={XCircle} color="red" />
                    <KPICard title="Draft Reports" value={data.cipData.filter(c => c.status === "Draft").length} icon={Clock} color="orange" />
                  </div>

                  <Card className="border-border">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Machine & Silo Cleaning Status</CardTitle>
                        <CardDescription>Current stage and status of all CIP processes</CardDescription>
                      </div>
                      <button 
                        onClick={() => exportToCSV(data.cipData, 'cip-history')}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-all shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export All
                      </button>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 no-scrollbar">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {data.cipData.map((cip, i) => (
                          <div key={i} className={cn(
                            "relative rounded-lg border transition-all hover:shadow-md group overflow-hidden bg-card/30",
                            cip.status === "Completed" ? "border-emerald-100" :
                            cip.status === "In Progress" ? "border-[#006BC4]/20" :
                            cip.status === "Failed" ? "border-red-100" :
                            "border-transparent"
                          )}>
                            <div className="text-center py-5 space-y-1">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                 <RefreshCw className={cn("size-3", cip.status === "In Progress" && "animate-spin text-[#006BC4]")} />
                                 <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{cip.tag}</span>
                                 <Badge className={cn(
                                   "text-[8px] font-bold px-1 py-0 border-none",
                                   cip.status === "Completed" ? "bg-emerald-500 text-white" :
                                   cip.status === "In Progress" ? "bg-[#006BC4] text-white" :
                                   cip.status === "Failed" ? "bg-red-500 text-white" :
                                   "bg-gray-400 text-white"
                                 )}>{cip.status}</Badge>
                              </div>
                              <h4 className="text-sm font-bold truncate tracking-tight px-4">{cip.machine || cip.silo}</h4>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">CIP PROCESS</p>
                              <div className="pt-2 flex flex-col items-center">
                                 <span className="text-base font-mono font-bold text-foreground">Stage: {cip.stage || "N/A"}</span>
                                 <span className="text-[9px] text-muted-foreground/60">{cip.status === "In Progress" ? "Processing..." : "Report finalized"}</span>
                              </div>
                              {cip.status === "In Progress" && (
                                <div className="px-6 pt-3">
                                   <Progress value={65} className="h-1 shadow-none bg-blue-100" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ─── TANKS TAB ─── */}
              {activeTab === "tanks" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Live Silo Status</h3>
                    <button 
                      onClick={() => exportToCSV(data.silos.map(s => ({
                        Name: s.name,
                        Serial: s.serial_number,
                        Status: s.status,
                        Volume: s.milk_volume,
                        Capacity: s.capacity,
                        Fill: `${Math.round((s.milk_volume / s.capacity) * 100)}%`,
                        Location: s.location
                      })), 'silo-status')}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-white hover:bg-muted transition-all shadow-sm"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      Export Inventory
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 no-scrollbar">
                    {data.silos.sort((a,b) => b.milk_volume - a.milk_volume).map((silo, i) => {
                      const fillPercent = Math.max(0, Math.min(100, (silo.milk_volume / silo.capacity) * 100))
                      const isIssue = silo.status === "maintenance" || fillPercent > 90
                      
                      return (
                        <Card key={i} className={cn(
                          "group border-border hover:shadow-xl transition-all duration-500 cursor-pointer rounded-lg overflow-hidden",
                          isIssue && "border-red-500/50 shadow-red-500/10"
                        )}>
                          <div className="relative pt-6 px-5 flex flex-col items-center">
                             <div className="absolute top-4 right-4 group-hover:scale-110 transition-transform">
                                <Badge className={cn(
                                  "text-[9px] px-1.5 py-0 border-none rounded-full",
                                  silo.status === "active" ? "bg-emerald-500/10 text-emerald-600" :
                                  silo.status === "maintenance" ? "bg-red-500/10 text-red-600" :
                                  "bg-muted text-muted-foreground"
                                )}>
                                  {silo.status}
                                </Badge>
                             </div>
                             
                             {/* Tank Visual Styling */}
                             <div className="relative w-24 h-32 bg-muted/30 border-x border-b border-border/50 rounded-b-lg mt-4 group-hover:translate-y-1 transition-transform overflow-hidden shadow-inner">
                               {/* Liquid level */}
                               <motion.div 
                                 initial={{ height: 0 }}
                                 animate={{ height: `${fillPercent}%` }}
                                 transition={{ duration: 1.5, ease: "easeOut" }}
                                 className={cn(
                                   "absolute bottom-0 left-0 right-0 transition-colors duration-500",
                                   fillPercent > 90 ? "bg-gradient-to-t from-red-500 to-red-400" :
                                   fillPercent > 60 ? "bg-gradient-to-t from-[#006BC4]/80 to-[#006BC4]/60" :
                                   "bg-gradient-to-t from-[#006BC4]/60 to-[#006BC4]/40"
                                 )}
                               >
                                 {/* Wave animation effect */}
                                 <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 animate-pulse" />
                               </motion.div>
                               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                 <span className="text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-sm">{Math.round(fillPercent)}%</span>
                               </div>
                             </div>

                             <div className="w-full text-center py-5 space-y-1">
                               <h4 className="text-sm font-bold truncate tracking-tight px-3">{silo.name}</h4>
                               <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{silo.category?.split(' ')[0] || "N/A"}</p>
                               <div className="pt-2 flex flex-col items-center">
                                  <span className="text-base font-mono font-bold text-foreground">{silo.milk_volume.toLocaleString()}<span className="text-[10px] text-muted-foreground ml-0.5">L</span></span>
                                  <span className="text-[9px] text-muted-foreground/60">{silo.location}</span>
                               </div>
                             </div>
                          </div>
                          {isIssue && (
                             <div className="bg-red-500 py-1.5 px-4 text-[9px] text-white font-bold flex items-center justify-center gap-1.5">
                               <AlertCircle className="size-3" />
                               {silo.status === "maintenance" ? "Maintenance Required" : "High Capacity Alert"}
                             </div>
                          )}
                          <div className="absolute inset-0 bg-[#006BC4]/0 group-hover:bg-[#006BC4]/5 transition-colors pointer-events-none" />
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </AdminDashboardLayout>
    </PermissionGuard>
  )
}
