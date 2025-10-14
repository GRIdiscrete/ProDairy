import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { LoadingButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchableSelect } from "@/components/ui/searchable-select"
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Group 1: Silo, Analyst, Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
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
                      className="w-full"
                    />
                  )}
                />
                {errors.source_silo && <p className="text-sm text-red-500">{errors.source_silo.message}</p>}
              </div>
              <div>
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
                      className="w-full"
                    />
                  )}
                />
                {errors.analyst && <p className="text-sm text-red-500">{errors.analyst.message}</p>}
              </div>
              <div>
                <Label>Time</Label>
                <Controller
                  name="time"
                  control={control}
                  render={({ field }) => (
                    <Input type="text" {...field} placeholder="HH:mm" />
                  )}
                />
                {errors.time && <p className="text-sm text-red-500">{errors.time.message}</p>}
              </div>
            </div>
            {/* Group 2: Main Numeric/Select Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Temperature</Label>
                <Controller name="temperature" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.temperature && <p className="text-sm text-red-500">{errors.temperature.message}</p>}
              </div>
              <div>
                <Label>Fat</Label>
                <Controller name="fat" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.fat && <p className="text-sm text-red-500">{errors.fat.message}</p>}
              </div>
              <div>
                <Label>Protein</Label>
                <Controller name="protein" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.protein && <p className="text-sm text-red-500">{errors.protein.message}</p>}
              </div>
              <div>
                <Label>Lactometer Reading</Label>
                <Controller name="lactometer_reading" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.lactometer_reading && <p className="text-sm text-red-500">{errors.lactometer_reading.message}</p>}
              </div>
              <div>
                <Label>SNF</Label>
                <Controller name="snf" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.snf && <p className="text-sm text-red-500">{errors.snf.message}</p>}
              </div>
              <div>
                <Label>TS</Label>
                <Controller name="ts" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.ts && <p className="text-sm text-red-500">{errors.ts.message}</p>}
              </div>
              <div>
                <Label>pH</Label>
                <Controller name="ph" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.ph && <p className="text-sm text-red-500">{errors.ph.message}</p>}
              </div>
              <div>
                <Label>Alcohol</Label>
                <Controller name="alcohol" control={control} render={({ field }) => (
                  <Input type="text" {...field} />
                )} />
                {errors.alcohol && <p className="text-sm text-red-500">{errors.alcohol.message}</p>}
              </div>
              <div>
                <Label>TA</Label>
                <Controller name="ta" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.ta && <p className="text-sm text-red-500">{errors.ta.message}</p>}
              </div>
              <div>
                <Label>OT</Label>
                <Controller name="ot" control={control} render={({ field }) => (
                  <Input type="text" {...field} />
                )} />
                {errors.ot && <p className="text-sm text-red-500">{errors.ot.message}</p>}
              </div>
              <div>
                <Label>Density</Label>
                <Controller name="density" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.density && <p className="text-sm text-red-500">{errors.density.message}</p>}
              </div>
              <div>
                <Label>Antibiotics</Label>
                <Controller name="antibiotics" control={control} render={({ field }) => (
                  <Input type="text" {...field} />
                )} />
                {errors.antibiotics && <p className="text-sm text-red-500">{errors.antibiotics.message}</p>}
              </div>
              <div>
                <Label>SCC</Label>
                <Controller name="scc" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.scc && <p className="text-sm text-red-500">{errors.scc.message}</p>}
              </div>
              <div>
                <Label>Resazurin</Label>
                <Controller name="resazurin" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.resazurin && <p className="text-sm text-red-500">{errors.resazurin.message}</p>}
              </div>
              <div>
                <Label>Sedimentation Index</Label>
                <Controller name="sedimentation_index" control={control} render={({ field }) => (
                  <Input type="text" {...field} />
                )} />
                {errors.sedimentation_index && <p className="text-sm text-red-500">{errors.sedimentation_index.message}</p>}
              </div>
              <div>
                <Label>Creaming Index</Label>
                <Controller name="creaming_index" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.creaming_index && <p className="text-sm text-red-500">{errors.creaming_index.message}</p>}
              </div>
              <div>
                <Label>Phosphate</Label>
                <Controller name="phosphate" control={control} render={({ field }) => (
                  <Input type="text" {...field} />
                )} />
                {errors.phosphate && <p className="text-sm text-red-500">{errors.phosphate.message}</p>}
              </div>
              <div>
                <Label>Clot on Boil</Label>
                <Controller name="clot_on_boil" control={control} render={({ field }) => (
                  <Input type="text" {...field} />
                )} />
                {errors.clot_on_boil && <p className="text-sm text-red-500">{errors.clot_on_boil.message}</p>}
              </div>
              <div>
                <Label>Coffee</Label>
                <Controller name="coffee" control={control} render={({ field }) => (
                  <Input type="text" {...field} />
                )} />
                {errors.coffee && <p className="text-sm text-red-500">{errors.coffee.message}</p>}
              </div>
              <div>
                <Label>Hydrogen Peroxide</Label>
                <Controller name="hydrogen_peroxide" control={control} render={({ field }) => (
                  <Input type="text" {...field} />
                )} />
                {errors.hydrogen_peroxide && <p className="text-sm text-red-500">{errors.hydrogen_peroxide.message}</p>}
              </div>
              <div>
                <Label>Turbidity</Label>
                <Controller name="turbidity" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.turbidity && <p className="text-sm text-red-500">{errors.turbidity.message}</p>}
              </div>
              <div>
                <Label>Brix</Label>
                <Controller name="brix" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.brix && <p className="text-sm text-red-500">{errors.brix.message}</p>}
              </div>
              <div>
                <Label>Viscosity</Label>
                <Controller name="viscosity" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.viscosity && <p className="text-sm text-red-500">{errors.viscosity.message}</p>}
              </div>
              <div>
                <Label>Moisture</Label>
                <Controller name="moisture" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.moisture && <p className="text-sm text-red-500">{errors.moisture.message}</p>}
              </div>
              <div>
                <Label>Salt</Label>
                <Controller name="salt" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.salt && <p className="text-sm text-red-500">{errors.salt.message}</p>}
              </div>
              <div>
                <Label>Curd</Label>
                <Controller name="curd" control={control} render={({ field }) => (
                  <Input type="text" {...field} />
                )} />
                {errors.curd && <p className="text-sm text-red-500">{errors.curd.message}</p>}
              </div>
              <div>
                <Label>Appearance/Body</Label>
                <Controller name="appearance_body" control={control} render={({ field }) => (
                  <Input type="text" {...field} />
                )} />
                {errors.appearance_body && <p className="text-sm text-red-500">{errors.appearance_body.message}</p>}
              </div>
              <div>
                <Label>Consistency</Label>
                <Controller name="consistency" control={control} render={({ field }) => (
                  <Input type="text" {...field} />
                )} />
                {errors.consistency && <p className="text-sm text-red-500">{errors.consistency.message}</p>}
              </div>
              <div>
                <Label>Color</Label>
                <Controller name="color" control={control} render={({ field }) => (
                  <Input type="text" {...field} />
                )} />
                {errors.color && <p className="text-sm text-red-500">{errors.color.message}</p>}
              </div>
              <div>
                <Label>Taste</Label>
                <Controller name="taste" control={control} render={({ field }) => (
                  <Input type="text" {...field} />
                )} />
                {errors.taste && <p className="text-sm text-red-500">{errors.taste.message}</p>}
              </div>
              <div>
                <Label>Retention Sample Taken</Label>
                <Controller name="retention_sample_taken" control={control} render={({ field }) => (
                  <Input type="checkbox" checked={field.value} onChange={e => field.onChange(e.target.checked)} />
                )} />
                {errors.retention_sample_taken && <p className="text-sm text-red-500">{errors.retention_sample_taken.message}</p>}
              </div>
              <div>
                <Label>Percent Raw Milk</Label>
                <Controller name="percent_raw_milk" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.percent_raw_milk && <p className="text-sm text-red-500">{errors.percent_raw_milk.message}</p>}
              </div>
              <div>
                <Label>Coliforms</Label>
                <Controller name="coliforms" control={control} render={({ field }) => (
                  <Input type="text" {...field} />
                )} />
                {errors.coliforms && <p className="text-sm text-red-500">{errors.coliforms.message}</p>}
              </div>
              <div>
                <Label>TBC</Label>
                <Controller name="tbc" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.tbc && <p className="text-sm text-red-500">{errors.tbc.message}</p>}
              </div>
              <div>
                <Label>Y/M</Label>
                <Controller name="y_m" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.y_m && <p className="text-sm text-red-500">{errors.y_m.message}</p>}
              </div>
              <div>
                <Label>E. coli</Label>
                <Controller name="e_coli" control={control} render={({ field }) => (
                  <Input type="text" {...field} />
                )} />
                {errors.e_coli && <p className="text-sm text-red-500">{errors.e_coli.message}</p>}
              </div>
              <div>
                <Label>S. aureus</Label>
                <Controller name="s_aureus" control={control} render={({ field }) => (
                  <Input type="text" {...field} />
                )} />
                {errors.s_aureus && <p className="text-sm text-red-500">{errors.s_aureus.message}</p>}
              </div>
              <div>
                <Label>Salmonella</Label>
                <Controller name="salmonella" control={control} render={({ field }) => (
                  <Input type="text" {...field} />
                )} />
                {errors.salmonella && <p className="text-sm text-red-500">{errors.salmonella.message}</p>}
              </div>
              <div>
                <Label>TS Duplicate</Label>
                <Controller name="ts_duplicate" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.ts_duplicate && <p className="text-sm text-red-500">{errors.ts_duplicate.message}</p>}
              </div>
              <div>
                <Label>TTS</Label>
                <Controller name="tts" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.tts && <p className="text-sm text-red-500">{errors.tts.message}</p>}
              </div>
              <div>
                <Label>TMS</Label>
                <Controller name="tms" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.tms && <p className="text-sm text-red-500">{errors.tms.message}</p>}
              </div>
              <div>
                <Label>Psychrotrophs</Label>
                <Controller name="psychrotrophs" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.psychrotrophs && <p className="text-sm text-red-500">{errors.psychrotrophs.message}</p>}
              </div>
              <div>
                <Label>ATP</Label>
                <Controller name="atp" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.atp && <p className="text-sm text-red-500">{errors.atp.message}</p>}
              </div>
              <div>
                <Label>TDS</Label>
                <Controller name="tds" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.tds && <p className="text-sm text-red-500">{errors.tds.message}</p>}
              </div>
              <div>
                <Label>Hardness</Label>
                <Controller name="hardness" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.hardness && <p className="text-sm text-red-500">{errors.hardness.message}</p>}
              </div>
              <div>
                <Label>Chlorine</Label>
                <Controller name="chlorine" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.chlorine && <p className="text-sm text-red-500">{errors.chlorine.message}</p>}
              </div>
              <div>
                <Label>P-Alkalinity</Label>
                <Controller name="p_alkalinity" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.p_alkalinity && <p className="text-sm text-red-500">{errors.p_alkalinity.message}</p>}
              </div>
              <div>
                <Label>OH-Alkalinity</Label>
                <Controller name="oh_alkalinity" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.oh_alkalinity && <p className="text-sm text-red-500">{errors.oh_alkalinity.message}</p>}
              </div>
              <div>
                <Label>Chlorides</Label>
                <Controller name="chlorides" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.chlorides && <p className="text-sm text-red-500">{errors.chlorides.message}</p>}
              </div>
              <div>
                <Label>Sulphites</Label>
                <Controller name="sulphites" control={control} render={({ field }) => (
                  <Input type="text" {...field} />
                )} />
                {errors.sulphites && <p className="text-sm text-red-500">{errors.sulphites.message}</p>}
              </div>
              <div>
                <Label>Calcium Hardness</Label>
                <Controller name="calcium_hardness" control={control} render={({ field }) => (
                  <Input type="number" step="any" {...field} />
                )} />
                {errors.calcium_hardness && <p className="text-sm text-red-500">{errors.calcium_hardness.message}</p>}
              </div>
            </div>
            {/* ...existing code... */}
            <div className="flex justify-end space-x-2 pt-4">
              <LoadingButton type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
