/**
 * Tablet Dashboard Page
 * 
 * Optimized dashboard for tablets in landscape mode.
 * Shows all the key data entry modules in a tablet-friendly layout.
 */

"use client"

import { useState } from 'react'
import { TabletDashboardLayout } from '@/components/layout/tablet-dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ClipboardList, 
  Truck, 
  Wrench, 
  Home,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Package
} from 'lucide-react'
import { motion } from 'framer-motion'

const productionStages = [
  { id: 1, name: 'Raw Milk Intake', status: 'active', icon: Package, color: 'bg-blue-500' },
  { id: 2, name: 'Standardizing', status: 'pending', icon: TrendingUp, color: 'bg-yellow-500' },
  { id: 3, name: 'Pasteurizing', status: 'pending', icon: Clock, color: 'bg-orange-500' },
  { id: 4, name: 'Filmatic Lines Form 1', status: 'pending', icon: ClipboardList, color: 'bg-green-500' },
  { id: 5, name: 'Process Log', status: 'pending', icon: ClipboardList, color: 'bg-blue-500' },
  { id: 6, name: 'Filmatic Lines 2', status: 'pending', icon: ClipboardList, color: 'bg-blue-500' },
  { id: 7, name: 'Palletizer', status: 'pending', icon: Package, color: 'bg-[#A0D001]' },
  { id: 8, name: 'Incubation', status: 'pending', icon: Clock, color: 'bg-teal-500' },
  { id: 9, name: 'Test', status: 'pending', icon: CheckCircle, color: 'bg-red-500' },
  { id: 10, name: 'QA Corrective Measures', status: 'pending', icon: AlertCircle, color: 'bg-gray-500' },
  { id: 11, name: 'Dispatch', status: 'pending', icon: Truck, color: 'bg-emerald-500' },
]

const quickActions = [
  { name: 'Raw Milk Intake', icon: Package, href: '/data-capture/raw-milk-intake', color: 'bg-blue-500' },
  { name: 'Standardizing', icon: TrendingUp, href: '/data-capture/standardizing', color: 'bg-yellow-500' },
  { name: 'Pasteurizing', icon: Clock, href: '/data-capture/pasteurizing', color: 'bg-orange-500' },
  { name: 'Process Log', icon: ClipboardList, href: '/data-capture/process-log', color: 'bg-blue-500' },
  { name: 'Driver Forms', icon: Truck, href: '/drivers/forms', color: 'bg-green-500' },
  { name: 'Tools', icon: Wrench, href: '/tools', color: 'bg-gray-500' },
]

export default function TabletDashboard() {
  const [currentModule, setCurrentModule] = useState('data-capture')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4" />
      case 'pending': return <AlertCircle className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <TabletDashboardLayout 
      currentModule={currentModule}
      onModuleChange={setCurrentModule}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ProDairy Production Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Tablet-optimized data entry system
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                asChild
                className="h-20 flex flex-col items-center space-y-2 bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
                
              >
                <a href={action.href}>
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {action.name}
                  </span>
                </a>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Production Flow */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <span>Production Flow</span>
            </CardTitle>
            <CardDescription>
              Current production stages and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {productionStages.map((stage, index) => (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`cursor-pointer hover:shadow-md transition-shadow ${
                    stage.status === 'active' ? 'ring-2 ring-blue-500' : ''
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${stage.color}`}>
                          <stage.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {stage.name}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getStatusColor(stage.status)}`}
                            >
                              {getStatusIcon(stage.status)}
                              <span className="ml-1 capitalize">{stage.status}</span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Active Processes', value: '3', icon: Clock, color: 'text-blue-600' },
            { title: 'Completed Today', value: '12', icon: CheckCircle, color: 'text-green-600' },
            { title: 'Pending QA', value: '5', icon: AlertCircle, color: 'text-yellow-600' },
            { title: 'Total Users', value: '24', icon: Users, color: 'text-blue-600' },
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg bg-gray-100`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </TabletDashboardLayout>
  )
}
