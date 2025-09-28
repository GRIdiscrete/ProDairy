"use client"

import { useEffect } from "react"
// Removed Card imports - using divs instead
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { fetchUsers } from "@/lib/store/slices/usersSlice"
import { fetchMachines } from "@/lib/store/slices/machineSlice"
import { fetchSilos } from "@/lib/store/slices/siloSlice"
import { fetchTankers } from "@/lib/store/slices/tankerSlice"
import { Users, Cpu, Database, Truck, Activity, Wrench, Gauge } from "lucide-react"

// Skeleton loader component
const CardSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <div className="flex flex-row items-center justify-between mb-4">
      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
      <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
    </div>
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-24"></div>
    </div>
  </div>
)

export function AdminOverviewCards() {
  const dispatch = useAppDispatch()
  
  // Get data from different slices
  const { items: users, loading: usersLoading } = useAppSelector((state) => state.users)
  const { machines, loading: machinesLoading } = useAppSelector((state) => state.machine)
  const { silos, loading: silosLoading } = useAppSelector((state) => state.silo)
  const { items: tankers, operationLoading: tankersLoading } = useAppSelector((state) => (state as any).tankers)

  // Load data on component mount
  useEffect(() => {
    dispatch(fetchUsers({}))
    dispatch(fetchMachines({}))
    dispatch(fetchSilos({}))
    dispatch(fetchTankers())
  }, [dispatch])

  const isLoading = usersLoading || machinesLoading || silosLoading || tankersLoading.fetch

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Calculate metrics
  const totalUsers = users?.length || 0
  const totalMachines = machines?.length || 0
  const totalSilos = silos?.length || 0
  const totalTankers = tankers?.length || 0

  const activeMachines = machines?.filter(m => m.status === 'active').length || 0
  const maintenanceMachines = machines?.filter(m => m.status === 'maintenance').length || 0
  const activeSilos = silos?.filter(s => s.status === 'active').length || 0
  const totalCapacity = silos?.reduce((total, s) => total + (s.capacity || 0), 0) || 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Users Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-300 cursor-pointer">
        <div className="flex flex-row items-center justify-between mb-4">
          <h3 className="text-sm text-gray-600">Total Users</h3>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Users className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="text-3xl text-gray-900">{totalUsers}</div>
        <p className="text-xs text-gray-500 mt-1">System users</p>
      </div>

      {/* Machines Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/20 hover:border-gray-400 cursor-pointer">
        <div className="flex flex-row items-center justify-between mb-4">
          <h3 className="text-sm text-gray-600">Total Machines</h3>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center">
            <Cpu className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="text-3xl text-gray-900">{totalMachines}</div>
        <p className="text-xs text-gray-500 mt-1">Production machines</p>
      </div>

      {/* Active Machines Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 hover:border-green-300 cursor-pointer">
        <div className="flex flex-row items-center justify-between mb-4">
          <h3 className="text-sm text-gray-600">Active Machines</h3>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Activity className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="text-3xl text-green-600">{activeMachines}</div>
        <p className="text-xs text-gray-500 mt-1">Currently operational</p>
      </div>

      {/* Maintenance Machines Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20 hover:border-yellow-300 cursor-pointer">
        <div className="flex flex-row items-center justify-between mb-4">
          <h3 className="text-sm text-gray-600">Maintenance</h3>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
            <Wrench className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="text-3xl text-yellow-600">{maintenanceMachines}</div>
        <p className="text-xs text-gray-500 mt-1">Under maintenance</p>
      </div>

      {/* Silos Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 hover:border-indigo-300 cursor-pointer">
        <div className="flex flex-row items-center justify-between mb-4">
          <h3 className="text-sm text-gray-600">Total Silos</h3>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
            <Database className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="text-3xl text-gray-900">{totalSilos}</div>
        <p className="text-xs text-gray-500 mt-1">Storage units</p>
      </div>

      {/* Active Silos Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 hover:border-green-300 cursor-pointer">
        <div className="flex flex-row items-center justify-between mb-4">
          <h3 className="text-sm text-gray-600">Active Silos</h3>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <Activity className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="text-3xl text-green-600">{activeSilos}</div>
        <p className="text-xs text-gray-500 mt-1">Currently active</p>
      </div>

      {/* Total Capacity Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 hover:border-cyan-300 cursor-pointer">
        <div className="flex flex-row items-center justify-between mb-4">
          <h3 className="text-sm text-gray-600">Total Capacity</h3>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Gauge className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="text-3xl text-blue-600">
          {totalCapacity.toLocaleString()}L
        </div>
        <p className="text-xs text-gray-500 mt-1">Storage capacity</p>
      </div>

      {/* Tankers Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/20 hover:border-teal-300 cursor-pointer">
        <div className="flex flex-row items-center justify-between mb-4">
          <h3 className="text-sm text-gray-600">Total Tankers</h3>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
            <Truck className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="text-3xl text-gray-900">{totalTankers}</div>
        <p className="text-xs text-gray-500 mt-1">Vehicle tankers</p>
      </div>
    </div>
  )
}
