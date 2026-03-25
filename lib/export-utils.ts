/**
 * Reusable utility for exporting data to CSV format and triggering a browser download.
 * 
 * @param data Array of objects containing the data to export
 * @param filename Name of the downloaded file (without extension)
 * @param headers Optional array of strings for column headers. If not provided, keys from the first data object are used.
 */
export function exportToCSV(data: any[], filename: string, headers?: string[]) {
  if (!data || !data.length) return

  // Get headers from the first object if not provided
  const csvHeaders = headers || Object.keys(data[0])
  
  // Format the CSV content
  const csvContent = [
    // Header row
    csvHeaders.join(','),
    // Data rows
    ...data.map(row => 
      csvHeaders.map(h => {
        // Handle null/undefined values
        const val = row[h] === null || row[h] === undefined ? "" : row[h]
        
        // Handle case where value might be an object or array (e.g. nested data)
        let stringVal = ""
        if (typeof val === 'object') {
          stringVal = JSON.stringify(val)
        } else {
          stringVal = String(val)
        }
        
        // Escape quotes and wrap in quotes to handle commas within values
        return `"${stringVal.replace(/"/g, '""')}"`
      }).join(',')
    )
  ].join('\n')

  // Create a blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
  
  // Append to body, click, and cleanup
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
