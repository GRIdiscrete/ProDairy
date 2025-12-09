import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { LoadingButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Switch } from "@/components/ui/switch"
import { ShadcnTimePicker } from "@/components/ui/shadcn-time-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { createGeneralLabTestAction, updateGeneralLabTestAction, fetchGeneralLabTests } from "@/lib/store/slices/generalLabTestSlice"
import { siloApi } from "@/lib/api/silo"
import { usersApi } from "@/lib/api/users"
import { toast } from "sonner"
import type { GeneralLabTest } from "@/lib/api/general-lab-test"

const schema = yup.object({
  source_silo: yup.string().required("Source Silo is required"),
  analyst: yup.string().required("Analyst is required"),
  // All other fields are optional
})

const RESAZURIN_COLORS = [
  { value: 'blue', label: 'Blue', bgColor: 'bg-blue-500' },
  { value: 'light_blue', label: 'Light Blue', bgColor: 'bg-sky-300' },
  { value: 'purple', label: 'Purple', bgColor: 'bg-purple-500' },
  { value: 'pink', label: 'Pink', bgColor: 'bg-pink-400' },
  { value: 'white', label: 'White', bgColor: 'bg-white border border-gray-200' },
]

export function GeneralLabTestDrawer({ open, onOpenChange, test, mode }: { open: boolean, onOpenChange: (open: boolean) => void, test?: GeneralLabTest | null, mode: "create" | "edit" }) {
  const dispatch = useAppDispatch()
  const { operationLoading } = useAppSelector((state) => state.generalLabTests)
  const [silos, setSilos] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loadingSilos, setLoadingSilos] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoadingSilos(true)
      setLoadingUsers(true)
      const silosRes = await siloApi.getSilos()
      setSilos(silosRes.data || [])
      const usersRes = await usersApi.getUsers()
      setUsers(usersRes.data || [])
      setLoadingSilos(false)
      setLoadingUsers(false)
    }
    if (open) load()
  }, [open])

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<GeneralLabTest>({
    resolver: yupResolver(schema),
    defaultValues: test || {}
  })

  useEffect(() => {
    if (open && test && mode === "edit") {
      reset(test)
    } else if (open && mode === "create") {
      reset({})
    }
  }, [open, test, mode, reset])

  const onSubmit = async (data: GeneralLabTest) => {
    try {
      if (mode === "create") {
        await dispatch(createGeneralLabTestAction(data)).unwrap()
        toast.success("Lab test created")
        setTimeout(() => dispatch(fetchGeneralLabTests()), 100)
      } else if (test) {
        await dispatch(updateGeneralLabTestAction({ id: test.id!, data })).unwrap()
        toast.success("Lab test updated")
        setTimeout(() => dispatch(fetchGeneralLabTests()), 100)
      }
      onOpenChange(false)
      reset()
    } catch (e: any) {
      toast.error(e?.message || "Failed to save lab test")
    }
  }

  const onInvalid = (errors: any) => {
    const errorMessages = Object.values(errors).map((err: any) => err.message).filter(Boolean)
    toast.error(`Please check the following fields: ${errorMessages.join(', ')}`, {
      style: { background: '#ef4444', color: 'white' }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="tablet-sheet-full p-0 bg-white overflow-y-auto max-h-screen">
        <div className="p-6 bg-white">
          <SheetHeader>
            <SheetTitle>{mode === "create" ? "Add General Lab Test" : "Edit General Lab Test"}</SheetTitle>
            <SheetDescription>
              {mode === "create" ? "Create a new general lab test record" : "Update general lab test record"}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-8 mt-6">
            {/* Basic Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Source Silo *</Label>
                  <Controller
                    name="source_silo"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        options={silos.map((s: any) => ({ value: s.id, label: s.name }))}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select source silo"
                        loading={loadingSilos}
                      />
                    )}
                  />
                  {errors.source_silo && <p className="text-sm text-red-500">{errors.source_silo.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Analyst *</Label>
                  <Controller
                    name="analyst"
                    control={control}
                    render={({ field }) => (
                      <SearchableSelect
                        options={users.map((u: any) => ({ value: u.id, label: `${u.first_name} ${u.last_name}` }))}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select analyst"
                        loading={loadingUsers}
                      />
                    )}
                  />
                  {errors.analyst && <p className="text-sm text-red-500">{errors.analyst.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Time</Label>
                  <Controller
                    name="time"
                    control={control}
                    render={({ field }) => (
                      <ShadcnTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select time"
                      />
                    )}
                  />
                  {errors.time && <p className="text-sm text-red-500">{errors.time.message}</p>}
                </div>
              </div>
            </div>

            {/* Main Parameters */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Main Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="mb-2">Temperature (°C)</Label>
                  <Controller name="temperature" control={control} render={({ field }) => (
                    <Input type="number" step="0.1" placeholder="0.0" {...field} />
                  )} />
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Fat (%)</Label>
                  <Controller name="fat" control={control} render={({ field }) => (
                    <Input type="number" step="0.1" placeholder="0.0" {...field} />
                  )} />
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Protein (%)</Label>
                  <Controller name="protein" control={control} render={({ field }) => (
                    <Input type="number" step="0.1" placeholder="0.0" {...field} />
                  )} />
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">SNF</Label>
                  <Controller name="snf" control={control} render={({ field }) => (
                    <Input type="number" step="0.1" placeholder="0.0" {...field} />
                  )} />
                </div>
              </div>
            </div>

            {/* Quality Parameters */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Quality Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="mb-2">pH Level</Label>
                  <Controller name="ph" control={control} render={({ field }) => (
                    <Input type="number" step="0.1" placeholder="7.0" {...field} />
                  )} />
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Density</Label>
                  <Controller name="density" control={control} render={({ field }) => (
                    <Input type="number" step="0.001" placeholder="1.000" {...field} />
                  )} />
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Acidity</Label>
                  <Controller name="ta" control={control} render={({ field }) => (
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  )} />
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Retention Sample</Label>
                  <Controller name="retention_sample_taken" control={control} render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Label>Sample Taken</Label>
                    </div>
                  )} />
                </div>
              </div>
            </div>

            {/* Additional Tests */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Additional Tests</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="mb-2">Alcohol</Label>
                  <Controller name="alcohol" control={control} render={({ field }) => (
                    <Input type="text" {...field} />
                  )} />
                  {errors.alcohol && <p className="text-sm text-red-500">{errors.alcohol.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Antibiotics</Label>
                  <Controller name="antibiotics" control={control} render={({ field }) => (
                    <Input type="text" {...field} />
                  )} />
                  {errors.antibiotics && <p className="text-sm text-red-500">{errors.antibiotics.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Resazurin</Label>
                  <Controller 
                    name="resazurin" 
                    control={control} 
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select color">
                            {field.value && (
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full ${RESAZURIN_COLORS.find(c => c.value === field.value)?.bgColor}`} />
                                <span>{RESAZURIN_COLORS.find(c => c.value === field.value)?.label}</span>
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {RESAZURIN_COLORS.map(color => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full ${color.bgColor}`} />
                                <span>{color.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.resazurin && <p className="text-sm text-red-500">{errors.resazurin.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">SCC</Label>
                  <Controller name="scc" control={control} render={({ field }) => (
                    <Input type="number" step="any" {...field} />
                  )} />
                  {errors.scc && <p className="text-sm text-red-500">{errors.scc.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">TS</Label>
                  <Controller name="ts" control={control} render={({ field }) => (
                    <Input type="number" step="any" {...field} />
                  )} />
                  {errors.ts && <p className="text-sm text-red-500">{errors.ts.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Clot on Boil</Label>
                  <Controller name="clot_on_boil" control={control} render={({ field }) => (
                    <Input type="text" {...field} />
                  )} />
                  {errors.clot_on_boil && <p className="text-sm text-red-500">{errors.clot_on_boil.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Coffee</Label>
                  <Controller name="coffee" control={control} render={({ field }) => (
                    <Input type="text" {...field} />
                  )} />
                  {errors.coffee && <p className="text-sm text-red-500">{errors.coffee.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Hydrogen Peroxide</Label>
                  <Controller name="hydrogen_peroxide" control={control} render={({ field }) => (
                    <Input type="text" {...field} />
                  )} />
                  {errors.hydrogen_peroxide && <p className="text-sm text-red-500">{errors.hydrogen_peroxide.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Turbidity</Label>
                  <Controller name="turbidity" control={control} render={({ field }) => (
                    <Input type="number" step="any" {...field} />
                  )} />
                  {errors.turbidity && <p className="text-sm text-red-500">{errors.turbidity.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Brix</Label>
                  <Controller name="brix" control={control} render={({ field }) => (
                    <Input type="number" step="any" {...field} />
                  )} />
                  {errors.brix && <p className="text-sm text-red-500">{errors.brix.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Viscosity</Label>
                  <Controller name="viscosity" control={control} render={({ field }) => (
                    <Input type="number" step="any" {...field} />
                  )} />
                  {errors.viscosity && <p className="text-sm text-red-500">{errors.viscosity.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Moisture</Label>
                  <Controller name="moisture" control={control} render={({ field }) => (
                    <Input type="number" step="any" {...field} />
                  )} />
                  {errors.moisture && <p className="text-sm text-red-500">{errors.moisture.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Salt</Label>
                  <Controller name="salt" control={control} render={({ field }) => (
                    <Input type="number" step="any" {...field} />
                  )} />
                  {errors.salt && <p className="text-sm text-red-500">{errors.salt.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Curd</Label>
                  <Controller name="curd" control={control} render={({ field }) => (
                    <Input type="text" {...field} />
                  )} />
                  {errors.curd && <p className="text-sm text-red-500">{errors.curd.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Appearance/Body</Label>
                  <Controller name="appearance_body" control={control} render={({ field }) => (
                    <Input type="text" {...field} />
                  )} />
                  {errors.appearance_body && <p className="text-sm text-red-500">{errors.appearance_body.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Consistency</Label>
                  <Controller name="consistency" control={control} render={({ field }) => (
                    <Input type="text" {...field} />
                  )} />
                  {errors.consistency && <p className="text-sm text-red-500">{errors.consistency.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Color</Label>
                  <Controller name="color" control={control} render={({ field }) => (
                    <Input type="text" {...field} />
                  )} />
                  {errors.color && <p className="text-sm text-red-500">{errors.color.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Taste</Label>
                  <Controller name="taste" control={control} render={({ field }) => (
                    <Input type="text" {...field} />
                  )} />
                  {errors.taste && <p className="text-sm text-red-500">{errors.taste.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Percent Raw Milk</Label>
                  <Controller name="percent_raw_milk" control={control} render={({ field }) => (
                    <Input type="number" step="any" {...field} />
                  )} />
                  {errors.percent_raw_milk && <p className="text-sm text-red-500">{errors.percent_raw_milk.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Coliforms</Label>
                  <Controller name="coliforms" control={control} render={({ field }) => (
                    <Input type="text" {...field} />
                  )} />
                  {errors.coliforms && <p className="text-sm text-red-500">{errors.coliforms.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">TBC</Label>
                  <Controller name="tbc" control={control} render={({ field }) => (
                    <Input type="number" step="any" {...field} />
                  )} />
                  {errors.tbc && <p className="text-sm text-red-500">{errors.tbc.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Y/M</Label>
                  <Controller name="y_m" control={control} render={({ field }) => (
                    <Input type="number" step="any" {...field} />
                  )} />
                  {errors.y_m && <p className="text-sm text-red-500">{errors.y_m.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">E. coli</Label>
                  <Controller name="e_coli" control={control} render={({ field }) => (
                    <Input type="text" {...field} />
                  )} />
                  {errors.e_coli && <p className="text-sm text-red-500">{errors.e_coli.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">S. aureus</Label>
                  <Controller name="s_aureus" control={control} render={({ field }) => (
                    <Input type="text" {...field} />
                  )} />
                  {errors.s_aureus && <p className="text-sm text-red-500">{errors.s_aureus.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Salmonella</Label>
                  <Controller name="salmonella" control={control} render={({ field }) => (
                    <Input type="text" {...field} />
                  )} />
                  {errors.salmonella && <p className="text-sm text-red-500">{errors.salmonella.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">TS Duplicate</Label>
                  <Controller name="ts_duplicate" control={control} render={({ field }) => (
                    <Input type="number" step="any" {...field} />
                  )} />
                  {errors.ts_duplicate && <p className="text-sm text-red-500">{errors.ts_duplicate.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">TTS</Label>
                  <Controller name="tts" control={control} render={({ field }) => (
                    <Input type="number" step="any" {...field} />
                  )} />
                  {errors.tts && <p className="text-sm text-red-500">{errors.tts.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">TMS</Label>
                  <Controller name="tms" control={control} render={({ field }) => (
                    <Input type="number" step="any" {...field} />
                  )} />
                  {errors.tms && <p className="text-sm text-red-500">{errors.tms.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Psychrotrophs</Label>
                  <Controller name="psychrotrophs" control={control} render={({ field }) => (
                    <Input type="number" step="any" {...field} />
                  )} />
                  {errors.psychrotrophs && <p className="text-sm text-red-500">{errors.psychrotrophs.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">ATP</Label>
                  <Controller name="atp" control={control} render={({ field }) => (
                    <Input type="number" step="any" {...field} />
                  )} />
                  {errors.atp && <p className="text-sm text-red-500">{errors.atp.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">TDS</Label>
                  <Controller name="tds" control={control} render={({ field }) => (
                    <Input type="number" step="any" {...field} />
                  )} />
                  {errors.tds && <p className="text-sm text-red-500">{errors.tds.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Hardness</Label>
                  <Controller name="hardness" control={control} render={({ field }) => (
                    <Input type="number" step="any" {...field} />
                  )} />
                  {errors.hardness && <p className="text-sm text-red-500">{errors.hardness.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Chlorine</Label>
                  <Controller name="chlorine" control={control} render={({ field }) => (
                    <Input type="number" step="any" {...field} />
                  )} />
                  {errors.chlorine && <p className="text-sm text-red-500">{errors.chlorine.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">P-Alkalinity</Label>
                  <Controller name="p_alkalinity" control={control} render={({ field }) => (
                    <Input type="number" step="any" {...field} />
                  )} />
                  {errors.p_alkalinity && <p className="text-sm text-red-500">{errors.p_alkalinity.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">OH-Alkalinity</Label>
                  <Controller name="oh_alkalinity" control={control} render={({ field }) => (
                    <Input type="number" step="any" {...field} />
                  )} />
                  {errors.oh_alkalinity && <p className="text-sm text-red-500">{errors.oh_alkalinity.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Chlorides</Label>
                  <Controller name="chlorides" control={control} render={({ field }) => (
                    <Input type="number" step="any" {...field} />
                  )} />
                  {errors.chlorides && <p className="text-sm text-red-500">{errors.chlorides.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Sulphites</Label>
                  <Controller name="sulphites" control={control} render={({ field }) => (
                    <Input type="text" {...field} />
                  )} />
                  {errors.sulphites && <p className="text-sm text-red-500">{errors.sulphites.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="mb-2">Calcium Hardness</Label>
                  <Controller name="calcium_hardness" control={control} render={({ field }) => (
                    <Input type="number" step="any" {...field} />
                  )} />
                  {errors.calcium_hardness && <p className="text-sm text-red-500">{errors.calcium_hardness.message}</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <LoadingButton type="button"  onClick={() => onOpenChange(false)}>
                Cancel
              </LoadingButton>
              <LoadingButton 
                type="submit" 
                loading={mode === "create" ? operationLoading.create : operationLoading.update}
                loadingText={mode === "create" ? "Creating..." : "Updating..."}
              >
                {mode === "create" ? "Create Lab Test" : "Update Lab Test"}
              </LoadingButton>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
