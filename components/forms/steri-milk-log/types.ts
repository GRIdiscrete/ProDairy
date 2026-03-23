export interface ProcessDetailFields {
  time: string
  temperature: string
  pressure: string
}

export interface BasicInfoFormData {
  autoclave: string
  approved: boolean
  approver_id: string
  filmatic_form_id: string
  batch_number: string
  date: string
}

export interface ProcessDetailsFormData {
  filling_start: ProcessDetailFields
  autoclave_start: ProcessDetailFields
  heating_start: ProcessDetailFields
  heating_finish: ProcessDetailFields
  sterilization_start: ProcessDetailFields
  sterilization_after_5: ProcessDetailFields
  sterilization_finish: ProcessDetailFields
  pre_cooling_start: ProcessDetailFields
  pre_cooling_finish: ProcessDetailFields
  cooling_1_start: ProcessDetailFields
  cooling_1_finish: ProcessDetailFields
  cooling_2_start: ProcessDetailFields
  cooling_2_finish: ProcessDetailFields
}
