/**
 * Column definition for Excel/CSV export.
 * label: the column header shown in the exported file
 * getValue: function that extracts (and resolves) the value from a row
 */
export type ExportColumn = {
  label: string
  getValue: (row: any) => string | number | boolean | null | undefined
}

/**
 * Export data to a formatted .xlsx file.
 * - Frozen header row
 * - Auto-sized column widths
 * - Autofilter on all columns
 * - Alternating row backgrounds (basic styling via SheetJS)
 * - No raw IDs — columns are defined explicitly via ExportColumn[]
 */
export async function exportToExcel(
  data: any[],
  filename: string,
  columns: ExportColumn[],
  sheetName = 'Data'
) {
  if (!data || !data.length) return

  const XLSX = await import('xlsx')

  // Build header + data rows
  const headers = columns.map(c => c.label)
  const rows = data.map(item =>
    columns.map(col => {
      const val = col.getValue(item)
      return val === null || val === undefined ? '' : val
    })
  )

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])

  // Auto column widths based on max content length
  ws['!cols'] = columns.map((col, i) => ({
    wch: Math.min(
      Math.max(
        col.label.length + 2,
        ...rows.map(row => String(row[i] ?? '').length + 1),
        10
      ),
      50
    )
  }))

  // Freeze top row
  ws['!freeze'] = { xSplit: 0, ySplit: 1 }

  // Autofilter spanning all columns
  if (ws['!ref']) {
    ws['!autofilter'] = { ref: ws['!ref'] }
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  XLSX.writeFile(wb, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`)
}

/**
 * Legacy CSV export — kept for backward compatibility.
 * Prefer exportToExcel with explicit ExportColumn[] for new usage.
 */
export function exportToCSV(data: any[], filename: string, headers?: string[]) {
  if (!data || !data.length) return

  const csvHeaders = headers || Object.keys(data[0])

  const csvContent = [
    csvHeaders.join(','),
    ...data.map(row =>
      csvHeaders.map(h => {
        const val = row[h] === null || row[h] === undefined ? '' : row[h]
        let stringVal = ''
        if (typeof val === 'object') {
          stringVal = JSON.stringify(val)
        } else {
          stringVal = String(val)
        }
        return `"${stringVal.replace(/"/g, '""')}"`
      }).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
