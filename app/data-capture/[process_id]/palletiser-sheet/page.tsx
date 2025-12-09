"use client"

import { useParams } from "next/navigation"
import PalletiserSheetPage from "@/app/data-capture/palletiser-sheet/page"

export default function ProcessPalletiserSheetPage() {
  const params = useParams()
  const processId = params.process_id as string
  
  // Pass the process ID as productType to the main component
  return <PalletiserSheetPage processId={processId} />
}


