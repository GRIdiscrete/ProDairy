/**
 * Form ID Generator Utility
 * Generates formatted form IDs in the pattern: featureInitial-dayNumber-MMDDYY
 */

export interface FormIdConfig {
  featureInitial: string
  createdAt: string | Date
}

/**
 * Get the day of the week as a number (1 = Monday, 7 = Sunday)
 */
function getDayOfWeekNumber(date: Date): number {
  const dayOfWeek = date.getDay()
  // Convert Sunday (0) to 7, and Monday (1) stays 1, etc.
  return dayOfWeek === 0 ? 7 : dayOfWeek
}

/**
 * Format date as MMDDYY
 */
function formatDateShort(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const year = String(date.getFullYear()).slice(-2)
  return `${month}${day}${year}`
}

/**
 * Generate a formatted form ID
 * @param config - Configuration object containing feature initial and created date
 * @returns Formatted form ID (e.g., "driverform-1-100625")
 */
export function generateFormId(config: FormIdConfig): string {
  const { featureInitial, createdAt } = config
  
  const date = new Date(createdAt)
  const dayNumber = getDayOfWeekNumber(date)
  const formattedDate = formatDateShort(date)
  
  // Safe fallback for undefined featureInitial
  const safeFeatureInitial = (featureInitial && typeof featureInitial === "string" && featureInitial.length > 0)
    ? featureInitial
    : "x";
  
  return `${safeFeatureInitial.toLowerCase()}-${dayNumber}-${formattedDate}`
}

/**
 * Generate form ID for driver forms
 */
export function generateDriverFormId(createdAt: string | Date): string {
  return generateFormId({
    featureInitial: 'driverform',
    createdAt
  })
}

/**
 * Generate form ID for any form type with custom initial
 */
export function generateCustomFormId(featureInitial: string, createdAt: string | Date): string {
  return generateFormId({
    featureInitial,
    createdAt
  })
}

/**
 * Generate form ID for BMT control forms
 */
export function generateBMTFormId(createdAt: string | Date): string {
  return generateFormId({
    featureInitial: 'bmtform',
    createdAt
  })
}

/**
 * Generate form ID for raw milk intake forms
 */
export function generateRawMilkIntakeFormId(createdAt: string | Date): string {
  return generateFormId({
    featureInitial: 'rawmilkform',
    createdAt
  })
}

/**
 * Generate form ID for standardizing forms
 */

//update this function to use the new ID format
export const generateStandardizingFormId = (createdAt: string): string => {
  return generateFormId({
    featureInitial: 'standardizingform',
    createdAt
  })
}

/**
 * Generate form ID for BMT forms
 */

/**
 * Generate form ID for skimming forms
 */

//update this function to use the new ID format
export const generateSkimmingFormId = (createdAt: string): string => {
  return generateFormId({
    featureInitial:"skim",
    createdAt
  })
}
