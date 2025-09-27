"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SharedLayout } from "@/components/layout/shared-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Truck, ClipboardList, ArrowRight, Wrench } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  return (
    <SharedLayout title="ProDairy Production Management Portal" subtitle="Choose your dashboard to get started">
      <div className="h-screen overflow-hidden flex items-center justify-center bg-white">
        <div className=" w-full px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ProDairy Production Management Portal
            </h1>
            <p className="text-xl text-gray-600">
              Choose your dashboard to get started
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-stretch justify-items-stretch">
            {/* Admin Dashboard */}
            <Card className="h-full w-full flex flex-col hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-purple-200">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">🧑‍💻 Admin Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="text-center flex flex-col flex-1">
                <ul className="text-xs text-gray-500 space-y-1.5 mb-4">
                  <li>• Users & Roles Management</li>
                  <li>• Machines & Silos Configuration</li>
                  <li>• Production Planning</li>
                  <li>• Audit Trails</li>
                </ul>
                <Button 
                  className="w-full group-hover:bg-purple-600 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg"
                  onClick={() => router.push('/admin')}
                >
                  Access Admin Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </CardContent>
            </Card>

            {/* Drivers UI */}
            <Card className="h-full w-full flex flex-col hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-orange-200">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">🚚 Drivers UI</CardTitle>
              </CardHeader>
              <CardContent className="text-center flex flex-col flex-1">
                <ul className="text-xs text-gray-500 space-y-1.5 mb-4">
                  <li>• Driver Forms Submission</li>
                  <li>• Route Planning Tools</li>
                  <li>• Delivery Tracking</li>
                  <li>• Vehicle Management</li>
                </ul>
                <Button 
                  className="w-full group-hover:bg-orange-600 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg"
                  onClick={() => router.push('/drivers')}
                >
                  Access Drivers UI
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </CardContent>
            </Card>

            {/* Data Capture UI */}
            <Card className="h-full w-full flex flex-col hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-green-200">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-lime-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ClipboardList className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">📋 Data Capturers</CardTitle>
              </CardHeader>
              <CardContent className="text-center flex flex-col flex-1">
                <ul className="text-xs text-gray-500 space-y-1.5 mb-4">
                  <li>• Data Entry Interface</li>
                  <li>• Operator Forms</li>
                  <li>• Lab Test Forms</li>
                  <li>• Quality Control</li>
                </ul>
                <Button 
                  className="w-full group-hover:bg-green-600 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg"
                  onClick={() => router.push('/data-capture')}
                >
                  Access Data Capture UI
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </CardContent>
            </Card>

            {/* Tools UI */}
            <Card className="h-full w-full flex flex-col hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-blue-200">
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Wrench className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">🛠️ Tools</CardTitle>
              </CardHeader>
              <CardContent className="text-center flex flex-col flex-1">
                <ul className="text-xs text-gray-500 space-y-1.5 mb-4">
                  <li>• Bulk Milk Transfer</li>
                  <li>• CIP Control Form</li>
                  <li>• IST Control Form</li>
                </ul>
                <Button 
                  className="w-full group-hover:bg-blue-600 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-lg"
                  onClick={() => router.push('/tools')}
                >
                  Access Tools
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SharedLayout>
  )
}
