"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RotateCcw, Home } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function Error({
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
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-blue-100/50 p-8 text-center border border-blue-50"
      >
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        
        <h2 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">Something went wrong</h2>
        <p className="text-gray-500 font-light mb-8">
          We encountered an unexpected error while processing your request. Don't worry, your data is safe.
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => reset()}
            className="w-full bg-[#006BC4] text-white rounded-full py-6 text-lg font-normal shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Try again
          </Button>
          
          <Link href="/" className="block">
            <Button
              variant="outline"
              className="w-full rounded-full py-6 text-lg font-light border-gray-200 text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Return Home
            </Button>
          </Link>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
            Error ID: {error.digest || "Internal Client Error"}
          </p>
        </div>
      </motion.div>
    </div>
  )
}
