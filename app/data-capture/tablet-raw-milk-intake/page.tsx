/**
 * Tablet Raw Milk Intake Form
 * 
 * Example of a tablet-optimized data entry form with:
 * - Large touch targets
 * - Floating form behavior
 * - Tablet-specific layout
 * - Easy data entry workflow
 */

"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TabletDataEntryForm, TabletFormField, TabletFormGrid, TabletInput, TabletTextarea, TabletSelect, TabletSelectItem } from '@/components/forms/tablet-data-entry-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, Truck, Thermometer, Droplets, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TabletRawMilkIntake() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    voucherNumber: '',
    supplierId: '',
    vehicleId: '',
    quantityKg: '',
    quantityLitres: '',
    temperature: '',
    ph: '',
    density: '',
    fat: '',
    protein: '',
    receivedBy: '',
    qualityGrade: '',
    notes: ''
  })

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSubmitting(false)
    router.push('/tablet-dashboard')
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Raw Milk Intake
            </h1>
            <p className="text-lg text-gray-600">
              Enter raw milk intake data
            </p>
          </div>

          <TabletDataEntryForm
            title="Raw Milk Intake Form"
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
          >
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TabletFormGrid columns={2}>
                  <TabletFormField label="Voucher Number" required>
                    <TabletInput
                      value={formData.voucherNumber}
                      onChange={(e) => setFormData({...formData, voucherNumber: e.target.value})}
                      placeholder="Enter voucher number"
                    />
                  </TabletFormField>

                  <TabletFormField label="Supplier" required>
                    <TabletSelect value={formData.supplierId} onValueChange={(value) => setFormData({...formData, supplierId: value})}>
                      <TabletSelectItem value="supplier1">Supplier A</TabletSelectItem>
                      <TabletSelectItem value="supplier2">Supplier B</TabletSelectItem>
                      <TabletSelectItem value="supplier3">Supplier C</TabletSelectItem>
                    </TabletSelect>
                  </TabletFormField>

                  <TabletFormField label="Vehicle ID" required>
                    <TabletInput
                      value={formData.vehicleId}
                      onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                      placeholder="Enter vehicle ID"
                    />
                  </TabletFormField>

                  <TabletFormField label="Received By" required>
                    <TabletInput
                      value={formData.receivedBy}
                      onChange={(e) => setFormData({...formData, receivedBy: e.target.value})}
                      placeholder="Enter receiver name"
                    />
                  </TabletFormField>
                </TabletFormGrid>
              </CardContent>
            </Card>

            {/* Quantity Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Droplets className="h-5 w-5 text-green-600" />
                  <span>Quantity Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TabletFormGrid columns={2}>
                  <TabletFormField label="Quantity (Kg)" required>
                    <TabletInput
                      type="number"
                      value={formData.quantityKg}
                      onChange={(e) => setFormData({...formData, quantityKg: e.target.value})}
                      placeholder="Enter weight in kg"
                    />
                  </TabletFormField>

                  <TabletFormField label="Quantity (Litres)" required>
                    <TabletInput
                      type="number"
                      value={formData.quantityLitres}
                      onChange={(e) => setFormData({...formData, quantityLitres: e.target.value})}
                      placeholder="Enter volume in litres"
                    />
                  </TabletFormField>
                </TabletFormGrid>
              </CardContent>
            </Card>

            {/* Quality Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Thermometer className="h-5 w-5 text-red-600" />
                  <span>Quality Parameters</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TabletFormGrid columns={3}>
                  <TabletFormField label="Temperature (°C)" required>
                    <TabletInput
                      type="number"
                      step="0.1"
                      value={formData.temperature}
                      onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                      placeholder="Enter temperature"
                    />
                  </TabletFormField>

                  <TabletFormField label="pH Level" required>
                    <TabletInput
                      type="number"
                      step="0.01"
                      value={formData.ph}
                      onChange={(e) => setFormData({...formData, ph: e.target.value})}
                      placeholder="Enter pH level"
                    />
                  </TabletFormField>

                  <TabletFormField label="Density" required>
                    <TabletInput
                      type="number"
                      step="0.001"
                      value={formData.density}
                      onChange={(e) => setFormData({...formData, density: e.target.value})}
                      placeholder="Enter density"
                    />
                  </TabletFormField>

                  <TabletFormField label="Fat Content (%)" required>
                    <TabletInput
                      type="number"
                      step="0.1"
                      value={formData.fat}
                      onChange={(e) => setFormData({...formData, fat: e.target.value})}
                      placeholder="Enter fat content"
                    />
                  </TabletFormField>

                  <TabletFormField label="Protein Content (%)" required>
                    <TabletInput
                      type="number"
                      step="0.1"
                      value={formData.protein}
                      onChange={(e) => setFormData({...formData, protein: e.target.value})}
                      placeholder="Enter protein content"
                    />
                  </TabletFormField>

                  <TabletFormField label="Quality Grade" required>
                    <TabletSelect value={formData.qualityGrade} onValueChange={(value) => setFormData({...formData, qualityGrade: value})}>
                      <TabletSelectItem value="A">Grade A</TabletSelectItem>
                      <TabletSelectItem value="B">Grade B</TabletSelectItem>
                      <TabletSelectItem value="C">Grade C</TabletSelectItem>
                    </TabletSelect>
                  </TabletFormField>
                </TabletFormGrid>
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <span>Additional Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TabletFormField label="Notes">
                  <TabletTextarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Enter any additional notes or observations..."
                    rows={4}
                  />
                </TabletFormField>
              </CardContent>
            </Card>

            {/* Status Indicator */}
            <div className="flex items-center justify-center space-x-2 p-4 bg-blue-50 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-blue-700 font-medium">
                Form will float above keyboard when typing
              </span>
            </div>
          </TabletDataEntryForm>
        </motion.div>
      </div>
    </div>
  )
}
