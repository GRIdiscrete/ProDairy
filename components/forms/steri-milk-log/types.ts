export interface ProcessDetailFields {
  time: string
  temperature: string
  pressure: string
}

export interface BasicInfoFormData {
  approved: boolean
  approver_id: string
  filmatic_form_id: string
  batch_number: string
  date: string
}

export interface ProcessDetailsFormData {
  filling_start_details: ProcessDetailFields
  autoclave_start_details: ProcessDetailFields
  heating_start_details: ProcessDetailFields
  heating_finish_details: ProcessDetailFields
  sterilization_start_details: ProcessDetailFields
  sterilization_after_5_details: ProcessDetailFields
  sterilization_finish_details: ProcessDetailFields
  pre_cooling_start_details: ProcessDetailFields
  pre_cooling_finish_details: ProcessDetailFields
  cooling_1_start_details: ProcessDetailFields
  cooling_1_finish_details: ProcessDetailFields
  cooling_2_start_details: ProcessDetailFields
  cooling_2_finish_details: ProcessDetailFields
}
