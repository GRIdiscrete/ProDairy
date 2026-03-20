"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RotateCcw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body className="font-sans antialiased text-[#211D1E] bg-[#F8FAFC]">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center border border-red-50">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            
            <h1 className="text-3xl font-light mb-2 tracking-tight">System failure</h1>
            <p className="text-gray-500 font-light mb-8">
              A critical error has occurred at the application root. Please reload or contact support if the problem persists.
            </p>

            <Button
              onClick={() => reset()}
              className="w-full bg-[#006BC4] text-white rounded-full py-6 text-lg font-normal shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Reset Application
            </Button>
            
            {error.digest && (
               <p className="mt-6 text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                  Reference: {error.digest}
               </p>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
