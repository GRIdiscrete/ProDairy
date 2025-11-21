"use client"

import { useFormContext } from "react-hook-form"

interface ReviewStepProps {
  users: any[]
  tankers: any[]
}

export function ReviewStep({ users, tankers }: ReviewStepProps) {
  const { watch } = useFormContext()
  const values = watch()

  const getUserName = (id: string) => {
    const user = users.find(u => u.id === id)
    return user ? `${user.first_name} ${user.last_name}` : id
  }

  const getTankerName = (id: string) => {
    const tanker = tankers.find(t => t.id === id)
    return tanker ? tanker.reg_number : id
  }

  const rawMilk = values.raw_milk_silos?.[0] || {}
  const otherTests = values.other_tests?.[0] || {}
  const stdPast = values.standardisation_and_pasteurisation?.[0] || {}
  const uht = values.uht_steri_milk?.[0] || {}

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Review & Submit</h3>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Basic Information</h4>
        <p><strong>Issue Date:</strong> {values.issue_date}</p>
        <p><strong>Date of Production:</strong> {values.date_of_production}</p>
        <p><strong>Batch Number:</strong> {values.batch_number}</p>
        <p><strong>Variety:</strong> {values.variety}</p>
        <p><strong>Approved By:</strong> {getUserName(values.approved_by)}</p>
        <p><strong>Approver Signature:</strong> {values.approver_signature ? "Signed" : "Not Signed"}</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Raw Milk Silos</h4>
        <p><strong>Tanker:</strong> {getTankerName(rawMilk.tank)}</p>
        <p><strong>Time:</strong> {rawMilk.time ? new Date(rawMilk.time).toLocaleString() : ""}</p>
        <p><strong>Temperature:</strong> {rawMilk.temperature}°C</p>
        <p><strong>pH:</strong> {rawMilk.ph}</p>
        <p><strong>Fat:</strong> {rawMilk.fat}%</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Other Tests</h4>
        <p><strong>Sample Details:</strong> {otherTests.sample_details}</p>
        <p><strong>pH:</strong> {otherTests.ph}</p>
        <p><strong>TDS:</strong> {otherTests.tds}</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Standardisation & Pasteurisation</h4>
        <p><strong>Tanker:</strong> {getTankerName(stdPast.tank)}</p>
        <p><strong>Batch:</strong> {stdPast.batch}</p>
        <p><strong>Time:</strong> {stdPast.time ? new Date(stdPast.time).toLocaleString() : ""}</p>
        <p><strong>Temperature:</strong> {stdPast.temperature}°C</p>
        <p><strong>Phosphatase:</strong> {stdPast.phosphatase}</p>
        <p><strong>Analyst:</strong> {getUserName(stdPast.analyst)}</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">UHT Steri Milk</h4>
        <p><strong>Time:</strong> {uht.time ? new Date(uht.time).toLocaleString() : ""}</p>
        <p><strong>Batch:</strong> {uht.batch}</p>
        <p><strong>Temperature:</strong> {uht.temperature}°C</p>
        <p><strong>Total Solids:</strong> {uht.total_solids}</p>
        <p><strong>Analyst:</strong> {getUserName(uht.analyst)}</p>
      </div>
    </div>
  )
}
