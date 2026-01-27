"use client"

import { useNetworkState } from 'react-use'
import { useNetworkStatus } from '@/hooks/use-network-status'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function NetworkDebugPanel() {
  const networkState = useNetworkState()
  const { isOnline, checkNetworkConnectivity } = useNetworkStatus()

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-gray-300 rounded-lg p-4 shadow-lg max-w-sm z-50">
      <h3 className="font-bold mb-2">🔍 Network Debug Panel</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Browser (navigator.onLine):</span>
          <span className={navigator.onLine ? "text-green-600" : "text-red-600"}>
            {navigator.onLine ? "✅ Online" : "❌ Offline"}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>react-use (networkState.online):</span>
          <span className={networkState.online ? "text-green-600" : "text-red-600"}>
            {networkState.online ? "✅ Online" : "❌ Offline"}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Our Hook (isOnline):</span>
          <span className={isOnline ? "text-green-600" : "text-red-600"}>
            {isOnline ? "✅ Online" : "❌ Offline"}
          </span>
        </div>

        {networkState.effectiveType && (
          <div className="flex justify-between">
            <span>Connection Type:</span>
            <span className="font-mono">{networkState.effectiveType}</span>
          </div>
        )}

        {networkState.downlink && (
          <div className="flex justify-between">
            <span>Downlink:</span>
            <span className="font-mono">{networkState.downlink} Mbps</span>
          </div>
        )}

        {networkState.rtt !== undefined && (
          <div className="flex justify-between">
            <span>RTT:</span>
            <span className="font-mono">{networkState.rtt} ms</span>
          </div>
        )}

        <div className="pt-2 border-t border-gray-200">
          <Button
            onClick={async () => {
              const result = await checkNetworkConnectivity()
              toast.info(`Connectivity Test: ${result ? "✅ Online" : "❌ Offline"}`)
            }}
            className="w-full"
            size="sm"
          >
            Test Connectivity
          </Button>
        </div>

        <div className="text-xs text-gray-500 pt-2">
          Last updated: {networkState.since ? new Date(networkState.since).toLocaleTimeString() : 'N/A'}
        </div>
      </div>
    </div>
  )
}
