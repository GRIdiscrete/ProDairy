"use client"

import { useState, useEffect } from 'react'
import { OfflineDataService, OfflineDriver, OfflineRawMaterial, OfflineSupplier, OfflineDriverForm } from '@/lib/offline/database'
import { SyncService } from '@/lib/offline/sync-service'
import { DataSyncService } from '@/lib/offline/data-sync'
import { useAppDispatch, useAppSelector } from '@/lib/store'
import { fetchUsers } from '@/lib/store/slices/usersSlice'
import { fetchRawMaterials } from '@/lib/store/slices/rawMaterialSlice'
import { fetchSuppliers } from '@/lib/store/slices/supplierSlice'
import { useNetworkStatus } from './use-network-status'

export function useOfflineData() {
  const [drivers, setDrivers] = useState<OfflineDriver[]>([])
  const [rawMaterials, setRawMaterials] = useState<OfflineRawMaterial[]>([])
  const [suppliers, setSuppliers] = useState<OfflineSupplier[]>([])
  const [driverForms, setDriverForms] = useState<OfflineDriverForm[]>([])
  const [loading, setLoading] = useState(false)
  
  // Use our custom network status hook
  const { isOnline, checkNetworkConnectivity } = useNetworkStatus()
  
  const dispatch = useAppDispatch()
  const { items: onlineUsers } = useAppSelector((state) => state.users)
  const { rawMaterials: onlineRawMaterials } = useAppSelector((state) => state.rawMaterial)
  const { suppliers: onlineSuppliers } = useAppSelector((state) => state.supplier)

  useEffect(() => {
    // Load offline data immediately
    loadOfflineData()

    // Set up online/offline event handlers
    const handleOnline = async () => {
      // Double-check we're actually online
      const actuallyOnline = await checkNetworkConnectivity()
      if (actuallyOnline) {
        // Sync data when coming back online
        syncDataWhenOnline()
      }
    }

    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  // Sync data when coming back online
  const syncDataWhenOnline = async () => {
    if (isOnline && onlineUsers.length > 0 && onlineRawMaterials.length > 0 && onlineSuppliers.length > 0) {
      try {
        await DataSyncService.syncAllReferenceData({
          drivers: onlineUsers,
          rawMaterials: onlineRawMaterials,
          suppliers: onlineSuppliers
        })
        await loadOfflineData()
      } catch (error) {
        console.error('Error syncing data:', error)
      }
    }
  }

  const loadOfflineData = async () => {
    setLoading(true)
    try {
      const [driversData, materialsData, suppliersData, formsData] = await Promise.all([
        OfflineDataService.getDrivers(),
        OfflineDataService.getRawMaterials(),
        OfflineDataService.getSuppliers(),
        OfflineDataService.getDriverForms()
      ])

      setDrivers(driversData)
      setRawMaterials(materialsData)
      setSuppliers(suppliersData)
      setDriverForms(formsData)
    } catch (error) {
      console.error('Error loading offline data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveDriverForm = async (form: Omit<OfflineDriverForm, 'id' | 'created_at' | 'updated_at' | 'sync_status'>) => {
    const newForm: OfflineDriverForm = {
      ...form,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sync_status: 'pending'
    }

    await OfflineDataService.saveDriverForm(newForm)
    await loadOfflineData()
    return newForm
  }

  const updateDriverForm = async (id: string, form: Partial<OfflineDriverForm>) => {
    await OfflineDataService.updateDriverForm(id, {
      ...form,
      updated_at: new Date().toISOString()
    })
    await loadOfflineData()
  }

  const deleteDriverForm = async (id: string) => {
    await OfflineDataService.deleteDriverForm(id)
    await loadOfflineData()
  }

  const getPendingForms = async () => {
    return await OfflineDataService.getPendingDriverForms()
  }

  const getSyncStatus = async () => {
    return await SyncService.getSyncStatus()
  }

  return {
    drivers,
    rawMaterials,
    suppliers,
    driverForms,
    isOnline,
    loading,
    saveDriverForm,
    updateDriverForm,
    deleteDriverForm,
    getPendingForms,
    getSyncStatus,
    refreshData: loadOfflineData
  }
}
