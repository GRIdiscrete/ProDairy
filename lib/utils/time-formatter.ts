/**
 * Utility function to format time display - handles multiple time formats
 * Supports: HH:MM, HH:MM:SS, HH:MM:SS.microseconds, ISO timestamps, space-separated datetimes
 */
export function formatTimeForDisplay(timeString: string | undefined | null): string {
  if (!timeString) return 'N/A'
  
  try {
    // Handle different time formats
    if (timeString.match(/^\d{2}:\d{2}$/)) {
      // Already in HH:MM format
      return timeString
    } else if (timeString.match(/^\d{2}:\d{2}:\d{2}/)) {
      // Handle HH:MM:SS or HH:MM:SS.microseconds format
      return timeString.substring(0, 5) // Extract HH:MM
    } else if (timeString.includes('T')) {
      // ISO timestamp format (2025-01-11T12:58:15.357772)
      return timeString.split('T')[1]?.substring(0, 5) || 'N/A'
    } else if (timeString.includes(' ')) {
      // Space-separated datetime (2025-01-11 12:58:15.357772)
      return timeString.split(' ')[1]?.substring(0, 5) || 'N/A'
    } else {
      // Try to parse as date - fallback
      const date = new Date(timeString)
      if (isNaN(date.getTime())) {
        return timeString // Return original if can't parse
      }
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    }
  } catch (error) {
    return timeString || 'N/A'
  }
}