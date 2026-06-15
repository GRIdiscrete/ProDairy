"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useParams } from "next/navigation"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { fetchFilmaticLinesForm1s } from "@/lib/store/slices/filmaticLinesForm1Slice"
import { fetchFilmaticLinesForm2s } from "@/lib/store/slices/filmaticLinesForm2Slice"
import { fetchSteriMilkProcessLogs } from "@/lib/store/slices/steriMilkProcessLogSlice"
import { filmaticLinesForm1Api } from "@/lib/api/filmatic-lines-form-1"
import { apiRequest } from "@/lib/utils/api-request"
import { toast } from "sonner"
import { FileSpreadsheet, Download } from "lucide-react"
import { FilmaticLinesForm1ViewDrawer } from "@/components/forms/filmatic-lines-form-1-view-drawer"
import { exportToExcel } from "@/lib/utils/export-excel"

export default function SteriRecordsPage() {
  const params = useParams()
  const dispatch = useAppDispatch()

  const { forms: form1s, loading: form1Loading, isInitialized: form1Init } =
    useAppSelector((s) => s.filmaticLinesForm1)
  const { logs: processLogs, loading: logLoading, isInitialized: logInit } =
    useAppSelector((s) => s.steriMilkProcessLog)
  const { forms: form2s, loading: form2Loading, isInitialized: form2Init } =
    useAppSelector((s) => s.filmaticLinesForm2)

  const form1Ref = useRef(false)
  const logRef = useRef(false)
  const form2Ref = useRef(false)

  const [flatRows, setFlatRows] = useState<any[]>([])
  const [flatLoading, setFlatLoading] = useState(false)
  const palletiserRef = useRef(false)

  const [selectedForm1, setSelectedForm1] = useState<any | null>(null)
  const [form1ViewOpen, setForm1ViewOpen] = useState(false)

  useEffect(() => {
    if (!form1Init && !form1Ref.current) {
      form1Ref.current = true
      dispatch(fetchFilmaticLinesForm1s())
    }
    if (!logInit && !logRef.current) {
      logRef.current = true
      dispatch(fetchSteriMilkProcessLogs({}))
    }
    if (!form2Init && !form2Ref.current) {
      form2Ref.current = true
      dispatch(fetchFilmaticLinesForm2s())
    }
  }, [dispatch, form1Init, logInit, form2Init])

  const handlePalletiserTabOpen = () => {
    if (palletiserRef.current) return
    palletiserRef.current = true
    setFlatLoading(true)
    apiRequest<{ statusCode: number; data: any[] }>("/palletiser-sheet/table")
      .then((res) => setFlatRows(res?.data ?? []))
      .catch(() => toast.error("Failed to load palletiser data"))
      .finally(() => setFlatLoading(false))
  }

  // ── Combined Steri rows (Before + After) ───────────────────────────────────
  const steriRows = useMemo(() => {
    const rows: any[] = []

    // Steri Before Autoclave — stage: "Before"
    if (Array.isArray(form1s)) {
      form1s.forEach((form: any) => {
        const pushRow = (isDay: boolean) => {
          const shift = isDay ? form.day_shift_id : form.night_shift_id
          if (!shift?.shift_details) return
          const d = shift.shift_details
          const st = d.stoppage_time_id
          rows.push({
            stage: "Before",
            _formId: form.id,
            _updatedAt: form.updated_at,
            _createdAt: form.created_at,
            date: form.date ? new Date(form.date).toLocaleDateString("en-GB") : "—",
            tag: form.tag,
            shift: isDay ? "Day" : "Night",
            time: d.time ?? "—",
            pallets: d.pallets,
            target: d.target,
            variance: d.pallets != null && d.target != null ? d.pallets - d.target : null,
            setbacks: d.setbacks,
            product_1: st?.product_1,
            product_2: st?.product_2,
            filler_1: st?.filler_1,
            filler_2: st?.filler_2,
            capper_1: null, capper_2: null,
            sleever_1: null, sleever_2: null,
            shrink_1: null, shrink_2: null,
            opening: isDay ? form.day_shift_opening_bottles : form.night_shift_opening_bottles,
            received: isDay ? form.day_shift_received_bottles : form.night_shift_received_bottles,
            foiled: isDay ? form.day_shift_foiled_bottles : form.night_shift_foiled_bottles,
            closing: isDay ? form.day_shift_closing_bottles : form.night_shift_closing_bottles,
            waste: isDay ? form.day_shift_waste_bottles : form.night_shift_waste_bottles,
            damaged: isDay ? form.day_shift_damaged_bottles : form.night_shift_damaged_bottles,
            transferrable_milk: form.transferrable_milk,
            shiftType: isDay ? "day" : "night",
          })
        }
        pushRow(true)
        pushRow(false)
      })
    }

    // Steri After Autoclave — stage: "After"
    if (Array.isArray(form2s)) {
      form2s.forEach((form: any) => {
        const pushDetails = (isDay: boolean) => {
          const shift = isDay ? form.day_shift_id : form.night_shift_id
          shift?.shift_details?.forEach((detail: any, i: number) => {
            const st = detail.stoppage_time?.[0]
            rows.push({
              stage: "After",
              _formId: form.id,
              _updatedAt: form.updated_at,
              _createdAt: form.created_at,
              date: form.date ? new Date(form.date).toLocaleDateString("en-GB") : "—",
              tag: form.tag,
              shift: isDay ? "Day" : "Night",
              time: detail.time ?? "—",
              pallets: detail.pallets,
              target: detail.target,
              variance:
                detail.pallets != null && detail.target != null
                  ? detail.pallets - detail.target
                  : null,
              setbacks: detail.setbacks,
              product_1: null, product_2: null,
              filler_1: null, filler_2: null,
              capper_1: st?.capper_1,
              capper_2: st?.capper_2,
              sleever_1: st?.sleever_1,
              sleever_2: st?.sleever_2,
              shrink_1: st?.shrink_1,
              shrink_2: st?.shrink_2,
              opening: i === 0 ? (isDay ? form.day_shift_opening_bottles : form.night_shift_opening_bottles) : null,
              received: null,
              foiled: null,
              closing: i === 0 ? (isDay ? form.day_shift_closing_bottles : form.night_shift_closing_bottles) : null,
              waste: i === 0 ? (isDay ? form.day_shift_waste_bottles : form.night_shift_waste_bottles) : null,
              damaged: null,
              transferrable_milk: null,
              shiftType: isDay ? "day" : "night",
            })
          })
        }
        pushDetails(true)
        pushDetails(false)
      })
    }

    // Merge Before + After rows that share the same date + shift
    const map = new Map<string, any>()
    rows.forEach((row) => {
      const key = `${row.date}__${row.shift}`
      if (!map.has(key)) {
        map.set(key, { ...row })
      } else {
        const merged = map.get(key)!
        Object.keys(row).forEach((k) => {
          if (merged[k] == null && row[k] != null) merged[k] = row[k]
        })
      }
    })

    // Sort by date (DD/MM/YYYY) then Day before Night
    const parseDate = (d: string) => {
      const [day, month, year] = (d ?? "").split("/")
      return new Date(+year, +month - 1, +day).getTime() || 0
    }
    const sorted = Array.from(map.values()).sort((a, b) => {
      const diff = parseDate(b.date) - parseDate(a.date)
      return diff !== 0 ? diff : (a.shift === "Day" ? -1 : 1)
    })

    // Annotate date rowspan so same-date rows share one merged Date cell
    sorted.forEach((row, i) => {
      const isNewDate = i === 0 || sorted[i - 1].date !== row.date
      if (isNewDate) {
        let span = 1
        while (i + span < sorted.length && sorted[i + span].date === row.date) span++
        row.dateSpan = span
        row.showDate = true
      } else {
        row.showDate = false
      }
    })

    return sorted
  }, [form1s, form2s])

  // ── Autoclave sheet rows (flat API structure) ──────────────────────────────
  const sheetRows2 = useMemo(() => {
    if (!Array.isArray(processLogs)) return []
    const fmtTime = (v: string | null | undefined) =>
      v ? v.replace(/\+.*$/, "").substring(0, 5) : "—"
    const fmtNum = (v: number | undefined | null) =>
      v != null && v !== 0 ? String(v) : "—"
    const sorted = [...processLogs].sort((a: any, b: any) => {
      const da = a.batch?.date ?? a.created_at
      const db = b.batch?.date ?? b.created_at
      return new Date(da).getTime() - new Date(db).getTime()
    })
    const rows: any[] = []
    sorted.forEach((log: any) => {
      const b = log.batch
      const rawDate = b?.date ?? log.created_at
      const date = rawDate ? new Date(rawDate).toLocaleDateString("en-GB") : "—"
      const label = b?.batch_number ?? "—"
      rows.push({ rowType: "time",        date, batchLabel: label, autoclave: log.autoclave?.name, filling_start: fmtTime(b?.filling_start?.time),        autoclave_start: fmtTime(b?.autoclave_start?.time),        heating_start: fmtTime(b?.heating_start?.time),        heating_finish: fmtTime(b?.heating_finish?.time),        steri_start: fmtTime(b?.sterilization_start?.time),        steri_after5: fmtTime(b?.sterilization_after_5?.time),        steri_finish: fmtTime(b?.sterilization_finish?.time),        pre_cool_start: fmtTime(b?.pre_cooling_start?.time),        pre_cool_finish: fmtTime(b?.pre_cooling_finish?.time),        cool1_start: fmtTime(b?.cooling_1_start?.time),        cool1_finish: fmtTime(b?.cooling_1_finish?.time),        cool2_start: fmtTime(b?.cooling_2_start?.time),        cool2_finish: fmtTime(b?.cooling_2_finish?.time) })
      rows.push({ rowType: "temperature", date, batchLabel: label, filling_start: fmtNum(b?.filling_start?.temperature),  autoclave_start: fmtNum(b?.autoclave_start?.temperature),  heating_start: fmtNum(b?.heating_start?.temperature),  heating_finish: fmtNum(b?.heating_finish?.temperature),  steri_start: fmtNum(b?.sterilization_start?.temperature),  steri_after5: fmtNum(b?.sterilization_after_5?.temperature),  steri_finish: fmtNum(b?.sterilization_finish?.temperature),  pre_cool_start: fmtNum(b?.pre_cooling_start?.temperature),  pre_cool_finish: fmtNum(b?.pre_cooling_finish?.temperature),  cool1_start: fmtNum(b?.cooling_1_start?.temperature),  cool1_finish: fmtNum(b?.cooling_1_finish?.temperature),  cool2_start: fmtNum(b?.cooling_2_start?.temperature),  cool2_finish: fmtNum(b?.cooling_2_finish?.temperature) })
      rows.push({ rowType: "pressure",    date, batchLabel: label, filling_start: fmtNum(b?.filling_start?.pressure),     autoclave_start: fmtNum(b?.autoclave_start?.pressure),     heating_start: fmtNum(b?.heating_start?.pressure),     heating_finish: fmtNum(b?.heating_finish?.pressure),     steri_start: fmtNum(b?.sterilization_start?.pressure),     steri_after5: fmtNum(b?.sterilization_after_5?.pressure),     steri_finish: fmtNum(b?.sterilization_finish?.pressure),     pre_cool_start: fmtNum(b?.pre_cooling_start?.pressure),     pre_cool_finish: fmtNum(b?.pre_cooling_finish?.pressure),     cool1_start: fmtNum(b?.cooling_1_start?.pressure),     cool1_finish: fmtNum(b?.cooling_1_finish?.pressure),     cool2_start: fmtNum(b?.cooling_2_start?.pressure),     cool2_finish: fmtNum(b?.cooling_2_finish?.pressure) })
    })
    return rows
  }, [processLogs])

  // ── Palletizer sheet rows ───────────────────────────────────────────────────
  const sheetRows4 = useMemo(() => {
    const map = new Map<string, any>()
    flatRows.forEach((row) => {
      const key = `${row.tag}__${row.pallet_number}`
      if (!map.has(key)) {
        map.set(key, {
          date: row.created_at ? new Date(row.created_at).toLocaleDateString("en-GB") : "—",
          tag: row.tag,
          batch: row.batch_number,
          product: row.product_type,
          machine: row.machine_name ?? "—",
          mfg: row.manufacturing_date,
          exp: row.expiry_date,
          pallet: row.pallet_number,
          cases: row.cases_packed,
          serial: row.pallet_serial_number,
          counter: row.counter_name ?? "—",
          start_time: null,
          end_time: null,
        })
      }
      const entry = map.get(key)!
      if (row.time_type === "start_time") entry.start_time = row.time
      if (row.time_type === "end_time") entry.end_time = row.time
    })
    return Array.from(map.values())
  }, [flatRows])

  const tdBase = "px-2 py-1.5 border-b border-r border-gray-100 whitespace-nowrap"
  const thBase = "px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 border-b border-r border-gray-200 whitespace-nowrap"

  const steriLoading = form1Loading?.fetch || form2Loading?.fetch

  return (
    <DataCaptureDashboardLayout
      title="Steri Records"
      subtitle="Combined sheet view for all steri production stages"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-light text-foreground">Steri Records</h1>
          <p className="text-sm font-light text-muted-foreground">
            Sheet view for Filmatic Lines (Before &amp; After Autoclave), Autoclave, and Palletizer
          </p>
        </div>

        <Tabs defaultValue="steri">
          <TabsList className="bg-gray-100 p-1 rounded-lg h-auto flex-wrap gap-0.5">
            <TabsTrigger value="steri" className="rounded-md text-xs font-medium">
              Steri Records
            </TabsTrigger>
            <TabsTrigger value="autoclave" className="rounded-md text-xs font-medium">
              Autoclave
            </TabsTrigger>
            <TabsTrigger
              value="palletizer"
              className="rounded-md text-xs font-medium"
              onClick={handlePalletiserTabOpen}
            >
              Palletizer
            </TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Steri (Before + After combined) ────────────────────── */}
          <TabsContent value="steri" className="mt-4">
            <div className="border border-gray-200 rounded-lg bg-white">
              <div className="p-4 pb-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-light text-gray-700">Steri Records — Before &amp; After Autoclave</span>
                </div>
                {steriRows.length > 0 && (
                  <button
                    onClick={() => exportToExcel(
                      [
                        { header: "Date", key: "date" },
                        { header: "Tag", key: "tag" },
                        { header: "Shift", key: "shift" },
                        { header: "Time", key: "time" },
                        { header: "Pallets", key: "pallets" },
                        { header: "Target", key: "target" },
                        { header: "Variance", key: "variance" },
                        { header: "Reason", key: "setbacks" },
                        { header: "Prod 1", key: "product_1" },
                        { header: "Prod 2", key: "product_2" },
                        { header: "Filler 1", key: "filler_1" },
                        { header: "Filler 2", key: "filler_2" },
                        { header: "Capper 1", key: "capper_1" },
                        { header: "Capper 2", key: "capper_2" },
                        { header: "Sleever 1", key: "sleever_1" },
                        { header: "Sleever 2", key: "sleever_2" },
                        { header: "Shrink 1", key: "shrink_1" },
                        { header: "Shrink 2", key: "shrink_2" },
                        { header: "Opening", key: "opening" },
                        { header: "Received", key: "received" },
                        { header: "Foiled", key: "foiled" },
                        { header: "Closing", key: "closing" },
                        { header: "Waste", key: "waste" },
                        { header: "Damaged", key: "damaged" },
                        { header: "Milk Transfer", key: "transferrable_milk" },
                      ],
                      steriRows,
                      "steri-records"
                    )}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Excel
                  </button>
                )}
              </div>
              <div className="p-4">
                {steriLoading ? (
                  <div className="flex items-center justify-center py-12 text-gray-400">
                    <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mr-2" />
                    Loading…
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-gray-50">
                          {[
                            "Date", "Tag", "Shift", "Time",
                            "Pallets", "Target", "Var", "Reason",
                            "Prod 1", "Prod 2",
                            "Filler 1", "Filler 2",
                            "Capper 1", "Capper 2",
                            "Sleever 1", "Sleever 2",
                            "Shrink 1", "Shrink 2",
                            "Opening", "Received", "Foiled",
                            "Closing", "Waste", "Damaged", "Milk Transfer",
                          ].map((h) => (
                            <th key={h} className={thBase}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {steriRows.length === 0 ? (
                          <tr>
                            <td colSpan={25} className="px-4 py-8 text-center text-gray-400 italic">
                              No data
                            </td>
                          </tr>
                        ) : (
                          steriRows.map((row, i) => {
                            const wasUpdated = row._updatedAt && row._createdAt && row._updatedAt !== row._createdAt
                            return (
                            <tr
                              key={i}
                              className={
                                wasUpdated
                                  ? "bg-amber-50 hover:bg-amber-100/80 ring-1 ring-inset ring-amber-200"
                                  : row.shiftType === "day"
                                  ? "bg-yellow-50/40 hover:bg-yellow-50/70"
                                  : "bg-blue-50/40 hover:bg-blue-50/70"
                              }
                              onClick={row.stage === "Before" ? async () => {
                                const match = form1s.find((f: any) => f.tag === row.tag)
                                if (!match) return
                                if (match.id) {
                                  try {
                                    const res = await filmaticLinesForm1Api.getForm(match.id)
                                    const raw: any = (res as any)?.data ?? res
                                    const detail: any = Array.isArray(raw) ? raw[0] : raw
                                    const nonNullDetail = Object.fromEntries(Object.entries(detail ?? {}).filter(([, v]) => v != null))
                                    setSelectedForm1({ ...match, ...nonNullDetail })
                                  } catch {
                                    setSelectedForm1(match)
                                  }
                                } else {
                                  setSelectedForm1(match)
                                }
                                setForm1ViewOpen(true)
                              } : undefined}
                              style={row.stage === "Before" ? { cursor: "pointer" } : undefined}
                            >
                              {/* Date — merged cell spanning all rows for the same date */}
                              {row.showDate && (
                                <td rowSpan={row.dateSpan} className={`${tdBase} align-middle font-medium`}>{row.date}</td>
                              )}
                              <td className={`${tdBase} font-mono text-[10px]`}>{row.tag}</td>
                              <td className={tdBase}>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                    row.shiftType === "day"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {row.shift}
                                </span>
                              </td>
                              <td className={tdBase}>{row.time}</td>

                              {/* Pallets, Target, Variance, Reason */}
                              <td className="px-2 py-1.5 border-b border-r border-gray-100 text-center">{row.pallets ?? "—"}</td>
                              <td className="px-2 py-1.5 border-b border-r border-gray-100 text-center">{row.target ?? "—"}</td>
                              <td
                                className={`px-2 py-1.5 border-b border-r border-gray-100 text-center font-medium ${
                                  row.variance != null && row.variance < 0
                                    ? "text-red-600"
                                    : row.variance != null && row.variance > 0
                                    ? "text-green-600"
                                    : ""
                                }`}
                              >
                                {row.variance ?? "—"}
                              </td>
                              <td
                                className="px-2 py-1.5 border-b border-r border-gray-100 max-w-[160px] truncate"
                                title={row.setbacks}
                              >
                                {row.setbacks || "—"}
                              </td>

                              {/* Prod 1 & 2 (Before only) */}
                              <td className="px-2 py-1.5 border-b border-r border-gray-100 text-center">{row.product_1 ?? "—"}</td>
                              <td className="px-2 py-1.5 border-b border-r border-gray-100 text-center">{row.product_2 ?? "—"}</td>

                              {/* Before-only: Filler 1, Filler 2 */}
                              <td className="px-2 py-1.5 border-b border-r border-gray-100 text-center">{row.filler_1 ?? "—"}</td>
                              <td className="px-2 py-1.5 border-b border-r border-gray-100 text-center">{row.filler_2 ?? "—"}</td>

                              {/* After-only: Capper, Sleever, Shrink */}
                              <td className="px-2 py-1.5 border-b border-r border-gray-100 text-center">{row.capper_1 ?? "—"}</td>
                              <td className="px-2 py-1.5 border-b border-r border-gray-100 text-center">{row.capper_2 ?? "—"}</td>
                              <td className="px-2 py-1.5 border-b border-r border-gray-100 text-center">{row.sleever_1 ?? "—"}</td>
                              <td className="px-2 py-1.5 border-b border-r border-gray-100 text-center">{row.sleever_2 ?? "—"}</td>
                              <td className="px-2 py-1.5 border-b border-r border-gray-100 text-center">{row.shrink_1 ?? "—"}</td>
                              <td className="px-2 py-1.5 border-b border-r border-gray-100 text-center">{row.shrink_2 ?? "—"}</td>

                              {/* Bottle counts */}
                              <td className="px-2 py-1.5 border-b border-r border-gray-100 text-right tabular-nums">{row.opening?.toLocaleString() ?? "—"}</td>
                              <td className="px-2 py-1.5 border-b border-r border-gray-100 text-right tabular-nums">{row.received?.toLocaleString() ?? "—"}</td>
                              <td className="px-2 py-1.5 border-b border-r border-gray-100 text-right tabular-nums">{row.foiled?.toLocaleString() ?? "—"}</td>
                              <td className="px-2 py-1.5 border-b border-r border-gray-100 text-right tabular-nums">{row.closing?.toLocaleString() ?? "—"}</td>
                              <td className="px-2 py-1.5 border-b border-r border-gray-100 text-right tabular-nums text-red-600">{row.waste?.toLocaleString() ?? "—"}</td>
                              <td className="px-2 py-1.5 border-b border-r border-gray-100 text-right tabular-nums text-orange-600">{row.damaged?.toLocaleString() ?? "—"}</td>
                              <td className="px-2 py-1.5 border-b border-r border-gray-100 text-right tabular-nums text-blue-600 font-medium">{row.transferrable_milk?.toLocaleString() ?? "—"}</td>
                            </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── Tab 2: Autoclave ──────────────────────────────────────────── */}
          <TabsContent value="autoclave" className="mt-4">
            <div className="border border-gray-200 rounded-lg bg-white">
              <div className="p-4 pb-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-light text-gray-700">Autoclave</span>
                </div>
                {sheetRows2.length > 0 && (
                  <button
                    onClick={() => exportToExcel(
                      [
                        { header: "Date", key: "date" },
                        { header: "Batch", key: "batchLabel" },
                        { header: "Metric", key: "rowType" },
                        { header: "Autoclave", key: "autoclave" },
                        { header: "Fill Start", key: "filling_start" },
                        { header: "AC Start", key: "autoclave_start" },
                        { header: "Heating Start", key: "heating_start" },
                        { header: "Heating Finish", key: "heating_finish" },
                        { header: "Steri Start", key: "steri_start" },
                        { header: "Steri After 5", key: "steri_after5" },
                        { header: "Steri Finish", key: "steri_finish" },
                        { header: "Pre-Cool Start", key: "pre_cool_start" },
                        { header: "Pre-Cool Finish", key: "pre_cool_finish" },
                        { header: "Cool 1 Start", key: "cool1_start" },
                        { header: "Cool 1 Finish", key: "cool1_finish" },
                        { header: "Cool 2 Start", key: "cool2_start" },
                        { header: "Cool 2 Finish", key: "cool2_finish" },
                      ],
                      sheetRows2,
                      "autoclave-records"
                    )}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Excel
                  </button>
                )}
              </div>
              <div className="p-4">
                {logLoading?.fetch ? (
                  <div className="flex items-center justify-center py-12 text-gray-400">
                    <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mr-2" />
                    Loading…
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-gray-50">
                          <th rowSpan={2} className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 border-b border-r border-gray-200 whitespace-nowrap align-bottom">Date</th>
                          <th rowSpan={2} className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 border-b border-r border-gray-200 whitespace-nowrap align-bottom">Batch</th>
                          <th rowSpan={2} className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 border-b border-r border-gray-200 whitespace-nowrap align-bottom">Metric</th>
                          <th rowSpan={2} className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 border-b border-r border-gray-200 whitespace-nowrap align-bottom">Autoclave</th>
                          <th rowSpan={2} className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 border-b border-r border-gray-200 whitespace-nowrap align-bottom">Fill Start</th>
                          <th rowSpan={2} className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 border-b border-r border-gray-200 whitespace-nowrap align-bottom">AC Start</th>
                          <th colSpan={2} className="px-2 py-2 text-[10px] font-semibold uppercase text-center text-gray-500 border-b border-r border-gray-200">Heating</th>
                          <th colSpan={3} className="px-2 py-2 text-[10px] font-semibold uppercase text-center text-gray-500 border-b border-r border-gray-200">Sterilisation</th>
                          <th colSpan={2} className="px-2 py-2 text-[10px] font-semibold uppercase text-center text-gray-500 border-b border-r border-gray-200">Pre-Cooling</th>
                          <th colSpan={2} className="px-2 py-2 text-[10px] font-semibold uppercase text-center text-gray-500 border-b border-r border-gray-200">Cooling 1</th>
                          <th colSpan={2} className="px-2 py-2 text-[10px] font-semibold uppercase text-center text-gray-500 border-b border-r border-gray-200">Cooling 2</th>
                        </tr>
                        <tr className="bg-gray-50">
                          {["Start","Finish","Start","After 5","Finish","Start","Finish","Start","Finish","Start","Finish"].map((h, i) => (
                            <th key={i} className="px-2 py-1.5 border-b border-r border-gray-200 text-gray-400 text-[10px] whitespace-nowrap text-center">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sheetRows2.length === 0 ? (
                          <tr>
                            <td colSpan={17} className="px-4 py-8 text-center text-gray-400 italic">No data</td>
                          </tr>
                        ) : (
                          sheetRows2.map((row, i) => (
                            <tr key={i} className={
                              row.rowType === "temperature" ? "bg-orange-50/50" :
                              row.rowType === "pressure" ? "bg-blue-50/50" :
                              "bg-white hover:bg-gray-50/50"
                            }>
                              {row.rowType === "time" && (
                                <td rowSpan={3} className="px-2 py-1.5 border-b border-r border-gray-100 align-middle font-medium whitespace-nowrap">{row.date}</td>
                              )}
                              <td className="px-2 py-1.5 border-b border-r border-gray-100 font-medium whitespace-nowrap">
                                {row.rowType === "time" ? `#${row.batchLabel}` : ""}
                              </td>
                              <td className="px-2 py-1.5 border-b border-r border-gray-100 whitespace-nowrap">
                                {row.rowType === "time" ? (
                                  <span className="text-gray-400 text-[10px]">Time</span>
                                ) : row.rowType === "temperature" ? (
                                  <span className="text-orange-600 font-medium">Temp °C</span>
                                ) : (
                                  <span className="text-blue-600 font-medium">Press Bar</span>
                                )}
                              </td>
                              <td className="px-2 py-1.5 border-b border-r border-gray-100 text-gray-500 text-[10px]">
                                {row.rowType === "time" ? row.autoclave : ""}
                              </td>
                              {["filling_start","autoclave_start","heating_start","heating_finish","steri_start","steri_after5","steri_finish","pre_cool_start","pre_cool_finish","cool1_start","cool1_finish","cool2_start","cool2_finish"].map((key) => (
                                <td key={key} className="px-2 py-1.5 border-b border-r border-gray-100 text-center tabular-nums whitespace-nowrap">
                                  {(row as any)[key]}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── Tab 3: Palletizer ─────────────────────────────────────────── */}
          <TabsContent value="palletizer" className="mt-4">
            <div className="border border-gray-200 rounded-lg bg-white">
              <div className="p-4 pb-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-light text-gray-700">Palletizer</span>
                </div>
                {sheetRows4.length > 0 && (
                  <button
                    onClick={() => exportToExcel(
                      [
                        { header: "Date", key: "date" },
                        { header: "Tag", key: "tag" },
                        { header: "Batch", key: "batch" },
                        { header: "Product", key: "product" },
                        { header: "Machine", key: "machine" },
                        { header: "Mfg Date", key: "mfg" },
                        { header: "Exp Date", key: "exp" },
                        { header: "Pallet #", key: "pallet" },
                        { header: "Start Time", key: "start_time" },
                        { header: "End Time", key: "end_time" },
                        { header: "Cases Packed", key: "cases" },
                        { header: "Serial No.", key: "serial" },
                        { header: "Counter", key: "counter" },
                      ],
                      sheetRows4,
                      "palletizer-records"
                    )}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Excel
                  </button>
                )}
              </div>
              <div className="p-4">
                {flatLoading ? (
                  <div className="flex items-center justify-center py-12 text-gray-400">
                    <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mr-2" />
                    Loading…
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-gray-50">
                          {[
                            "Date","Tag","Batch","Product","Machine",
                            "Mfg Date","Exp Date","Pallet #",
                            "Start Time","End Time","Cases Packed","Serial No.","Counter (Shift Leader)",
                          ].map((h) => (
                            <th key={h} className={thBase}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sheetRows4.length === 0 ? (
                          <tr>
                            <td colSpan={13} className="px-4 py-8 text-center text-gray-400 italic">No data</td>
                          </tr>
                        ) : (
                          sheetRows4.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50/50 even:bg-gray-50/20">
                              <td className={tdBase}>{row.date ?? "—"}</td>
                              <td className={`${tdBase} font-mono text-[10px]`}>{row.tag ?? "—"}</td>
                              <td className="px-2 py-1.5 border-b border-r border-gray-100 text-center">{row.batch}</td>
                              <td className="px-2 py-1.5 border-b border-r border-gray-100">{row.product}</td>
                              <td className={tdBase}>{row.machine}</td>
                              <td className={tdBase}>{row.mfg}</td>
                              <td className={tdBase}>{row.exp}</td>
                              <td className="px-2 py-1.5 border-b border-r border-gray-100 text-center font-medium">{row.pallet}</td>
                              <td className="px-2 py-1.5 border-b border-r border-gray-100 whitespace-nowrap tabular-nums">{row.start_time ?? "—"}</td>
                              <td className="px-2 py-1.5 border-b border-r border-gray-100 whitespace-nowrap tabular-nums">{row.end_time ?? "—"}</td>
                              <td className="px-2 py-1.5 border-b border-r border-gray-100 text-center font-medium text-blue-700">{row.cases}</td>
                              <td className={`${tdBase} font-mono text-[10px]`}>{row.serial}</td>
                              <td className="px-2 py-1.5 border-b border-r border-gray-100">{row.counter}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <FilmaticLinesForm1ViewDrawer
        open={form1ViewOpen}
        onOpenChange={setForm1ViewOpen}
        form={selectedForm1}
      />
    </DataCaptureDashboardLayout>
  )
}
