"use client"

import React from "react"
import { motion } from "framer-motion"
import { Thermometer, Clock, Sparkles, Droplets } from "lucide-react"

interface SiloGaugeProps {
  name: string
  volume: number | null
  capacity: number | null
  unit?: string
  status?: string | null
  temperature?: number | null
  fatContent?: number | null
  milkAgeHours?: number | null
  cipHoursAgo?: number | null
  onClick?: () => void
}

function getMilkAgeColor(hours: number) {
  if (hours < 12) return { bg: "bg-emerald-50", text: "text-emerald-600", icon: "text-emerald-500" }
  if (hours <= 24) return { bg: "bg-amber-50", text: "text-amber-600", icon: "text-amber-500" }
  return { bg: "bg-red-50", text: "text-red-600", icon: "text-red-500" }
}

function getCipColor(hours: number) {
  if (hours <= 12) return { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" }
  if (hours <= 24) return { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" }
  return { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" }
}

function formatAge(hours: number) {
  if (hours < 1) return "<1h"
  if (hours < 24) return `${Math.round(hours)}h`
  const days = Math.floor(hours / 24)
  const rem = Math.round(hours % 24)
  return rem > 0 ? `${days}d ${rem}h` : `${days}d`
}

export function SiloGauge({
  name,
  volume,
  capacity,
  unit = "L",
  status = "active",
  temperature,
  fatContent,
  milkAgeHours,
  cipHoursAgo,
  onClick,
}: SiloGaugeProps) {
  const safeVolume = volume ?? 0
  const safeCapacity = capacity || 1
  const percentage = Math.min(Math.max((safeVolume / safeCapacity) * 100, 0), 100)
  const radius = 58
  const strokeWidth = 10
  const normalizedRadius = radius - strokeWidth / 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const getColor = (pct: number) => {
    if (pct > 90) return "#ef4444"
    if (pct > 75) return "#f97316"
    if (pct > 25) return "#3b82f6"
    return "#10b981"
  }

  const gaugeColor = getColor(percentage)

  const ageColor = milkAgeHours != null ? getMilkAgeColor(milkAgeHours) : null
  const cipColor = cipHoursAgo != null ? getCipColor(cipHoursAgo) : null

  return (
    <motion.div
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="relative flex flex-col p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      {/* Status Indicator */}
      <div className="absolute top-3 right-3">
        <div className={`w-2 h-2 rounded-full ${status === "active" ? "bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-gray-300"}`} />
      </div>

      {/* Main row: params left, gauge right */}
      <div className="flex items-center gap-3">
        {/* Left: parameters */}
        <div className="flex flex-col gap-1.5 min-w-0 flex-1">
          {/* Temperature */}
          <div className="flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span className="text-xs font-medium text-gray-700 truncate">
              {temperature != null ? `${temperature}°C` : "—"}
            </span>
          </div>

          {/* Fat Content */}
          <div className="flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700">
              {fatContent != null ? `${fatContent}%` : "—"}
              <span className="text-[9px] text-gray-400">fat</span>
            </span>
          </div>

          {/* Milk Age */}
          <div className="flex items-center gap-1.5">
            {milkAgeHours != null ? (
              <>
                <Clock className={`w-3.5 h-3.5 shrink-0 ${ageColor!.icon}`} />
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-md ${ageColor!.bg} ${ageColor!.text}`}>
                  {formatAge(milkAgeHours)}
                </span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 shrink-0 text-gray-300" />
                <span className="text-xs text-gray-400">—</span>
              </>
            )}
          </div>

          {/* CIP Status */}
          <div className="flex items-center gap-1.5">
            {cipHoursAgo != null ? (
              <>
                <Sparkles className={`w-3.5 h-3.5 shrink-0 ${cipColor!.text}`} />
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${cipColor!.bg} ${cipColor!.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cipColor!.dot}`} />
                  CIP {formatAge(cipHoursAgo)}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-gray-300" />
                <span className="text-[10px] text-gray-400">No CIP</span>
              </>
            )}
          </div>
        </div>

        {/* Right: gauge */}
        <div className="relative shrink-0" style={{ width: radius * 2, height: radius * 2 }}>
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
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-light text-gray-900 leading-none">
              {Math.round(percentage)}%
            </span>
            <span className="text-[9px] uppercase tracking-wider text-gray-400 mt-0.5">
              Volume
            </span>
          </div>
        </div>
      </div>

      {/* Bottom: name + volume */}
      <div className="mt-3 text-center">
        <h3 className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
          {name}
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          {safeVolume.toLocaleString()} / {safeCapacity.toLocaleString()} {unit}
        </p>
      </div>
    </motion.div>
  )
}
