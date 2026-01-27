import { Badge } from "@/components/ui/badge"
import { LoadingButton } from "@/components/ui/loading-button"
import { Eye, Edit, Trash2, Beaker, TrendingUp, FileText, Clock, Package } from "lucide-react"
import { StandardizingForm } from "@/lib/api/standardizing-form"

interface StandardizingTableProps {
  forms: StandardizingForm[]
  onView: (form: StandardizingForm) => void
  onEdit: (form: StandardizingForm) => void
  onDelete: (form: StandardizingForm) => void
  operationLoading: { delete: boolean }
}

export function StandardizingTable({ forms, onView, onEdit, onDelete, operationLoading }: StandardizingTableProps) {
  return (
    <div className="space-y-4">
      {forms.map((form) => (
        <div key={form.id} className="border border-gray-200 rounded-lg bg-white border-l-4 border-l-orange-500 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <Beaker className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-light text-lg">#{form.id.slice(0, 6)}...#{form.id.slice(-4)}</span>
                  <Badge className="bg-orange-100 text-orange-800 font-light">
                    {(form as any).standardizing_form_no_skim_skim_milk?.length || 0} skim entries
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(form.created_at).toLocaleDateString()} • BMT: #{form.bmt_id.slice(0, 8)}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <LoadingButton
                
                size="sm"
                onClick={() => onView(form)}
                className="bg-[#006BC4] text-white rounded-full"
              >
                <Eye className="w-4 h-4" />
              </LoadingButton>
              <LoadingButton
                
                size="sm"
                onClick={() => onEdit(form)}
                className="bg-[#A0CF06] text-[#211D1E] rounded-full"
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

          {/* Skim Milk Details */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <p className="text-sm font-light text-gray-600">Skim Milk Production</p>
              </div>
              <div className="space-y-1">
                {(form as any).standardizing_form_no_skim_skim_milk?.map((skim: any, index: number) => (
                  <div key={skim.id} className="flex items-center justify-between text-sm">
                    <span>Entry {index + 1}:</span>
                    <span className="font-light">{skim.quantity}L • {skim.resulting_fat}% fat</span>
                  </div>
                )) || <p className="text-sm text-gray-400">No skim milk entries</p>}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <p className="text-sm font-light text-gray-600">Timestamps</p>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span>Created:</span>
                  <span className="font-light">{new Date(form.created_at).toLocaleDateString()}</span>
                </div>
                {form.updated_at && (
                  <div className="flex items-center justify-between">
                    <span>Updated:</span>
                    <span className="font-light">{new Date(form.updated_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
