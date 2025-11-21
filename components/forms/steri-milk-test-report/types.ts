// Type definitions for Steri Milk Test Report form

export interface BasicInfoFormData {
  issue_date: string
  approved_by: string
  approver_signature: string
  date_of_production: string
  batch_number: string
  variety: string
}

export interface RawMilkSilosFormData {
  tank: string
  time: string
  temperature: string
  alcohol: string
  res: string
  cob: boolean
  ph: string
  fat: string
  lr_snf: string
  acidity: string
  remarks: string
}

export interface OtherTestsFormData {
  sample_details: string
  ph: string
  caustic: string
  acid: string
  chlorine: string
  hd: string
  tds: string
  hydrogen_peroxide: string
  remarks: string
}

export interface StandardisationFormData {
  tank: string
  batch: string
  time: string
  temperature: string
  ot: string
  alcohol: string
  phosphatase: string
  ph: string
  cob: boolean
  fat: string
  ci_si: string
  lr_snf: string
  acidity: string
  analyst: string
  remarks: string
}

export interface UhtSteriMilkFormData {
  time: string
  batch: string
  temperature: string
  ot: string
  alc: string
  res: string
  cob: boolean
  ph: string
  fat: string
  lr_snf: string
  ci_si: string
  total_solids: string
  acidity: string
  coffee: string
  hydrogen_peroxide_or_turbidity: string
  analyst: string
  remarks: string
}
