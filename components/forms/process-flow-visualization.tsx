"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { 
  Truck, 
  FlaskConical, 
  Beaker, 
  Thermometer, 
  Package, 
  Factory,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export interface ProcessStep {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  status: "pending" | "active" | "completed" | "error"
  formType: string
  formId?: string
  timestamp?: string
  operator?: string
  color: string
  bgColor: string
}

interface ProcessFlowVisualizationProps {
  steps: ProcessStep[]
  currentStepId?: string
  onStepClick?: (step: ProcessStep) => void
  className?: string
}

const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: { scale: 1.05, y: -5 }
}

const connectorVariants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1 }
}

export function ProcessFlowVisualization({ 
  steps, 
  currentStepId, 
  onStepClick,
  className 
}: ProcessFlowVisualizationProps) {
  const getStatusIcon = (status: ProcessStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "active":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: ProcessStep["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      case "active":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Active</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Error</Badge>
      default:
        return <Badge >Pending</Badge>
    }
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Process Flow Header */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Milk Processing Workflow</h3>
            <p className="text-sm text-gray-600">Track your production process from collection to packaging</p>
          </div>

          {/* Process Steps */}
          <div className="relative">
            {/* Desktop Flow */}
            <div className="hidden lg:flex items-center justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  <motion.div
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "relative flex flex-col items-center space-y-3 cursor-pointer group",
                      "min-w-[140px]"
                    )}
                    onClick={() => onStepClick?.(step)}
                  >
                    {/* Step Circle */}
                    <div className={cn(
                      "relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
                      "border-2 shadow-lg group-hover:shadow-xl",
                      step.status === "completed" && "bg-green-50 border-green-300",
                      step.status === "active" && "bg-blue-50 border-blue-300 ring-4 ring-blue-100",
                      step.status === "error" && "bg-red-50 border-red-300",
                      step.status === "pending" && "bg-gray-50 border-gray-300"
                    )}>
                      <step.icon className={cn(
                        "h-7 w-7 transition-colors",
                        step.status === "completed" && "text-green-600",
                        step.status === "active" && "text-blue-600",
                        step.status === "error" && "text-red-600",
                        step.status === "pending" && "text-gray-400"
                      )} />
                      
                      {/* Status Indicator */}
                      <div className="absolute -top-1 -right-1">
                        {getStatusIcon(step.status)}
                      </div>
                    </div>

                    {/* Step Info */}
                    <div className="text-center space-y-1">
                      <h4 className={cn(
                        "font-medium text-sm transition-colors",
                        step.status === "active" && "text-blue-900",
                        step.status === "completed" && "text-green-900",
                        step.status === "error" && "text-red-900",
                        step.status === "pending" && "text-gray-600"
                      )}>
                        {step.name}
                      </h4>
                      <p className="text-xs text-gray-500 max-w-[120px] line-clamp-2">
                        {step.description}
                      </p>
                      {step.timestamp && (
                        <p className="text-xs text-gray-400">
                          {new Date(step.timestamp).toLocaleTimeString()}
                        </p>
                      )}
                    </div>

                    {/* Status Badge */}
                    {getStatusBadge(step.status)}
                  </motion.div>

                  {/* Connector Arrow */}
                  {index < steps.length - 1 && (
                    <motion.div
                      variants={connectorVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className="flex-1 flex items-center justify-center px-4"
                    >
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </motion.div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Mobile/Tablet Flow */}
            <div className="lg:hidden space-y-4">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "flex items-center space-x-4 p-4 rounded-lg border transition-all duration-300 cursor-pointer",
                    "hover:shadow-md",
                    step.status === "completed" && "bg-green-50 border-green-200",
                    step.status === "active" && "bg-blue-50 border-blue-200 ring-2 ring-blue-100",
                    step.status === "error" && "bg-red-50 border-red-200",
                    step.status === "pending" && "bg-gray-50 border-gray-200"
                  )}
                  onClick={() => onStepClick?.(step)}
                >
                  {/* Step Icon */}
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    step.status === "completed" && "bg-green-100",
                    step.status === "active" && "bg-blue-100",
                    step.status === "error" && "bg-red-100",
                    step.status === "pending" && "bg-gray-100"
                  )}>
                    <step.icon className={cn(
                      "h-6 w-6",
                      step.status === "completed" && "text-green-600",
                      step.status === "active" && "text-blue-600",
                      step.status === "error" && "text-red-600",
                      step.status === "pending" && "text-gray-400"
                    )} />
                  </div>

                  {/* Step Details */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className={cn(
                        "font-medium text-sm",
                        step.status === "active" && "text-blue-900",
                        step.status === "completed" && "text-green-900",
                        step.status === "error" && "text-red-900",
                        step.status === "pending" && "text-gray-600"
                      )}>
                        {step.name}
                      </h4>
                      {getStatusBadge(step.status)}
                    </div>
                    <p className="text-xs text-gray-500">{step.description}</p>
                    {step.operator && (
                      <p className="text-xs text-gray-400">Operator: {step.operator}</p>
                    )}
                    {step.timestamp && (
                      <p className="text-xs text-gray-400">
                        {new Date(step.timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Arrow for mobile */}
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Process Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {steps.filter(s => s.status === "completed").length}
              </div>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {steps.filter(s => s.status === "active").length}
              </div>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {steps.filter(s => s.status === "pending").length}
              </div>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {steps.filter(s => s.status === "error").length}
              </div>
              <p className="text-xs text-gray-500">Issues</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Default process steps for milk production
export const defaultMilkProcessSteps: ProcessStep[] = [
  {
    id: "driver-form",
    name: "Driver Form",
    description: "Milk collection and delivery",
    icon: Truck,
    status: "completed",
    formType: "driver-form",
    color: "text-green-600",
    bgColor: "bg-green-50",
    timestamp: "2024-01-15T08:00:00Z",
    operator: "John Driver"
  },
  {
    id: "raw-milk-intake",
    name: "Raw Milk Intake",
    description: "Initial quality assessment",
    icon: Beaker,
    status: "completed",
    formType: "bmt-control-form",
    color: "text-green-600",
    bgColor: "bg-green-50",
    timestamp: "2024-01-15T08:30:00Z",
    operator: "Sarah Intake"
  },
  {
    id: "lab-tests",
    name: "Lab Tests",
    description: "Quality and safety testing",
    icon: FlaskConical,
    status: "active",
    formType: "lab-forms",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    timestamp: "2024-01-15T09:00:00Z",
    operator: "Mike Lab"
  },
  {
    id: "standardizing",
    name: "Standardizing",
    description: "Fat content adjustment",
    icon: Thermometer,
    status: "pending",
    formType: "operator-forms",
    color: "text-gray-400",
    bgColor: "bg-gray-50"
  },
  {
    id: "pasteurizing",
    name: "Pasteurizing",
    description: "Heat treatment process",
    icon: Thermometer,
    status: "pending",
    formType: "sterilised-milk-process",
    color: "text-gray-400",
    bgColor: "bg-gray-50"
  },
  {
    id: "filmatic-line",
    name: "Filmatic Line",
    description: "Packaging preparation",
    icon: Factory,
    status: "pending",
    formType: "filler-log-2",
    color: "text-gray-400",
    bgColor: "bg-gray-50"
  },
  {
    id: "palletizer",
    name: "Palletizer",
    description: "Final packaging",
    icon: Package,
    status: "pending",
    formType: "palletiser-sheet",
    color: "text-gray-400",
    bgColor: "bg-gray-50"
  }
]
