import { Badge } from "@/components/ui/badge"
import { LoadingButton } from "@/components/ui/loading-button"
import { Eye, Edit, Trash2, Beaker, TrendingUp, FileText, Clock, Package, ArrowRight } from "lucide-react"
import { SkimmingForm } from "@/lib/api/skimming-form"

interface SkimmingTableProps {
  forms: SkimmingForm[]
  onView: (form: SkimmingForm) => void
  onEdit: (form: SkimmingForm) => void
  onDelete: (form: SkimmingForm) => void
  operationLoading: { delete: boolean }
}

export function SkimmingTable({ forms, onView, onEdit, onDelete, operationLoading }: SkimmingTableProps) {
  return (
    <div className="space-y-4">
      {forms.map((form) => (
        <div key={form.id} className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-purple-500 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-[#0068BD] flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className=\"flex items-center space-x-2\">
                  <span className=\"font-light text-lg\">#{form.id.slice(0, 8)}</span>
                  <Badge className=\"bg-blue-100 text-blue-800 font-light\">
                    Skimming Process
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(form.created_at).toLocaleDateString()} • BMT: #{form.bmt_id.slice(0, 8)}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <LoadingButton
                variant="outline"
                size="sm"
                onClick={() => onView(form)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 rounded-full"
              >
                <Eye className="w-4 h-4" />
              </LoadingButton>
              <LoadingButton
                variant="outline"
                size="sm"
                onClick={() => onEdit(form)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 rounded-full"
              >
                <Edit className="w-4 h-4" />
              </LoadingButton>
              <LoadingButton
                variant="destructive"
                size="sm"
                onClick={() => onDelete(form)}
                loading={operationLoading.delete}
                disabled={operationLoading.delete}
                className="bg-red-600 hover:bg-red-700 text-white border-0 rounded-full"
              >
                <Trash2 className="w-4 h-4" />
              </LoadingButton>
            </div>
          </div>

          {/* Process Details */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Raw Milk */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Beaker className="h-4 w-4 text-orange-500" />
                <p className="text-sm font-light text-gray-600">Raw Milk Input</p>
              </div>
              <div className="space-y-1">
                {form.standardizing_form_raw_milk?.map((raw, index) => (
                  <div key={raw.id} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span>Entry {index + 1}:</span>
                      <span className="font-light">{raw.quantity}L</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {raw.fat}% fat • {raw.source_silo_id.slice(0, 8)}
                    </div>
                  </div>
                )) || <p className="text-sm text-gray-400">No raw milk entries</p>}
              </div>
            </div>

            {/* Skim Milk */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <p className="text-sm font-light text-gray-600">Skim Milk Output</p>
              </div>
              <div className="space-y-1">
                {form.standardizing_form_skim_milk?.map((skim, index) => (
                  <div key={skim.id} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span>Entry {index + 1}:</span>
                      <span className="font-light">{skim.quantity}L</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {skim.fat}% fat → {skim.destination_silo_id.slice(0, 8)}
                    </div>
                  </div>
                )) || <p className="text-sm text-gray-400">No skim milk entries</p>}
              </div>
            </div>

            {/* Cream */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-yellow-500" />
                <p className="text-sm font-light text-gray-600">Cream Output</p>
              </div>
              <div className="space-y-1">
                {form.standardizing_form_cream?.map((cream, index) => (
                  <div key={cream.id} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span>Entry {index + 1}:</span>
                      <span className="font-light">{cream.quantity}L</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {cream.fat}% fat
                    </div>
                  </div>
                )) || <p className="text-sm text-gray-400">No cream entries</p>}
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Created: {new Date(form.created_at).toLocaleDateString()}</span>
              {form.updated_at && (
                <>
                  <span>•</span>
                  <span>Updated: {new Date(form.updated_at).toLocaleDateString()}</span>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
