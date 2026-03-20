"use client"

import React from "react"
import { motion } from "framer-motion"

interface SiloGaugeProps {
  name: string
  volume: number
  capacity: number
  unit?: string
  status?: string | null
  onClick?: () => void
}

export function SiloGauge({
  name,
  volume,
  capacity,
  unit = "L",
  status = "active",
  onClick
}: SiloGaugeProps) {
  const percentage = Math.min(Math.max((volume / capacity) * 100, 0), 100)
  const radius = 80
  const strokeWidth = 12
  const normalizedRadius = radius - strokeWidth / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  // Gauge colors based on percentage
  const getColor = (pct: number) => {
    if (pct > 90) return "#ef4444" // Red for almost full
    if (pct > 75) return "#f97316" // Orange
    if (pct > 25) return "#3b82f6" // Blue
    return "#10b981" // Green for low/safe levels
  }

  const gaugeColor = getColor(percentage)

  return (
    <motion.div
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="relative flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="relative w-40 h-40">
        {/* Background Circle */}
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          <circle
            stroke="#f3f4f6"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress Circle */}
          <motion.circle
            stroke={gaugeColor}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + " " + circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-light text-gray-900 leading-none">
            {Math.round(percentage)}%
          </span>
          <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">
            Volume
          </span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <h3 className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
          {name}
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          {volume.toLocaleString()} / {capacity.toLocaleString()} {unit}
        </p>
      </div>

      {/* Status Indicator */}
      <div className="absolute top-4 right-4">
        <div className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-300'}`} />
      </div>
    </motion.div>
  )
}
