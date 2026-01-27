"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { 
  Plus,
  Eye,
  Edit,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  MoreHorizontal
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { KanbanSkeleton } from "@/components/ui/kanban-skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface KanbanCard {
  id: string
  title: string
  description?: string
  status: "pending" | "active" | "completed" | "error"
  priority: "low" | "medium" | "high"
  assignee?: string
  createdAt: string
  updatedAt: string
  metadata?: Record<string, any>
}

export interface KanbanColumn {
  id: string
  title: string
  description: string
  color: string
  bgColor: string
  cards: KanbanCard[]
  maxCards?: number
}

interface KanbanBoardProps {
  columns: KanbanColumn[]
  onCardClick?: (card: KanbanCard, column: KanbanColumn) => void
  onCardEdit?: (card: KanbanCard, column: KanbanColumn) => void
  onCardDelete?: (card: KanbanCard, column: KanbanColumn) => void
  onCardCreate?: (columnId: string) => void
  onCardMove?: (cardId: string, fromColumnId: string, toColumnId: string) => void
  className?: string
  loading?: boolean
  enableDragAndDrop?: boolean
}

export function KanbanBoard({
  columns,
  onCardClick,
  onCardEdit,
  onCardDelete,
  onCardCreate,
  onCardMove,
  className,
  loading = false,
  enableDragAndDrop = true
}: KanbanBoardProps) {
  const [draggedCard, setDraggedCard] = useState<KanbanCard | null>(null)
  const [draggedFromColumn, setDraggedFromColumn] = useState<string | null>(null)

  const getStatusIcon = (status: KanbanCard["status"]) => {
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

  const getStatusBadge = (status: KanbanCard["status"]) => {
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

  const getPriorityBadge = (priority: KanbanCard["priority"]) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">Medium</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs">Low</Badge>
    }
  }

  const handleDragStart = (card: KanbanCard, columnId: string) => {
    if (!enableDragAndDrop) return
    setDraggedCard(card)
    setDraggedFromColumn(columnId)
  }

  const handleDragEnd = () => {
    if (!enableDragAndDrop) return
    setDraggedCard(null)
    setDraggedFromColumn(null)
  }

  const handleDrop = (columnId: string) => {
    if (!enableDragAndDrop || !draggedCard || !draggedFromColumn) return
    
    if (draggedFromColumn !== columnId) {
      onCardMove?.(draggedCard.id, draggedFromColumn, columnId)
    }
    
    setDraggedCard(null)
    setDraggedFromColumn(null)
  }

  if (loading) {
    return (
      <KanbanSkeleton 
        columns={columns.length} 
        cardsPerColumn={3}
        className={className}
      />
    )
  }

  return (
    <div className={cn("w-full h-full", className)}>
      <div className="flex space-x-4 overflow-x-auto pb-4 h-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {columns.map((column) => (
          <motion.div
            key={column.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0 w-80"
          >
            <div 
              className="h-full border border-gray-200 rounded-lg"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(column.id)}
            >
              <CardHeader className={cn("pb-3", column.bgColor)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", column.color)}>
                      <div className="w-4 h-4 bg-white rounded" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">{column.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">{column.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge  className="text-xs">
                      {column.cards.length}{column.maxCards && `/${column.maxCards}`}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCardCreate?.(column.id)}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    <AnimatePresence>
                      {column.cards.map((card) => (
                        <motion.div
                          key={card.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          draggable={enableDragAndDrop}
                          onDragStart={() => handleDragStart(card, column.id)}
                          onDragEnd={handleDragEnd}
                          className={cn(
                            "p-3 border rounded-lg cursor-pointer transition-all duration-200",
                            "hover:shadow-md hover:border-primary/50",
                            "bg-white border-gray-200"
                          )}
                          onClick={() => onCardClick?.(card, column)}
                        >
                          <div className="space-y-3">
                            {/* Card Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-gray-900 truncate">
                                  {card.title}
                                </h4>
                                {card.description && (
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {card.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center space-x-1 ml-2">
                                {getStatusIcon(card.status)}
                              </div>
                            </div>

                            {/* Status and Priority Badges */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1">
                                {getStatusBadge(card.status)}
                                {getPriorityBadge(card.priority)}
                              </div>
                            </div>

                            {/* Card Metadata */}
                            <div className="space-y-2">
                              {card.assignee && (
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  <div className={cn("w-4 h-4 rounded-full flex items-center justify-center", column.color)}>
                                    <User className="h-2.5 w-2.5 text-white" />
                                  </div>
                                  <span className="truncate">{card.assignee}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <div className={cn("w-4 h-4 rounded-full flex items-center justify-center", column.color)}>
                                  <Calendar className="h-2.5 w-2.5 text-white" />
                                </div>
                                <span>{new Date(card.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end space-x-2 pt-2 border-t">
                              <Button
                                
                                size="sm"
                                className="h-7 px-2 rounded-md"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onCardClick?.(card, column)
                                }}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                
                                size="sm"
                                className="h-7 px-2 rounded-md"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onCardEdit?.(card, column)
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    
                                    size="sm"
                                    className="h-7 px-2 rounded-md"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onCardDelete?.(card, column)
                                    }}
                                    className="text-red-600"
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Empty State */}
                    {column.cards.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <div className={cn("w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center", column.color)}>
                          <div className="w-4 h-4 bg-white rounded" />
                        </div>
                        <p className="text-sm">No cards in this column</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCardCreate?.(column.id)}
                          className="mt-2"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Card
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
    </div>
  )
}

// Default kanban columns for various processes
export const defaultKanbanColumns: KanbanColumn[] = [
  {
    id: "todo",
    title: "To Do",
    description: "Tasks to be completed",
    color: "bg-gray-500",
    bgColor: "bg-gray-50",
    cards: []
  },
  {
    id: "in-progress",
    title: "In Progress",
    description: "Tasks currently being worked on",
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    cards: []
  },
  {
    id: "review",
    title: "Review",
    description: "Tasks pending review",
    color: "bg-yellow-500",
    bgColor: "bg-yellow-50",
    cards: []
  },
  {
    id: "completed",
    title: "Completed",
    description: "Finished tasks",
    color: "bg-green-500",
    bgColor: "bg-green-50",
    cards: []
  }
]
