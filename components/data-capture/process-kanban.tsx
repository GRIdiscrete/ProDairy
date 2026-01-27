"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { 
  Thermometer, 
  Factory, 
  Package, 
  FileText,
  Beaker,
  CheckCircle,
  Plus,
  Eye,
  Edit,
  Clock,
  User,
  Calendar,
  ArrowRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { KanbanSkeleton } from "@/components/ui/kanban-skeleton"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { FillerLog2ViewDrawer } from "@/components/forms/filler-log-2-view-drawer"
import { PasteurizingFormViewDrawer } from "@/components/forms/pasteurizing-form-view-drawer"
import { FilmaticLinesForm1ViewDrawer } from "@/components/forms/filmatic-lines-form-1-view-drawer"
import { FilmaticLinesForm2ViewDrawer } from "@/components/forms/filmatic-lines-form-2-view-drawer"
import { SteriMilkProcessLogViewDrawer } from "@/components/forms/steri-milk-process-log-view-drawer"
import { PalletiserSheetViewDrawer } from "@/components/forms/palletiser-sheet-view-drawer"
import { ProductIncubationViewDrawer } from "@/components/forms/product-incubation-view-drawer"
import { UHTQualityCheckViewDrawer } from "@/components/forms/uht-quality-check-view-drawer"
import { QACorrectiveActionViewDrawer } from "@/components/forms/qa-corrective-action-view-drawer"
import { fetchPasteurizingForms } from "@/lib/store/slices/pasteurizingSlice"
import { fetchFilmaticLinesForm1s } from "@/lib/store/slices/filmaticLinesForm1Slice"
import { fetchSteriMilkProcessLogs } from "@/lib/store/slices/steriMilkProcessLogSlice"
import { fetchPalletiserSheets } from "@/lib/store/slices/palletiserSheetSlice"
import { fetchProductIncubations } from "@/lib/store/slices/productIncubationSlice"
import { fetchUHTQualityChecks } from "@/lib/store/slices/uhtQualityCheckSlice"
import { fetchQACorrectiveActions } from "@/lib/store/slices/qaCorrectiveActionSlice"

interface ProcessForm {
  id: string
  title: string
  type: string
  status: "pending" | "active" | "completed" | "error"
  priority: "low" | "medium" | "high"
  operator: string
  createdAt: string
  updatedAt: string
  description?: string
  metadata?: Record<string, any>
}

interface ProcessStage {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  bgColor: string
  route: string
  forms: ProcessForm[]
}

interface ProcessKanbanProps {
  processId: string
  className?: string
}

export function ProcessKanban({ processId, className }: ProcessKanbanProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  
  // Get data from Redux store with fallbacks
  const pasteurizingState = useAppSelector((state) => state.pasteurizing)
  const filmaticState = useAppSelector((state) => state.filmaticLinesForm1)
  const processLogState = useAppSelector((state) => state.steriMilkProcessLog)
  const palletiserState = useAppSelector((state) => state.palletiserSheets)
  const incubationState = useAppSelector((state) => state.productIncubations)
  const testState = useAppSelector((state) => state.uhtQualityChecks)
  const qaCorrectiveState = useAppSelector((state) => state.qaCorrectiveActions)

  // Extract data with fallbacks
  const pasteurizingForms = pasteurizingState?.forms || []
  const pasteurizingLoading = pasteurizingState?.loading || false
  const filmaticForms = filmaticState?.forms || []
  const filmaticLoading = filmaticState?.loading || { fetch: false }
  const processLogForms = processLogState?.logs || []
  const processLogLoading = processLogState?.loading || { fetch: false }
  const palletiserForms = palletiserState?.sheets || []
  const palletiserLoading = palletiserState?.loading || false
  const incubationForms = incubationState?.forms || []
  const incubationLoading = incubationState?.loading || { fetch: false }
  const testForms = testState?.forms || []
  const testLoading = testState?.loading || { fetch: false }
  const qaCorrectiveForms = qaCorrectiveState?.forms || []
  const qaCorrectiveLoading = qaCorrectiveState?.loading || { fetch: false }

  // Define process stages for Steri Milk
  const steriMilkStages: ProcessStage[] = [
    {
      id: "pasteurizing",
      title: "Pasteurizing",
      description: "Heat treatment and pasteurization process",
      icon: Thermometer,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      route: "/data-capture/pasteurizing",
      forms: []
    },
    {
      id: "filmatic-lines-1",
      title: "Filmatic Lines Form 1",
      description: "First packaging line preparation",
      icon: Factory,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      route: "/data-capture/filmatic-lines",
      forms: []
    },
    {
      id: "process-log",
      title: "Process Log",
      description: "Documentation and process tracking",
      icon: FileText,
      color: "bg-gray-500",
      bgColor: "bg-gray-50",
      route: "/data-capture/process-log",
      forms: []
    },
    {
      id: "filmatic-lines-2",
      title: "Filmatic Lines 2",
      description: "Second packaging line processing",
      icon: Factory,
      color: "bg-indigo-500",
      bgColor: "bg-indigo-50",
      route: "/data-capture/filmatic-lines",
      forms: []
    },
    {
      id: "palletiser",
      title: "Palletiser",
      description: "Final packaging and palletizing",
      icon: Package,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      route: "/data-capture/palletiser-sheet",
      forms: []
    },
    {
      id: "incubation",
      title: "Incubation",
      description: "Quality control and incubation testing",
      icon: Beaker,
      color: "bg-cyan-500",
      bgColor: "bg-cyan-50",
      route: "/data-capture/incubation",
      forms: []
    },
    {
      id: "test",
      title: "Test",
      description: "Final quality testing and validation",
      icon: CheckCircle,
      color: "bg-emerald-500",
      bgColor: "bg-emerald-50",
      route: "/data-capture/test",
      forms: []
    },
    {
      id: "qa-corrective",
      title: "QA Corrective Measures",
      description: "Quality assurance and corrective actions",
      icon: FileText,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      route: "/data-capture/qa-corrective-measures",
      forms: []
    }
  ]

  const [stages, setStages] = useState<ProcessStage[]>(steriMilkStages)
  const [selectedForm, setSelectedForm] = useState<ProcessForm | null>(null)
  const [selectedStage, setSelectedStage] = useState<ProcessStage | null>(null)
  const [showFormDrawer, setShowFormDrawer] = useState<boolean>(false)

  // Load data for all stages
  useEffect(() => {
    if (processId) {
      dispatch(fetchPasteurizingForms())
      dispatch(fetchFilmaticLinesForm1s())
      dispatch(fetchSteriMilkProcessLogs())
      dispatch(fetchPalletiserSheets())
      dispatch(fetchProductIncubations())
      dispatch(fetchUHTQualityChecks())
      dispatch(fetchQACorrectiveActions())
    }
  }, [dispatch, processId])

  // Update stages with form data
  useEffect(() => {
    if (processId) {
      const updatedStages = steriMilkStages.map(stage => {
        let forms: ProcessForm[] = []
        
        switch (stage.id) {
          case 'pasteurizing':
            forms = (pasteurizingForms || []).map((form: any) => ({
              id: form.id,
              title: `Pasteurizing Form #${form.id.slice(0, 8)}`,
              type: 'Pasteurizing',
              status: 'active' as const,
              priority: 'high' as const,
              operator: 'Process Operator',
              createdAt: form.created_at,
              updatedAt: form.updated_at,
              description: `Production: ${form.production?.reduce((sum: number, item: any) => sum + (item.output_target?.value || 0), 0).toFixed(1)}L`,
              metadata: form
            }))
            break
          case 'filmatic-lines-1':
          case 'filmatic-lines-2':
            forms = (filmaticForms || []).map((form: any) => ({
              id: form.id,
              title: `Filmatic Form #${form.id.slice(0, 8)}`,
              type: 'Filmatic Lines',
              status: 'pending' as const,
              priority: 'medium' as const,
              operator: 'Packaging Operator',
              createdAt: form.created_at,
              updatedAt: form.updated_at,
              description: `Line: ${form.line || 'Unknown'}`,
              metadata: form
            }))
            break
          case 'process-log':
            forms = (processLogForms || []).map((form: any) => ({
              id: form.id,
              title: `Process Log #${form.id.slice(0, 8)}`,
              type: 'Process Log',
              status: 'completed' as const,
              priority: 'low' as const,
              operator: 'Quality Control',
              createdAt: form.created_at,
              updatedAt: form.updated_at,
              description: `Log entries: ${form.entries?.length || 0}`,
              metadata: form
            }))
            break
          case 'palletiser':
            forms = (palletiserForms || []).map((form: any) => ({
              id: form.id,
              title: `Palletiser Form #${form.id.slice(0, 8)}`,
              type: 'Palletiser',
              status: 'pending' as const,
              priority: 'medium' as const,
              operator: 'Packaging Operator',
              createdAt: form.created_at,
              updatedAt: form.updated_at,
              description: `Pallets: ${form.pallets || 0}`,
              metadata: form
            }))
            break
          case 'incubation':
            forms = (incubationForms || []).map((form: any) => ({
              id: form.id,
              title: `Incubation #${form.id.slice(0, 8)}`,
              type: 'Incubation',
              status: 'active' as const,
              priority: 'high' as const,
              operator: 'Lab Technician',
              createdAt: form.created_at,
              updatedAt: form.updated_at,
              description: `Temperature: ${form.temperature || 'N/A'}°C`,
              metadata: form
            }))
            break
          case 'test':
            forms = (testForms || []).map((form: any) => ({
              id: form.id,
              title: `Test #${form.id.slice(0, 8)}`,
              type: 'Test',
              status: 'pending' as const,
              priority: 'high' as const,
              operator: 'Lab Technician',
              createdAt: form.created_at,
              updatedAt: form.updated_at,
              description: `Test Type: ${form.test_type || 'Unknown'}`,
              metadata: form
            }))
            break
          case 'qa-corrective':
            forms = (qaCorrectiveForms || []).map((form: any) => ({
              id: form.id,
              title: `QA Corrective #${form.id.slice(0, 8)}`,
              type: 'QA Corrective',
              status: 'error' as const,
              priority: 'high' as const,
              operator: 'QA Manager',
              createdAt: form.created_at,
              updatedAt: form.updated_at,
              description: `Issues: ${form.issues?.length || 0}`,
              metadata: form
            }))
            break
        }
        
        return { ...stage, forms }
      })
      
      setStages(updatedStages)
    }
  }, [
    processId, 
    pasteurizingForms?.length, 
    filmaticForms?.length, 
    processLogForms?.length, 
    palletiserForms?.length, 
    incubationForms?.length, 
    testForms?.length, 
    qaCorrectiveForms?.length
  ])

  const getStatusIcon = (status: ProcessForm["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "active":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "error":
        return <CheckCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: ProcessForm["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Completed</Badge>
      case "active":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">Active</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Error</Badge>
      default:
        return <Badge  className="text-xs">Pending</Badge>
    }
  }

  const getPriorityBadge = (priority: ProcessForm["priority"]) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">Medium</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs">Low</Badge>
    }
  }

  const handleFormClick = (form: ProcessForm, stage: ProcessStage) => {
    // Show form drawer for viewing details
    console.log('Form clicked:', { form, stage, metadata: form.metadata })
    setSelectedForm(form)
    setSelectedStage(stage)
    setShowFormDrawer(true)
  }

  const handleStageClick = (stage: ProcessStage) => {
    // Navigate to the stage page with process ID in URL
    let stageRoute = ''
    
    switch (stage.id) {
      case 'filmatic-lines-1':
        stageRoute = `/data-capture/${processId}/filmatic-lines`
        break
      case 'filmatic-lines-2':
        stageRoute = `/data-capture/${processId}/filmatic-lines-2`
        break
      case 'process-log':
        stageRoute = `/data-capture/${processId}/process-log`
        break
      case 'palletiser':
        stageRoute = `/data-capture/${processId}/palletiser-sheet`
        break
      case 'incubation':
        stageRoute = `/data-capture/${processId}/incubation`
        break
      case 'test':
        stageRoute = `/data-capture/${processId}/test`
        break
      case 'qa-corrective':
        stageRoute = `/data-capture/${processId}/qa-corrective-measures`
        break
      default:
        stageRoute = `/data-capture/${processId}/${stage.id}`
    }
    
    router.push(stageRoute)
  }

  const isLoading = pasteurizingLoading || filmaticLoading?.fetch || processLogLoading?.fetch || 
                   palletiserLoading || incubationLoading?.fetch || testLoading?.fetch || qaCorrectiveLoading?.fetch

  // Debug logging
  console.log('ProcessKanban Debug:', {
    processId,
    isLoading,
    stagesLength: stages.length,
    pasteurizingForms: pasteurizingForms?.length || 0,
    filmaticForms: filmaticForms?.length || 0
  })

  // Always show the kanban board, even if no data
  return (
    <div className={cn("w-full h-full", className)}>
      <div className="flex space-x-4 overflow-x-auto pb-4 h-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {stages.map((stage) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-shrink-0 w-80"
            >
              <div className="h-full border border-gray-200 rounded-lg">
                <CardHeader className={cn("pb-3 cursor-pointer", stage.bgColor)} onClick={() => handleStageClick(stage)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 opacity-70">
                        <stage.icon className="h-3 w-3 text-gray-500" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-light">{stage.title}</CardTitle>
                        <p className="text-xs text-muted-foreground font-light">{stage.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge  className="text-xs bg-gray-100 text-gray-600 font-light">
                        {stage.forms.length}
                      </Badge>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3">
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-3">
                      <AnimatePresence>
                        {stage.forms.map((form) => (
                          <motion.div
                            key={form.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                              "p-3 border rounded-lg cursor-pointer transition-all duration-200",
                              "hover:shadow-md hover:border-primary/50",
                              "bg-white border-gray-200"
                            )}
                            onClick={() => handleFormClick(form, stage)}
                          >
                            <div className="space-y-3">
                              {/* Form Header */}
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-light text-sm text-gray-800 truncate">
                                    {form.title}
                                  </h4>
                                  <p className="text-xs text-gray-500 mt-1 font-light">
                                    {form.type}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-1 ml-2">
                                  {getStatusIcon(form.status)}
                                </div>
                              </div>

                              {/* Form Description */}
                              {form.description && (
                                <p className="text-xs text-gray-600 line-clamp-2 font-light">
                                  {form.description}
                                </p>
                              )}

                              {/* Status and Priority Badges */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1">
                                  {getStatusBadge(form.status)}
                                  {getPriorityBadge(form.priority)}
                                </div>
                              </div>

                              {/* Form Metadata */}
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  <div className="w-4 h-4 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 opacity-60">
                                    <User className="h-2.5 w-2.5 text-gray-500" />
                                  </div>
                                  <span className="truncate font-light">{form.operator}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  <div className="w-4 h-4 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 opacity-60">
                                    <Calendar className="h-2.5 w-2.5 text-gray-500" />
                                  </div>
                                  <span className="font-light">{new Date(form.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>

                              {/* Click indicator */}
                              <div className="flex items-center justify-end pt-2 border-t">
                                <div className="text-xs text-gray-400 flex items-center font-light">
                                  <Eye className="h-3 w-3 mr-1" />
                                  Click to view details
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {/* Empty State */}
                      {stage.forms.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <div className="w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 opacity-60">
                            <stage.icon className="h-4 w-4 text-gray-400" />
                          </div>
                          <p className="text-sm font-light">No forms in this stage</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStageClick(stage)}
                            className="mt-2 font-light"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Form
                          </Button>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Form Drawers */}
        {showFormDrawer && selectedForm && selectedStage && (
          <>
            {console.log('Rendering drawer for stage:', selectedStage.id, 'with form:', selectedForm)}
            {selectedStage.id === 'pasteurizing' && (
              <PasteurizingFormViewDrawer
                open={showFormDrawer}
                onOpenChange={setShowFormDrawer}
                form={selectedForm.metadata}
                onEdit={() => {
                  setShowFormDrawer(false)
                  // Handle edit if needed
                }}
              />
            )}
            {selectedStage.id === 'filmatic-lines-1' && (
              <FilmaticLinesForm1ViewDrawer
                open={showFormDrawer}
                onOpenChange={setShowFormDrawer}
                form={selectedForm.metadata}
                onEdit={() => {
                  setShowFormDrawer(false)
                  // Handle edit if needed
                }}
              />
            )}
            {selectedStage.id === 'filmatic-lines-2' && (
              <FilmaticLinesForm2ViewDrawer
                open={showFormDrawer}
                onOpenChange={setShowFormDrawer}
                form={selectedForm.metadata}
                onEdit={() => {
                  setShowFormDrawer(false)
                  // Handle edit if needed
                }}
              />
            )}
            {selectedStage.id === 'process-log' && (
              <SteriMilkProcessLogViewDrawer
                open={showFormDrawer}
                onOpenChange={setShowFormDrawer}
                log={selectedForm.metadata}
                onEdit={() => {
                  setShowFormDrawer(false)
                  // Handle edit if needed
                }}
              />
            )}
            {selectedStage.id === 'palletiser' && (
              <PalletiserSheetViewDrawer
                open={showFormDrawer}
                onOpenChange={setShowFormDrawer}
                sheet={selectedForm.metadata}
                onEdit={() => {
                  setShowFormDrawer(false)
                  // Handle edit if needed
                }}
              />
            )}
            {selectedStage.id === 'incubation' && (
              <ProductIncubationViewDrawer
                open={showFormDrawer}
                onOpenChange={setShowFormDrawer}
                incubation={selectedForm.metadata}
                onEdit={() => {
                  setShowFormDrawer(false)
                  // Handle edit if needed
                }}
              />
            )}
            {selectedStage.id === 'test' && (
              <UHTQualityCheckViewDrawer
                open={showFormDrawer}
                onOpenChange={setShowFormDrawer}
                qualityCheck={selectedForm.metadata}
                onEdit={() => {
                  setShowFormDrawer(false)
                  // Handle edit if needed
                }}
              />
            )}
            {selectedStage.id === 'qa-corrective' && (
              <QACorrectiveActionViewDrawer
                open={showFormDrawer}
                onOpenChange={setShowFormDrawer}
                action={selectedForm.metadata}
                onEdit={() => {
                  setShowFormDrawer(false)
                  // Handle edit if needed
                }}
              />
            )}
          </>
        )}
    </div>
  )
}
