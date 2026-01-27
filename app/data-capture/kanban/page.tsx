"use client"

import { useState, useEffect } from "react"
import { DataCaptureDashboardLayout } from "@/components/layout/data-capture-dashboard-layout"
import { KanbanBoard, KanbanColumn, KanbanCard } from "@/components/ui/kanban-board"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Filter, 
  Search, 
  Download,
  Upload,
  RefreshCw,
  Settings,
  BarChart3,
  Calendar,
  Users,
  Clock
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function KanbanPage() {
  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  // Sample data for demonstration
  const sampleColumns: KanbanColumn[] = [
    {
      id: "raw-milk-intake",
      title: "Raw Milk Intake",
      description: "Initial milk collection and quality assessment",
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      cards: [
        {
          id: "1",
          title: "Morning Milk Collection",
          description: "Collect and test morning milk batch",
          status: "active",
          priority: "high",
          assignee: "John Smith",
          createdAt: "2024-01-15T08:00:00Z",
          updatedAt: "2024-01-15T08:00:00Z"
        },
        {
          id: "2",
          title: "Quality Testing",
          description: "Perform quality tests on collected milk",
          status: "pending",
          priority: "medium",
          assignee: "Jane Doe",
          createdAt: "2024-01-15T09:00:00Z",
          updatedAt: "2024-01-15T09:00:00Z"
        }
      ]
    },
    {
      id: "pasteurizing",
      title: "Pasteurizing",
      description: "Heat treatment and pasteurization process",
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      cards: [
        {
          id: "3",
          title: "Batch 001 Pasteurization",
          description: "Pasteurize batch 001 at 72°C for 15 seconds",
          status: "completed",
          priority: "high",
          assignee: "Mike Johnson",
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-15T10:30:00Z"
        }
      ]
    },
    {
      id: "packaging",
      title: "Packaging",
      description: "Filling and packaging operations",
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      cards: [
        {
          id: "4",
          title: "Line 1 Packaging",
          description: "Package pasteurized milk in 1L containers",
          status: "active",
          priority: "high",
          assignee: "Sarah Wilson",
          createdAt: "2024-01-15T11:00:00Z",
          updatedAt: "2024-01-15T11:00:00Z"
        },
        {
          id: "5",
          title: "Quality Check",
          description: "Final quality inspection before shipping",
          status: "pending",
          priority: "medium",
          assignee: "Tom Brown",
          createdAt: "2024-01-15T12:00:00Z",
          updatedAt: "2024-01-15T12:00:00Z"
        }
      ]
    },
    {
      id: "shipping",
      title: "Shipping",
      description: "Final packaging and distribution",
      color: "bg-green-500",
      bgColor: "bg-green-50",
      cards: [
        {
          id: "6",
          title: "Batch 001 Shipping",
          description: "Prepare batch 001 for distribution",
          status: "pending",
          priority: "low",
          assignee: "Lisa Davis",
          createdAt: "2024-01-15T13:00:00Z",
          updatedAt: "2024-01-15T13:00:00Z"
        }
      ]
    }
  ]

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setColumns(sampleColumns)
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const handleCardClick = (card: KanbanCard, column: KanbanColumn) => {
    toast.info(`Clicked on ${card.title} in ${column.title}`)
  }

  const handleCardEdit = (card: KanbanCard, column: KanbanColumn) => {
    toast.info(`Edit ${card.title} in ${column.title}`)
  }

  const handleCardDelete = (card: KanbanCard, column: KanbanColumn) => {
    toast.success(`Deleted ${card.title} from ${column.title}`)
    // Remove card from column
    setColumns(prev => prev.map(col => 
      col.id === column.id 
        ? { ...col, cards: col.cards.filter(c => c.id !== card.id) }
        : col
    ))
  }

  const handleCardCreate = (columnId: string) => {
    const column = columns.find(col => col.id === columnId)
    if (!column) return

    const newCard: KanbanCard = {
      id: Date.now().toString(),
      title: `New Task in ${column.title}`,
      description: "This is a new task created from the kanban board",
      status: "pending",
      priority: "medium",
      assignee: "Current User",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setColumns(prev => prev.map(col => 
      col.id === columnId 
        ? { ...col, cards: [...col.cards, newCard] }
        : col
    ))

    toast.success(`Created new task in ${column.title}`)
  }

  const handleCardMove = (cardId: string, fromColumnId: string, toColumnId: string) => {
    const fromColumn = columns.find(col => col.id === fromColumnId)
    const toColumn = columns.find(col => col.id === toColumnId)
    
    if (!fromColumn || !toColumn) return

    const card = fromColumn.cards.find(c => c.id === cardId)
    if (!card) return

    setColumns(prev => prev.map(col => {
      if (col.id === fromColumnId) {
        return { ...col, cards: col.cards.filter(c => c.id !== cardId) }
      }
      if (col.id === toColumnId) {
        return { ...col, cards: [...col.cards, { ...card, updatedAt: new Date().toISOString() }] }
      }
      return col
    }))

    toast.success(`Moved ${card.title} from ${fromColumn.title} to ${toColumn.title}`)
  }

  const filteredColumns = columns.map(column => ({
    ...column,
    cards: column.cards.filter(card => 
      card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.assignee?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }))

  const totalCards = columns.reduce((sum, col) => sum + col.cards.length, 0)
  const activeCards = columns.reduce((sum, col) => 
    sum + col.cards.filter(card => card.status === 'active').length, 0
  )
  const completedCards = columns.reduce((sum, col) => 
    sum + col.cards.filter(card => card.status === 'completed').length, 0
  )

  return (
    <DataCaptureDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Process Kanban Board</h1>
            <p className="text-muted-foreground">
              Visualize and manage your production processes with drag-and-drop functionality
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button  size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button  size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button  size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCards}</div>
              <p className="text-xs text-muted-foreground">
                Across all columns
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCards}</div>
              <p className="text-xs text-muted-foreground">
                Currently in progress
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCards}</div>
              <p className="text-xs text-muted-foreground">
                Successfully finished
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                Active team members
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <Button  size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button  size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="h-[calc(100vh-400px)]">
          <KanbanBoard
            columns={filteredColumns}
            onCardClick={handleCardClick}
            onCardEdit={handleCardEdit}
            onCardDelete={handleCardDelete}
            onCardCreate={handleCardCreate}
            onCardMove={handleCardMove}
            loading={loading}
            enableDragAndDrop={true}
            className="h-full"
          />
        </div>
      </div>
    </DataCaptureDashboardLayout>
  )
}
