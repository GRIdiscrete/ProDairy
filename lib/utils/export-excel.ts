import * as XLSX from "xlsx"

export interface ExcelColumn {
  header: string
  key: string
}

export function exportToExcel(columns: ExcelColumn[], data: any[], filename: string) {
  const rows = data.map((row) =>
    columns.reduce<Record<string, any>>((acc, col) => {
      acc[col.header] = row[col.key] ?? ""
      return acc
    }, {})
  )

  const ws = XLSX.utils.json_to_sheet(rows, { header: columns.map((c) => c.header) })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
  XLSX.writeFile(wb, `${filename}.xlsx`)
}
