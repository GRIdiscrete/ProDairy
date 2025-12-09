import { ArrowRight, Factory, Beaker, Package } from "lucide-react"

export function ProcessOverview() {
  return (
    <div className="mb-8 p-6  from-blue-50 to-cyan-50 rounded-lg">
      <h3 className="text-lg font-light text-gray-900 mb-4">Process Overview</h3>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <Beaker className="w-4 h-4 text-orange-600" />
          </div>
          <span className="text-sm font-light">Process Log</span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400" />
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Factory className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-blue-600">Steri Milk Process Log</span>
            <div className=" bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium shadow-lg">
              Current Step
            </div>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400" />
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <Package className="h-4 w-4 text-gray-400" />
          </div>
          <span className="text-sm font-light text-gray-400">Next Process</span>
        </div>
      </div>
    </div>
  )
}
