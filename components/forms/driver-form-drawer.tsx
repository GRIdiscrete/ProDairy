"use client"

import { useEffect, useState } from "react"
import { useForm, SubmitHandler, Controller, useFieldArray } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Truck, User, Package, Plus, Trash2, Wifi, WifiOff } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DatePicker } from "@/components/ui/date-picker"
import { SignaturePad } from "@/components/ui/signature-pad"
import { SignatureModal } from "@/components/ui/signature-modal"
import { SignatureViewer } from "@/components/ui/signature-viewer"
import { base64ToPngDataUrl } from "@/lib/utils/signature"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { createDriverForm, updateDriverForm, fetchDriverForms } from "@/lib/store/slices/driverFormSlice"
import { fetchRawMaterials } from "@/lib/store/slices/rawMaterialSlice"
import { fetchUsers } from "@/lib/store/slices/usersSlice"
import { fetchSuppliers } from "@/lib/store/slices/supplierSlice"
import { LoadingButton } from "@/components/ui/loading-button"
import { useOfflineData } from "@/hooks/use-offline-data"
import { LocalStorageService } from "@/lib/offline/local-storage-service"
import { generateDriverFormId } from "@/lib/utils/form-id-generator"
import type { DriverForm, DriverFormCollectedProduct } from "@/lib/types"
import type { OfflineDriverForm } from "@/lib/offline/database"

// Unified form type
type UnifiedForm = DriverForm | OfflineDriverForm

const driverFormSchema = yup.object({
  driver: yup.string().required("Driver is required"),
  start_date: yup.string().required("Start date is required"),
  end_date: yup.string().required("End date is required"),
  delivered: yup.boolean(),
  rejected: yup.boolean(),
  drivers_form_collected_products: yup.array().of(
    yup.object({
      raw_material_id: yup.string().required("Raw material is required"),
      supplier_id: yup.string().required("Supplier is required"),
      collected_amount: yup.number().positive("Amount must be positive").required("Amount is required"),
      unit_of_measure: yup.string().required("Unit of measure is required"),
      e_sign_supplier: yup.string().required("Supplier signature is required"),
      e_sign_driver: yup.string().required("Driver signature is required"),
    })
  ),
})

type DriverFormFormData = {
  driver: string
  start_date: string
  end_date: string
  delivered: boolean
  rejected: boolean
  drivers_form_collected_products: DriverFormCollectedProduct[]
}

interface DriverFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  driverForm?: UnifiedForm
  mode: "create" | "edit"
  onSuccess?: () => void
}

export function DriverFormDrawer({ 
  open, 
  onOpenChange, 
  driverForm, 
  mode, 
  onSuccess 
}: DriverFormDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [supplierSignatureOpen, setSupplierSignatureOpen] = useState(false)
  const [driverSignatureOpen, setDriverSignatureOpen] = useState(false)
  const [supplierSignatureViewOpen, setSupplierSignatureViewOpen] = useState(false)
  const [driverSignatureViewOpen, setDriverSignatureViewOpen] = useState(false)
  const [currentSignatureIndex, setCurrentSignatureIndex] = useState<number | null>(null)
  const [currentSignatureType, setCurrentSignatureType] = useState<'supplier' | 'driver' | null>(null)
  const dispatch = useAppDispatch()
  const isMobile = useIsMobile()
  const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024

  // Use offline data hook
  const { 
    drivers: offlineDrivers, 
    rawMaterials: offlineRawMaterials, 
    suppliers: offlineSuppliers, 
    isOnline, 
    saveDriverForm: saveOfflineForm,
    loading: offlineLoading 
  } = useOfflineData()

  const { operationLoading } = useAppSelector((state) => state.driverForm)
  const { rawMaterials, operationLoading: rawMaterialLoading } = useAppSelector((state) => state.rawMaterial)
  const { items: users, loading: usersLoading } = useAppSelector((state) => state.users)
  const { suppliers, operationLoading: suppliersLoading } = useAppSelector((state) => state.supplier)

  // Get offline data from localStorage
  const [offlineData, setOfflineData] = useState({
    drivers: LocalStorageService.getDrivers(),
    rawMaterials: LocalStorageService.getRawMaterials(),
    suppliers: LocalStorageService.getSuppliers()
  })

  // Use offline data when offline, online data when online
  const drivers = isOnline ? users : offlineData.drivers
  const rawMaterialsData = isOnline ? rawMaterials : offlineData.rawMaterials
  const suppliersData = isOnline ? suppliers : offlineData.suppliers
  
  // Fix loading states - handle different loading state structures
  const dataLoading = isOnline ? (
    rawMaterialLoading.fetch || 
    usersLoading || 
    suppliersLoading.fetch
  ) : false
  
  // Debug logging
  console.log('Driver Form Debug:', {
    isOnline,
    usersCount: users?.length || 0,
    rawMaterialsCount: rawMaterials?.length || 0,
    suppliersCount: suppliers?.length || 0,
    offlineDriversCount: offlineData.drivers?.length || 0,
    offlineMaterialsCount: offlineData.rawMaterials?.length || 0,
    offlineSuppliersCount: offlineData.suppliers?.length || 0,
    driversCount: drivers?.length || 0,
    rawMaterialsDataCount: rawMaterialsData?.length || 0,
    suppliersDataCount: suppliersData?.length || 0,
    dataLoading,
    usersLoading,
    rawMaterialLoading,
    suppliersLoading
  })
  
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<DriverFormFormData>({
    resolver: yupResolver(driverFormSchema) as any,
    defaultValues: {
      driver: "",
      start_date: "",
      end_date: "",
      delivered: false,
      rejected: false,
      drivers_form_collected_products: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "drivers_form_collected_products",
  })

  // Load required data on component mount
  useEffect(() => {
    console.log('Driver Form useEffect triggered:', { open, isOnline })
    if (open && isOnline) {
      console.log('Fetching online data...')
      dispatch(fetchRawMaterials({}))
      dispatch(fetchUsers({}))
      dispatch(fetchSuppliers({}))
    } else if (open && !isOnline) {
      console.log('Loading offline data...')
      // Refresh offline data from localStorage
      setOfflineData({
        drivers: LocalStorageService.getDrivers(),
        rawMaterials: LocalStorageService.getRawMaterials(),
        suppliers: LocalStorageService.getSuppliers()
      })
    }
  }, [dispatch, open, isOnline])

  // Also load data when component mounts, regardless of drawer state
  useEffect(() => {
    console.log('Initial data load useEffect triggered:', { isOnline })
    if (isOnline) {
      console.log('Initial fetch of online data...')
      dispatch(fetchRawMaterials({}))
      dispatch(fetchUsers({}))
      dispatch(fetchSuppliers({}))
    } else {
      console.log('Initial load of offline data...')
      setOfflineData({
        drivers: LocalStorageService.getDrivers(),
        rawMaterials: LocalStorageService.getRawMaterials(),
        suppliers: LocalStorageService.getSuppliers()
      })
    }
  }, [dispatch, isOnline])

  // Force data load when drawer opens if no data is available
  useEffect(() => {
    if (open && isOnline && (users.length === 0 || rawMaterials.length === 0 || suppliers.length === 0)) {
      console.log('Force loading data because some data is missing...')
      dispatch(fetchRawMaterials({}))
      dispatch(fetchUsers({}))
      dispatch(fetchSuppliers({}))
    }
  }, [open, isOnline, users.length, rawMaterials.length, suppliers.length, dispatch])

  // Update offline data when online status changes
  useEffect(() => {
    if (!isOnline) {
      setOfflineData({
        drivers: LocalStorageService.getDrivers(),
        rawMaterials: LocalStorageService.getRawMaterials(),
        suppliers: LocalStorageService.getSuppliers()
      })
    }
  }, [isOnline])

  // Reset form when driver form changes or mode changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && driverForm) {
        setValue("driver", typeof driverForm.driver === 'string' ? driverForm.driver : (driverForm as any).driver_id || driverForm.driver)
        setValue("start_date", driverForm.start_date.split('T')[0])
        setValue("end_date", driverForm.end_date.split('T')[0])
        setValue("delivered", driverForm.delivered)
        setValue("rejected", driverForm.rejected)
        setValue("drivers_form_collected_products", driverForm.drivers_form_collected_products || [])
      } else {
        reset({
          driver: "",
          start_date: "",
          end_date: "",
          delivered: false,
          rejected: false,
          drivers_form_collected_products: [],
        })
      }
    }
  }, [open, mode, driverForm, setValue, reset])

  const onSubmit: SubmitHandler<DriverFormFormData> = async (data) => {
    try {
      setLoading(true)
      
      const submitData = {
        ...data,
        start_date: new Date(data.start_date).toISOString(),
        end_date: new Date(data.end_date).toISOString(),
      }

      if (isOnline) {
        // Online mode - submit to API
        if (mode === "create") {
          await dispatch(createDriverForm(submitData)).unwrap()
          toast.success("Driver form created successfully")
        } else if (driverForm) {
          await dispatch(updateDriverForm({
            ...submitData,
            id: driverForm.id,
            updated_at: new Date().toISOString(),
          })).unwrap()
          toast.success("Driver form updated successfully")
        }

        // Refresh the driver forms list
        dispatch(fetchDriverForms({}))
      } else {
        // Offline mode - save to localStorage
        if (mode === "create") {
          const offlineFormData = {
            driver_id: submitData.driver,
            start_date: submitData.start_date,
            end_date: submitData.end_date,
            delivered: submitData.delivered,
            rejected: submitData.rejected,
            drivers_form_collected_products: submitData.drivers_form_collected_products
          }
          LocalStorageService.saveDriverForm(offlineFormData)
          toast.success("Driver form saved offline. It will be synced when you're back online.")
        } else if (driverForm) {
          const offlineFormData = {
            ...driverForm,
            driver_id: submitData.driver,
            start_date: submitData.start_date,
            end_date: submitData.end_date,
            delivered: submitData.delivered,
            rejected: submitData.rejected,
            drivers_form_collected_products: submitData.drivers_form_collected_products
          }
          LocalStorageService.updateDriverForm(offlineFormData)
          toast.success("Driver form updated offline. It will be synced when you're back online.")
          toast.info("Offline editing not yet implemented")
        }
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      const message = error?.message || "An error occurred"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const addCollectedProduct = () => {
    append({
      raw_material_id: "",
      supplier_id: "",
      collected_amount: 0,
      unit_of_measure: "Kilograms",
      e_sign_supplier: "",
      e_sign_driver: "",
    })
  }

  const isLoading = loading || !!operationLoading.create || !!operationLoading.update || (typeof dataLoading === 'boolean' ? dataLoading : false)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile || isTablet ? "bottom" : "right"}
        className="tablet-sheet-full p-0 bg-white"
      >
        <SheetHeader className={isMobile || isTablet ? "p-6 pb-0 bg-white" : "mb-6"}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <Truck className="w-4 h-4 text-white" />
              </div>
              <div>
                <SheetTitle className="text-lg font-light m-0">
                  {mode === "create" ? "Add New Driver Form" : `Edit Driver Form: ${generateDriverFormId(driverForm?.created_at || new Date().toISOString())}`}
                </SheetTitle>
                <SheetDescription className="text-sm font-light">
                  {mode === "create" 
                    ? "Create a new driver collection form" 
                    : "Update driver form information"}
                </SheetDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <Wifi className="h-4 w-4" />
                  <span className="text-xs font-light">Online</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-orange-600">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-xs font-light">Offline</span>
                </div>
              )}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  console.log('Manual data refresh triggered')
                  if (isOnline) {
                    dispatch(fetchRawMaterials({}))
                    dispatch(fetchUsers({}))
                    dispatch(fetchSuppliers({}))
                  } else {
                    setOfflineData({
                      drivers: LocalStorageService.getDrivers(),
                      rawMaterials: LocalStorageService.getRawMaterials(),
                      suppliers: LocalStorageService.getSuppliers()
                    })
                  }
                }}
                className="text-xs"
              >
                Refresh Data
              </Button>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className={isMobile || isTablet ? "space-y-6 p-6" : "space-y-6"}>
          <div className="border border-gray-200 rounded-lg bg-white">
            <div className="p-6 pb-0">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <div className="text-lg font-light">Driver Information</div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="driver" className="font-light">Driver *</Label>
                  <Controller
                    name="driver"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                        <SelectTrigger className="w-full rounded-full border-gray-200">
                          <SelectValue placeholder="Select driver" />
                        </SelectTrigger>
            <SelectContent>
              {dataLoading ? (
                <SelectItem value="loading" disabled>Loading users...</SelectItem>
              ) : drivers.length === 0 ? (
                <SelectItem value="no-data" disabled>No users available</SelectItem>
              ) : (
                drivers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex flex-col">
                      <span className="font-light">{user.first_name} {user.last_name}</span>
                      {user.email && (
                        <span className="text-xs text-gray-500 font-light">{user.email}</span>
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.driver && (
                    <p className="text-sm text-red-500 font-light">{errors.driver.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Controller
                      name="start_date"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          label="Start Date *"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select start date"
                          disabled={isSubmitting}
                          error={!!errors.start_date}
                        />
                      )}
                    />
                    {errors.start_date && (
                      <p className="text-sm text-red-500 font-light">{errors.start_date.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Controller
                      name="end_date"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          label="End Date *"
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select end date"
                          disabled={isSubmitting}
                          error={!!errors.end_date}
                        />
                      )}
                    />
                    {errors.end_date && (
                      <p className="text-sm text-red-500 font-light">{errors.end_date.message}</p>
                    )}
                  </div>
                </div>


              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg bg-white m-6">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <div className="text-lg font-light">Collected Products</div>
                </div>
                <Button
                  type="button"
                  onClick={addCollectedProduct}
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {fields.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-light">No collected products added yet</p>
                  <p className="text-sm font-light">Click "Add Product" to get started</p>
                </div>
              ) : (
                <div className="space-y-6 max-h-96 overflow-y-auto">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border border-gray-200 rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-light">Product #{index + 1}</h4>
                        <Button
                          type="button"
                          onClick={() => remove(index)}
                          size="sm"
                          variant="destructive"
                          disabled={isSubmitting}
                          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 rounded-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="font-light">Raw Material *</Label>
                            <Controller
                              name={`drivers_form_collected_products.${index}.raw_material_id`}
                              control={control}
                              render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                                  <SelectTrigger className="w-full rounded-full border-gray-200">
                                    <SelectValue placeholder="Select raw material" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {dataLoading ? (
                                      <SelectItem value="loading" disabled>Loading materials...</SelectItem>
                                    ) : rawMaterialsData.length === 0 ? (
                                      <SelectItem value="no-data" disabled>No materials available</SelectItem>
                                    ) : (
                                      rawMaterialsData.map((material) => (
                                        <SelectItem key={material.id} value={material.id}>
                                          <div className="flex flex-col">
                                            <span className="font-light">{material.name}</span>
                                            {material.description && (
                                              <span className="text-xs text-gray-500 font-light">{material.description}</span>
                                            )}
                                          </div>
                                        </SelectItem>
                                      ))
                                    )}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            {errors.drivers_form_collected_products?.[index]?.raw_material_id && (
                              <p className="text-sm text-red-500 font-light">
                                {errors.drivers_form_collected_products[index]?.raw_material_id?.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label className="font-light">Supplier *</Label>
                            <Controller
                              name={`drivers_form_collected_products.${index}.supplier_id`}
                              control={control}
                              render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                                  <SelectTrigger className="w-full rounded-full border-gray-200">
                                    <SelectValue placeholder="Select supplier" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {dataLoading ? (
                                      <SelectItem value="loading" disabled>Loading suppliers...</SelectItem>
                                    ) : suppliersData.length === 0 ? (
                                      <SelectItem value="no-data" disabled>No suppliers available</SelectItem>
                                    ) : (
                                      suppliersData.map((supplier) => (
                                        <SelectItem key={supplier.id} value={supplier.id}>
                                          <div className="flex flex-col">
                                            <span className="font-light">
                                              {'name' in supplier ? supplier.name : `${supplier.first_name} ${supplier.last_name}`}
                                            </span>
                                            {supplier.email && (
                                              <span className="text-xs text-gray-500 font-light">{supplier.email}</span>
                                            )}
                                          </div>
                                        </SelectItem>
                                      ))
                                    )}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            {errors.drivers_form_collected_products?.[index]?.supplier_id && (
                              <p className="text-sm text-red-500 font-light">
                                {errors.drivers_form_collected_products[index]?.supplier_id?.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="font-light">Collected Amount *</Label>
                            <Controller
                              name={`drivers_form_collected_products.${index}.collected_amount`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  disabled={isSubmitting}
                                  value={field.value || ""}
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                                  className="rounded-full border-gray-200 font-light"
                                />
                              )}
                            />
                            {errors.drivers_form_collected_products?.[index]?.collected_amount && (
                              <p className="text-sm text-red-500 font-light">
                                {errors.drivers_form_collected_products[index]?.collected_amount?.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label className="font-light">Unit of Measure *</Label>
                            <Controller
                              name={`drivers_form_collected_products.${index}.unit_of_measure`}
                              control={control}
                              render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                                  <SelectTrigger className="w-full rounded-full border-gray-200">
                                    <SelectValue placeholder="Select unit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Kilograms">Kilograms</SelectItem>
                                    <SelectItem value="Liters">Liters</SelectItem>
                                    <SelectItem value="Milliliters">Milliliters</SelectItem>
                                    <SelectItem value="Grams">Grams</SelectItem>
                                    <SelectItem value="Pieces">Pieces</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            {errors.drivers_form_collected_products?.[index]?.unit_of_measure && (
                              <p className="text-sm text-red-500 font-light">
                                {errors.drivers_form_collected_products[index]?.unit_of_measure?.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="font-light">Supplier E-Signature *</Label>
                            <Controller
                              name={`drivers_form_collected_products.${index}.e_sign_supplier`}
                              control={control}
                              render={({ field }) => (
                                <div className="space-y-2">
                                  {field.value ? (
                                    <img src={base64ToPngDataUrl(field.value)} alt="Supplier signature" className="h-24 border border-gray-200 rounded-md bg-white" />
                                  ) : (
                                    <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-500 bg-white">
                                      No signature captured
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => {
                                      setCurrentSignatureIndex(index)
                                      setCurrentSignatureType('supplier')
                                      setSupplierSignatureOpen(true)
                                    }}>
                                      Add Signature
                                    </Button>
                                    {field.value && (
                                      <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => {
                                        setCurrentSignatureIndex(index)
                                        setCurrentSignatureType('supplier')
                                        setSupplierSignatureViewOpen(true)
                                      }}>
                                        View Signature
                                      </Button>
                                    )}
                                    {field.value && (
                                      <Button type="button" variant="ghost" size="sm" className="rounded-full text-red-600" onClick={() => field.onChange("")}>Clear</Button>
                                    )}
                                  </div>
                                </div>
                              )}
                            />
                            {errors.drivers_form_collected_products?.[index]?.e_sign_supplier && (
                              <p className="text-sm text-red-500 font-light">
                                {errors.drivers_form_collected_products[index]?.e_sign_supplier?.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label className="font-light">Driver E-Signature *</Label>
                            <Controller
                              name={`drivers_form_collected_products.${index}.e_sign_driver`}
                              control={control}
                              render={({ field }) => (
                                <div className="space-y-2">
                                  {field.value ? (
                                    <img src={base64ToPngDataUrl(field.value)} alt="Driver signature" className="h-24 border border-gray-200 rounded-md bg-white" />
                                  ) : (
                                    <div className="h-24 flex items-center justify-center border border-dashed border-gray-300 rounded-md text-xs text-gray-500 bg-white">
                                      No signature captured
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => {
                                      setCurrentSignatureIndex(index)
                                      setCurrentSignatureType('driver')
                                      setDriverSignatureOpen(true)
                                    }}>
                                      Add Signature
                                    </Button>
                                    {field.value && (
                                      <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => {
                                        setCurrentSignatureIndex(index)
                                        setCurrentSignatureType('driver')
                                        setDriverSignatureViewOpen(true)
                                      }}>
                                        View Signature
                                      </Button>
                                    )}
                                    {field.value && (
                                      <Button type="button" variant="ghost" size="sm" className="rounded-full text-red-600" onClick={() => field.onChange("")}>Clear</Button>
                                    )}
                                  </div>
                                </div>
                              )}
                            />
                            {errors.drivers_form_collected_products?.[index]?.e_sign_driver && (
                              <p className="text-sm text-red-500 font-light">
                                {errors.drivers_form_collected_products[index]?.e_sign_driver?.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {errors.drivers_form_collected_products && (
                <p className="text-sm text-red-500 font-light">{errors.drivers_form_collected_products.message}</p>
              )}
            </div>
          </div>

          {/* Delivery Status Section */}
          <div className="border border-gray-200 rounded-lg bg-white m-6">
            <div className="p-6 pb-0">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-600" />
                <div className="text-lg font-light">Delivery Status</div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="delivered" className="font-light">Delivered</Label>
                  <Controller
                    name="delivered"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="delivered"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="rejected" className="font-light">Rejected</Label>
                  <Controller
                    name="rejected"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="rejected"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 m-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="bg-white border-gray-200 rounded-full font-light"
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              loading={isLoading}
              className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white border-0 rounded-full px-6 py-2 font-light"
            >
              {mode === "create" ? "Create Form" : "Save Changes"}
            </LoadingButton>
          </div>
        </form>

        {/* Signature Modals */}
        {currentSignatureIndex !== null && currentSignatureType && (
          <>
            <SignatureModal
              open={currentSignatureType === 'supplier' ? supplierSignatureOpen : driverSignatureOpen}
              onOpenChange={currentSignatureType === 'supplier' ? setSupplierSignatureOpen : setDriverSignatureOpen}
              onSave={(signature) => {
                if (currentSignatureIndex !== null) {
                  const fieldName = currentSignatureType === 'supplier' 
                    ? `drivers_form_collected_products.${currentSignatureIndex}.e_sign_supplier`
                    : `drivers_form_collected_products.${currentSignatureIndex}.e_sign_driver`
                  setValue(fieldName as any, signature)
                }
                if (currentSignatureType === 'supplier') {
                  setSupplierSignatureOpen(false)
                } else {
                  setDriverSignatureOpen(false)
                }
                setCurrentSignatureIndex(null)
                setCurrentSignatureType(null)
              }}
              title={`${currentSignatureType === 'supplier' ? 'Supplier' : 'Driver'} Signature`}
            />

            <SignatureViewer
              open={currentSignatureType === 'supplier' ? supplierSignatureViewOpen : driverSignatureViewOpen}
              onOpenChange={currentSignatureType === 'supplier' ? setSupplierSignatureViewOpen : setDriverSignatureViewOpen}
              value={currentSignatureIndex !== null ? 
                (currentSignatureType === 'supplier' 
                  ? watch(`drivers_form_collected_products.${currentSignatureIndex}.e_sign_supplier`)
                  : watch(`drivers_form_collected_products.${currentSignatureIndex}.e_sign_driver`)
                ) : ""
              }
              title={`${currentSignatureType === 'supplier' ? 'Supplier' : 'Driver'} Signature`}
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}