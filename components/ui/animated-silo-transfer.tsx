"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Droplets } from "lucide-react"
import "./animated-silo-transfer.css"

interface SiloData {
  id: string
  name: string
  capacity: number
  currentVolume: number
  location: string
  category: string
}

interface AnimatedSiloTransferProps {
  sourceSilo: SiloData
  destinationSilo: SiloData
  transferVolume: number
  isTransferring?: boolean
  transferProgress?: number // 0-100
  className?: string
}

export function AnimatedSiloTransfer({
  sourceSilo,
  destinationSilo,
  transferVolume,
  isTransferring = false,
  transferProgress = 0,
  className = ""
}: AnimatedSiloTransferProps) {
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'transferring' | 'complete'>('idle')
  const [sourceLevel, setSourceLevel] = useState(sourceSilo.currentVolume)
  const [destinationLevel, setDestinationLevel] = useState(destinationSilo.currentVolume)

  // Calculate liquid levels as percentages
  const sourceLevelPercent = Math.min((sourceLevel / sourceSilo.capacity) * 100, 100)
  const destinationLevelPercent = Math.min((destinationLevel / destinationSilo.capacity) * 100, 100)

  // Animate the transfer
  useEffect(() => {
    if (isTransferring && transferProgress > 0) {
      setAnimationPhase('transferring')
      
      // Calculate new levels based on transfer progress
      const transferredVolume = (transferProgress / 100) * transferVolume
      const newSourceLevel = Math.max(sourceSilo.currentVolume - transferredVolume, 0)
      const newDestinationLevel = Math.min(destinationSilo.currentVolume + transferredVolume, destinationSilo.capacity)
      
      setSourceLevel(newSourceLevel)
      setDestinationLevel(newDestinationLevel)
    } else if (transferProgress >= 100) {
      setAnimationPhase('complete')
    } else {
      setAnimationPhase('idle')
    }
  }, [isTransferring, transferProgress, transferVolume, sourceSilo.currentVolume, destinationSilo.currentVolume, destinationSilo.capacity])

  const getLiquidColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'buffer tanks':
        return 'from-blue-400 to-blue-600'
      case 'processing tanks':
        return 'from-green-400 to-green-600'
      case 'storage tanks':
        return 'from-gray-400 to-gray-600'
      default:
        return 'from-blue-300 to-blue-500'
    }
  }

  const getLiquidAnimation = () => {
    if (animationPhase === 'transferring') {
      return 'animate-pulse'
    }
    return ''
  }

  return (
    <div className={`w-full ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-center space-x-2">
            <Droplets className="w-5 h-5 text-blue-600" />
            <span>Milk Transfer Visualization</span>
            {isTransferring && (
              <Badge variant="outline" className="animate-pulse">
                Transferring...
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-8">
            {/* Source Silo */}
            <div className="flex flex-col items-center space-y-4">
              <div className="text-center">
                <h3 className="font-semibold text-sm text-gray-700">Source Silo</h3>
                <p className="text-xs text-gray-500">{sourceSilo.name}</p>
                <p className="text-xs text-gray-400">{sourceSilo.location}</p>
              </div>
              
              <div className="relative">
                {/* 3D Silo Container */}
                <div className="relative w-32 h-40 perspective-1000">
                  {/* Silo Base - 3D effect */}
                  <div className="w-32 h-40 relative transform-gpu">
                    {/* Front face */}
                    <div className="absolute inset-0 border-4 border-gray-300 rounded-lg bg-gradient-to-b from-gray-100 to-gray-200 silo-shadow">
                      {/* Silo Liquid with 3D effect */}
                      <div
                        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${getLiquidColor(sourceSilo.category)} transition-all duration-1000 ease-in-out ${getLiquidAnimation()} overflow-hidden liquid-shadow`}
                        style={{
                          height: `${Math.max(sourceLevelPercent, 5)}%`, // Minimum 5% to show some liquid
                        }}
                      >
                        {/* Multiple wave layers for realistic liquid effect */}
                        <div className="absolute inset-0 opacity-20">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-wave" style={{ animationDuration: '3s' }}></div>
                          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white to-transparent animate-wave-reverse" style={{ animationDelay: '1s', animationDuration: '2.5s' }}></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-wave" style={{ animationDelay: '2s', animationDuration: '4s' }}></div>
                        </div>
                        
                        {/* Liquid surface with enhanced 3D effect */}
                        <div className="absolute top-0 left-0 right-0 h-3 liquid-surface">
                          <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent opacity-60"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-wave" style={{ animationDuration: '2s' }}></div>
                        </div>
                        
                        {/* Liquid bubbles effect */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-liquid-bubble" style={{ animationDelay: '0s' }}></div>
                          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-liquid-bubble" style={{ animationDelay: '1s' }}></div>
                          <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white rounded-full animate-liquid-bubble" style={{ animationDelay: '2s' }}></div>
                        </div>
                        
                        {/* Liquid shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-15 animate-pulse"></div>
                      </div>
                      
                      {/* Volume indicator with 3D effect */}
                      <div className="absolute top-1 left-1 right-1 text-center">
                        <div className="bg-white bg-opacity-90 rounded px-2 py-1 shadow-md border border-gray-200">
                          <span className="text-sm font-bold text-gray-700">
                            {Math.round(sourceLevelPercent)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right side face for 3D effect */}
                    <div className="absolute top-0 right-0 w-4 h-40 bg-gradient-to-b from-gray-200 to-gray-300 rounded-r-lg transform rotate-y-12 origin-left"></div>
                    
                    {/* Top face for 3D effect */}
                    <div className="absolute top-0 left-0 w-32 h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-t-lg transform rotate-x-12 origin-bottom"></div>
                  </div>
                </div>
                
                {/* Volume details */}
                <div className="mt-2 text-center">
                  <p className="text-xs text-gray-600">
                    {Math.round(sourceLevel)}L / {sourceSilo.capacity}L
                  </p>
                  <p className="text-xs text-gray-500">
                    {sourceSilo.category}
                  </p>
                </div>
              </div>
            </div>

            {/* Transfer Arrow and Flow */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {/* 3D Transfer Arrow with enhanced effects */}
                <div className={`relative transition-all duration-500 ${
                  animationPhase === 'transferring' 
                    ? 'animate-bounce scale-110' 
                    : 'scale-100'
                }`}>
                  <ArrowRight className="w-10 h-10 text-blue-600 drop-shadow-lg" />
                  <ArrowRight className="absolute top-0 left-0 w-10 h-10 text-blue-400 opacity-50 transform translate-x-1 translate-y-1" />
                  
                  {/* Particle effects during transfer */}
                  {animationPhase === 'transferring' && (
                    <>
                      <div className="absolute top-1/2 left-0 w-2 h-2 bg-blue-400 rounded-full animate-liquid-bubble" style={{ animationDelay: '0s' }}></div>
                      <div className="absolute top-1/3 left-2 w-1 h-1 bg-blue-300 rounded-full animate-liquid-bubble" style={{ animationDelay: '0.5s' }}></div>
                      <div className="absolute top-2/3 left-1 w-1.5 h-1.5 bg-blue-500 rounded-full animate-liquid-bubble" style={{ animationDelay: '1s' }}></div>
                    </>
                  )}
                </div>
                
                {/* Transfer volume indicator with 3D effect */}
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-2 rounded-full text-sm font-semibold shadow-lg border border-blue-300">
                    {transferVolume}L
                  </div>
                </div>
              </div>
              
              {/* Transfer progress bar */}
              {isTransferring && (
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-1000 ease-out"
                    style={{ width: `${transferProgress}%` }}
                  />
                </div>
              )}
              
              {/* Transfer status */}
              <div className="text-center">
                {animationPhase === 'transferring' && (
                  <p className="text-xs text-blue-600 font-medium">
                    Transferring... {Math.round(transferProgress)}%
                  </p>
                )}
                {animationPhase === 'complete' && (
                  <p className="text-xs text-green-600 font-medium">
                    Transfer Complete
                  </p>
                )}
                {animationPhase === 'idle' && (
                  <p className="text-xs text-gray-500">
                    Ready to Transfer
                  </p>
                )}
              </div>
            </div>

            {/* Destination Silo */}
            <div className="flex flex-col items-center space-y-4">
              <div className="text-center">
                <h3 className="font-semibold text-sm text-gray-700">Destination Silo</h3>
                <p className="text-xs text-gray-500">{destinationSilo.name}</p>
                <p className="text-xs text-gray-400">{destinationSilo.location}</p>
              </div>
              
              <div className="relative">
                {/* 3D Silo Container */}
                <div className="relative w-32 h-40 perspective-1000">
                  {/* Silo Base - 3D effect */}
                  <div className="w-32 h-40 relative transform-gpu">
                    {/* Front face */}
                    <div className="absolute inset-0 border-4 border-gray-300 rounded-lg bg-gradient-to-b from-gray-100 to-gray-200 silo-shadow">
                      {/* Silo Liquid with 3D effect */}
                      <div
                        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${getLiquidColor(destinationSilo.category)} transition-all duration-1000 ease-in-out ${getLiquidAnimation()} overflow-hidden liquid-shadow`}
                        style={{
                          height: `${Math.max(destinationLevelPercent, 5)}%`, // Minimum 5% to show some liquid
                        }}
                      >
                        {/* Multiple wave layers for realistic liquid effect */}
                        <div className="absolute inset-0 opacity-20">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-wave" style={{ animationDuration: '3s' }}></div>
                          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white to-transparent animate-wave-reverse" style={{ animationDelay: '1s', animationDuration: '2.5s' }}></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-wave" style={{ animationDelay: '2s', animationDuration: '4s' }}></div>
                        </div>
                        
                        {/* Liquid surface with enhanced 3D effect */}
                        <div className="absolute top-0 left-0 right-0 h-3 liquid-surface">
                          <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent opacity-60"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-wave" style={{ animationDuration: '2s' }}></div>
                        </div>
                        
                        {/* Liquid bubbles effect */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-liquid-bubble" style={{ animationDelay: '0s' }}></div>
                          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-liquid-bubble" style={{ animationDelay: '1s' }}></div>
                          <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white rounded-full animate-liquid-bubble" style={{ animationDelay: '2s' }}></div>
                        </div>
                        
                        {/* Liquid shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-15 animate-pulse"></div>
                      </div>
                      
                      {/* Volume indicator with 3D effect */}
                      <div className="absolute top-1 left-1 right-1 text-center">
                        <div className="bg-white bg-opacity-90 rounded px-2 py-1 shadow-md border border-gray-200">
                          <span className="text-sm font-bold text-gray-700">
                            {Math.round(destinationLevelPercent)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right side face for 3D effect */}
                    <div className="absolute top-0 right-0 w-4 h-40 bg-gradient-to-b from-gray-200 to-gray-300 rounded-r-lg transform rotate-y-12 origin-left"></div>
                    
                    {/* Top face for 3D effect */}
                    <div className="absolute top-0 left-0 w-32 h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-t-lg transform rotate-x-12 origin-bottom"></div>
                  </div>
                </div>
                
                {/* Volume details */}
                <div className="mt-2 text-center">
                  <p className="text-xs text-gray-600">
                    {Math.round(destinationLevel)}L / {destinationSilo.capacity}L
                  </p>
                  <p className="text-xs text-gray-500">
                    {destinationSilo.category}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transfer Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500">Transfer Volume</p>
                <p className="text-lg font-bold text-blue-600">{transferVolume}L</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Source Remaining</p>
                <p className="text-lg font-bold text-orange-600">{Math.round(sourceLevel)}L</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Destination Total</p>
                <p className="text-lg font-bold text-green-600">{Math.round(destinationLevel)}L</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Demo component for testing different scenarios
export function AnimatedSiloTransferDemo() {
  const [isTransferring, setIsTransferring] = useState(false)
  const [transferProgress, setTransferProgress] = useState(0)

  const sourceSilo = {
    id: "1",
    name: "Raw Milk Silo A",
    capacity: 15000,
    currentVolume: 12000,
    location: "PB65",
    category: "Buffer Tanks"
  }

  const destinationSilo = {
    id: "2", 
    name: "Processing Silo B",
    capacity: 10000,
    currentVolume: 3000,
    location: "PD2",
    category: "Processing Tanks"
  }

  const transferVolume = 2000

  const startTransfer = () => {
    setIsTransferring(true)
    setTransferProgress(0)
    
    const interval = setInterval(() => {
      setTransferProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsTransferring(false)
          return 100
        }
        return prev + 2
      })
    }, 100)
  }

  const resetTransfer = () => {
    setIsTransferring(false)
    setTransferProgress(0)
  }

  return (
    <div className="space-y-4">
      <AnimatedSiloTransfer
        sourceSilo={sourceSilo}
        destinationSilo={destinationSilo}
        transferVolume={transferVolume}
        isTransferring={isTransferring}
        transferProgress={transferProgress}
      />
      
      <div className="flex justify-center space-x-4">
        <button
          onClick={startTransfer}
          disabled={isTransferring}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Start Transfer
        </button>
        <button
          onClick={resetTransfer}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
