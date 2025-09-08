import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import {
  FillerLog2,
  FillerLog2PackageIntegrity,
  FillerLog2PackageIntegrityParameters,
  FillerLog2ProcessControl,
  FillerLog2ProcessControlParameters,
  FillerLog2PMSplice,
  FillerLog2PrepAndSterilization,
  FillerLog2StoppagesLog,
  FillerLog2StripSplice,
  getFillerLog2s,
  getFillerLog2,
  createFillerLog2,
  updateFillerLog2,
  deleteFillerLog2,
  getFillerLog2PackageIntegrities,
  getFillerLog2PackageIntegrity,
  createFillerLog2PackageIntegrity,
  updateFillerLog2PackageIntegrity,
  deleteFillerLog2PackageIntegrity,
  getFillerLog2PackageIntegrityParameters,
  getFillerLog2PackageIntegrityParameter,
  createFillerLog2PackageIntegrityParameters,
  updateFillerLog2PackageIntegrityParameters,
  deleteFillerLog2PackageIntegrityParameters,
  getFillerLog2ProcessControls,
  getFillerLog2ProcessControl,
  createFillerLog2ProcessControl,
  updateFillerLog2ProcessControl,
  deleteFillerLog2ProcessControl,
  getFillerLog2ProcessControlParameters,
  getFillerLog2ProcessControlParameter,
  createFillerLog2ProcessControlParameter,
  updateFillerLog2ProcessControlParameter,
  deleteFillerLog2ProcessControlParameter,
  getFillerLog2PMSplices,
  getFillerLog2PMSplice,
  createFillerLog2PMSplice,
  updateFillerLog2PMSplice,
  deleteFillerLog2PMSplice,
  getFillerLog2PrepAndSterilizations,
  getFillerLog2PrepAndSterilization,
  createFillerLog2PrepAndSterilization,
  updateFillerLog2PrepAndSterilization,
  deleteFillerLog2PrepAndSterilization,
  getFillerLog2StoppagesLogs,
  getFillerLog2StoppagesLog,
  createFillerLog2StoppagesLog,
  updateFillerLog2StoppagesLog,
  deleteFillerLog2StoppagesLog,
  getFillerLog2StripSplices,
  getFillerLog2StripSplice,
  createFillerLog2StripSplice,
  updateFillerLog2StripSplice,
  deleteFillerLog2StripSplice
} from '@/lib/api/data-capture-forms'

interface FillerLog2State {
  // Main Filler Log 2
  fillerLog2s: FillerLog2[]
  selectedFillerLog2: FillerLog2 | null
  
  // Package Integrity
  packageIntegrities: FillerLog2PackageIntegrity[]
  selectedPackageIntegrity: FillerLog2PackageIntegrity | null
  
  // Package Integrity Parameters
  packageIntegrityParameters: FillerLog2PackageIntegrityParameters[]
  selectedPackageIntegrityParameter: FillerLog2PackageIntegrityParameters | null
  
  // Process Control
  processControls: FillerLog2ProcessControl[]
  selectedProcessControl: FillerLog2ProcessControl | null
  
  // Process Control Parameters
  processControlParameters: FillerLog2ProcessControlParameters[]
  selectedProcessControlParameter: FillerLog2ProcessControlParameters | null
  
  // PM Splice
  pmSplices: FillerLog2PMSplice[]
  selectedPMSplice: FillerLog2PMSplice | null
  
  // Prep and Sterilization
  prepAndSterilizations: FillerLog2PrepAndSterilization[]
  selectedPrepAndSterilization: FillerLog2PrepAndSterilization | null
  
  // Stoppages Log
  stoppagesLogs: FillerLog2StoppagesLog[]
  selectedStoppagesLog: FillerLog2StoppagesLog | null
  
  // Strip Splice
  stripSplices: FillerLog2StripSplice[]
  selectedStripSplice: FillerLog2StripSplice | null
  
  // Loading states
  loading: boolean
  operationLoading: {
    fetch: boolean
    create: boolean
    update: boolean
    delete: boolean
  }
  
  // Error handling
  error: string | null
  
  // Cache management
  lastFetched: number | null
}

const initialState: FillerLog2State = {
  fillerLog2s: [],
  selectedFillerLog2: null,
  packageIntegrities: [],
  selectedPackageIntegrity: null,
  packageIntegrityParameters: [],
  selectedPackageIntegrityParameter: null,
  processControls: [],
  selectedProcessControl: null,
  processControlParameters: [],
  selectedProcessControlParameter: null,
  pmSplices: [],
  selectedPMSplice: null,
  prepAndSterilizations: [],
  selectedPrepAndSterilization: null,
  stoppagesLogs: [],
  selectedStoppagesLog: null,
  stripSplices: [],
  selectedStripSplice: null,
  loading: false,
  operationLoading: {
    fetch: false,
    create: false,
    update: false,
    delete: false
  },
  error: null,
  lastFetched: null
}

// Async thunks for Filler Log 2
export const fetchFillerLog2s = createAsyncThunk(
  'fillerLog2s/fetchFillerLog2s',
  async () => {
    const response = await getFillerLog2s()
    return response
  }
)

export const fetchFillerLog2 = createAsyncThunk(
  'fillerLog2s/fetchFillerLog2',
  async (id: string) => {
    const response = await getFillerLog2(id)
    return response
  }
)

export const createFillerLog2Action = createAsyncThunk(
  'fillerLog2s/createFillerLog2',
  async (data: Omit<FillerLog2, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await createFillerLog2(data)
    return response
  }
)

export const updateFillerLog2Action = createAsyncThunk(
  'fillerLog2s/updateFillerLog2',
  async (data: FillerLog2) => {
    const response = await updateFillerLog2(data)
    return response
  }
)

export const deleteFillerLog2Action = createAsyncThunk(
  'fillerLog2s/deleteFillerLog2',
  async (id: string) => {
    await deleteFillerLog2(id)
    return id
  }
)

// Async thunks for Package Integrity
export const fetchFillerLog2PackageIntegrities = createAsyncThunk(
  'fillerLog2s/fetchPackageIntegrities',
  async () => {
    const response = await getFillerLog2PackageIntegrities()
    return response
  }
)

export const fetchFillerLog2PackageIntegrity = createAsyncThunk(
  'fillerLog2s/fetchPackageIntegrity',
  async (id: string) => {
    const response = await getFillerLog2PackageIntegrity(id)
    return response
  }
)

export const createFillerLog2PackageIntegrityAction = createAsyncThunk(
  'fillerLog2s/createPackageIntegrity',
  async (data: Omit<FillerLog2PackageIntegrity, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await createFillerLog2PackageIntegrity(data)
    return response
  }
)

export const updateFillerLog2PackageIntegrityAction = createAsyncThunk(
  'fillerLog2s/updatePackageIntegrity',
  async (data: FillerLog2PackageIntegrity) => {
    const response = await updateFillerLog2PackageIntegrity(data)
    return response
  }
)

export const deleteFillerLog2PackageIntegrityAction = createAsyncThunk(
  'fillerLog2s/deletePackageIntegrity',
  async (id: string) => {
    await deleteFillerLog2PackageIntegrity(id)
    return id
  }
)

// Async thunks for Package Integrity Parameters
export const fetchFillerLog2PackageIntegrityParameters = createAsyncThunk(
  'fillerLog2s/fetchPackageIntegrityParameters',
  async () => {
    const response = await getFillerLog2PackageIntegrityParameters()
    return response
  }
)

export const fetchFillerLog2PackageIntegrityParameter = createAsyncThunk(
  'fillerLog2s/fetchPackageIntegrityParameter',
  async (id: string) => {
    const response = await getFillerLog2PackageIntegrityParameter(id)
    return response
  }
)

export const createFillerLog2PackageIntegrityParametersAction = createAsyncThunk(
  'fillerLog2s/createPackageIntegrityParameters',
  async (data: Omit<FillerLog2PackageIntegrityParameters, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await createFillerLog2PackageIntegrityParameters(data)
    return response
  }
)

export const updateFillerLog2PackageIntegrityParametersAction = createAsyncThunk(
  'fillerLog2s/updatePackageIntegrityParameters',
  async (data: FillerLog2PackageIntegrityParameters) => {
    const response = await updateFillerLog2PackageIntegrityParameters(data)
    return response
  }
)

export const deleteFillerLog2PackageIntegrityParametersAction = createAsyncThunk(
  'fillerLog2s/deletePackageIntegrityParameters',
  async (id: string) => {
    await deleteFillerLog2PackageIntegrityParameters(id)
    return id
  }
)

// Async thunks for Process Control
export const fetchFillerLog2ProcessControls = createAsyncThunk(
  'fillerLog2s/fetchProcessControls',
  async () => {
    const response = await getFillerLog2ProcessControls()
    return response
  }
)

export const fetchFillerLog2ProcessControl = createAsyncThunk(
  'fillerLog2s/fetchProcessControl',
  async (id: string) => {
    const response = await getFillerLog2ProcessControl(id)
    return response
  }
)

export const createFillerLog2ProcessControlAction = createAsyncThunk(
  'fillerLog2s/createProcessControl',
  async (data: Omit<FillerLog2ProcessControl, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await createFillerLog2ProcessControl(data)
    return response
  }
)

export const updateFillerLog2ProcessControlAction = createAsyncThunk(
  'fillerLog2s/updateProcessControl',
  async (data: FillerLog2ProcessControl) => {
    const response = await updateFillerLog2ProcessControl(data)
    return response
  }
)

export const deleteFillerLog2ProcessControlAction = createAsyncThunk(
  'fillerLog2s/deleteProcessControl',
  async (id: string) => {
    await deleteFillerLog2ProcessControl(id)
    return id
  }
)

// Async thunks for Process Control Parameters
export const fetchFillerLog2ProcessControlParameters = createAsyncThunk(
  'fillerLog2s/fetchProcessControlParameters',
  async () => {
    const response = await getFillerLog2ProcessControlParameters()
    return response
  }
)

export const fetchFillerLog2ProcessControlParameter = createAsyncThunk(
  'fillerLog2s/fetchProcessControlParameter',
  async (id: string) => {
    const response = await getFillerLog2ProcessControlParameter(id)
    return response
  }
)

export const createFillerLog2ProcessControlParametersAction = createAsyncThunk(
  'fillerLog2s/createProcessControlParameters',
  async (data: Omit<FillerLog2ProcessControlParameters, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await createFillerLog2ProcessControlParameter(data)
    return response
  }
)

export const updateFillerLog2ProcessControlParametersAction = createAsyncThunk(
  'fillerLog2s/updateProcessControlParameters',
  async (data: FillerLog2ProcessControlParameters) => {
    const response = await updateFillerLog2ProcessControlParameter(data)
    return response
  }
)

export const deleteFillerLog2ProcessControlParametersAction = createAsyncThunk(
  'fillerLog2s/deleteProcessControlParameters',
  async (id: string) => {
    await deleteFillerLog2ProcessControlParameter(id)
    return id
  }
)

// Async thunks for PM Splice
export const fetchFillerLog2PMSplices = createAsyncThunk(
  'fillerLog2s/fetchPMSplices',
  async () => {
    const response = await getFillerLog2PMSplices()
    return response
  }
)

export const fetchFillerLog2PMSplice = createAsyncThunk(
  'fillerLog2s/fetchPMSplice',
  async (id: string) => {
    const response = await getFillerLog2PMSplice(id)
    return response
  }
)

export const createFillerLog2PMSpliceAction = createAsyncThunk(
  'fillerLog2s/createPMSplice',
  async (data: Omit<FillerLog2PMSplice, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await createFillerLog2PMSplice(data)
    return response
  }
)

export const updateFillerLog2PMSpliceAction = createAsyncThunk(
  'fillerLog2s/updatePMSplice',
  async (data: FillerLog2PMSplice) => {
    const response = await updateFillerLog2PMSplice(data)
    return response
  }
)

export const deleteFillerLog2PMSpliceAction = createAsyncThunk(
  'fillerLog2s/deletePMSplice',
  async (id: string) => {
    await deleteFillerLog2PMSplice(id)
    return id
  }
)

// Async thunks for Prep and Sterilization
export const fetchFillerLog2PrepAndSterilizations = createAsyncThunk(
  'fillerLog2s/fetchPrepAndSterilizations',
  async () => {
    const response = await getFillerLog2PrepAndSterilizations()
    return response
  }
)

export const fetchFillerLog2PrepAndSterilization = createAsyncThunk(
  'fillerLog2s/fetchPrepAndSterilization',
  async (id: string) => {
    const response = await getFillerLog2PrepAndSterilization(id)
    return response
  }
)

export const createFillerLog2PrepAndSterilizationAction = createAsyncThunk(
  'fillerLog2s/createPrepAndSterilization',
  async (data: Omit<FillerLog2PrepAndSterilization, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await createFillerLog2PrepAndSterilization(data)
    return response
  }
)

export const updateFillerLog2PrepAndSterilizationAction = createAsyncThunk(
  'fillerLog2s/updatePrepAndSterilization',
  async (data: FillerLog2PrepAndSterilization) => {
    const response = await updateFillerLog2PrepAndSterilization(data)
    return response
  }
)

export const deleteFillerLog2PrepAndSterilizationAction = createAsyncThunk(
  'fillerLog2s/deletePrepAndSterilization',
  async (id: string) => {
    await deleteFillerLog2PrepAndSterilization(id)
    return id
  }
)

// Async thunks for Stoppages Log
export const fetchFillerLog2StoppagesLogs = createAsyncThunk(
  'fillerLog2s/fetchStoppagesLogs',
  async () => {
    const response = await getFillerLog2StoppagesLogs()
    return response
  }
)

export const fetchFillerLog2StoppagesLog = createAsyncThunk(
  'fillerLog2s/fetchStoppagesLog',
  async (id: string) => {
    const response = await getFillerLog2StoppagesLog(id)
    return response
  }
)

export const createFillerLog2StoppagesLogAction = createAsyncThunk(
  'fillerLog2s/createStoppagesLog',
  async (data: Omit<FillerLog2StoppagesLog, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await createFillerLog2StoppagesLog(data)
    return response
  }
)

export const updateFillerLog2StoppagesLogAction = createAsyncThunk(
  'fillerLog2s/updateStoppagesLog',
  async (data: FillerLog2StoppagesLog) => {
    const response = await updateFillerLog2StoppagesLog(data)
    return response
  }
)

export const deleteFillerLog2StoppagesLogAction = createAsyncThunk(
  'fillerLog2s/deleteStoppagesLog',
  async (id: string) => {
    await deleteFillerLog2StoppagesLog(id)
    return id
  }
)

// Async thunks for Strip Splice
export const fetchFillerLog2StripSplices = createAsyncThunk(
  'fillerLog2s/fetchStripSplices',
  async () => {
    const response = await getFillerLog2StripSplices()
    return response
  }
)

export const fetchFillerLog2StripSplice = createAsyncThunk(
  'fillerLog2s/fetchStripSplice',
  async (id: string) => {
    const response = await getFillerLog2StripSplice(id)
    return response
  }
)

export const createFillerLog2StripSpliceAction = createAsyncThunk(
  'fillerLog2s/createStripSplice',
  async (data: Omit<FillerLog2StripSplice, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await createFillerLog2StripSplice(data)
    return response
  }
)

export const updateFillerLog2StripSpliceAction = createAsyncThunk(
  'fillerLog2s/updateStripSplice',
  async (data: FillerLog2StripSplice) => {
    const response = await updateFillerLog2StripSplice(data)
    return response
  }
)

export const deleteFillerLog2StripSpliceAction = createAsyncThunk(
  'fillerLog2s/deleteStripSplice',
  async (id: string) => {
    await deleteFillerLog2StripSplice(id)
    return id
  }
)

const fillerLog2Slice = createSlice({
  name: 'fillerLog2s',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setSelectedFillerLog2: (state, action: PayloadAction<FillerLog2 | null>) => {
      state.selectedFillerLog2 = action.payload
    },
    setSelectedPackageIntegrity: (state, action: PayloadAction<FillerLog2PackageIntegrity | null>) => {
      state.selectedPackageIntegrity = action.payload
    },
    setSelectedPackageIntegrityParameter: (state, action: PayloadAction<FillerLog2PackageIntegrityParameters | null>) => {
      state.selectedPackageIntegrityParameter = action.payload
    },
    setSelectedProcessControl: (state, action: PayloadAction<FillerLog2ProcessControl | null>) => {
      state.selectedProcessControl = action.payload
    },
    setSelectedProcessControlParameter: (state, action: PayloadAction<FillerLog2ProcessControlParameters | null>) => {
      state.selectedProcessControlParameter = action.payload
    },
    setSelectedPMSplice: (state, action: PayloadAction<FillerLog2PMSplice | null>) => {
      state.selectedPMSplice = action.payload
    },
    setSelectedPrepAndSterilization: (state, action: PayloadAction<FillerLog2PrepAndSterilization | null>) => {
      state.selectedPrepAndSterilization = action.payload
    },
    setSelectedStoppagesLog: (state, action: PayloadAction<FillerLog2StoppagesLog | null>) => {
      state.selectedStoppagesLog = action.payload
    },
    setSelectedStripSplice: (state, action: PayloadAction<FillerLog2StripSplice | null>) => {
      state.selectedStripSplice = action.payload
    }
  },
  extraReducers: (builder) => {
    // Fetch Filler Log 2s
    builder
      .addCase(fetchFillerLog2s.pending, (state) => {
        state.operationLoading.fetch = true
        state.loading = true
        state.error = null
      })
      .addCase(fetchFillerLog2s.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.loading = false
        state.fillerLog2s = action.payload
        state.lastFetched = Date.now()
      })
      .addCase(fetchFillerLog2s.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.loading = false
        state.error = action.error.message || 'Failed to fetch filler log 2s'
      })

    // Create Filler Log 2
    builder
      .addCase(createFillerLog2Action.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createFillerLog2Action.fulfilled, (state, action) => {
        state.operationLoading.create = false
        state.fillerLog2s.push(action.payload)
        state.lastFetched = null // Force refresh on next fetch
      })
      .addCase(createFillerLog2Action.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.error.message || 'Failed to create filler log 2'
      })

    // Update Filler Log 2
    builder
      .addCase(updateFillerLog2Action.pending, (state) => {
        state.operationLoading.update = true
        state.error = null
      })
      .addCase(updateFillerLog2Action.fulfilled, (state, action) => {
        state.operationLoading.update = false
        const index = state.fillerLog2s.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.fillerLog2s[index] = action.payload
        }
        state.lastFetched = null // Force refresh on next fetch
      })
      .addCase(updateFillerLog2Action.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.error.message || 'Failed to update filler log 2'
      })

    // Delete Filler Log 2
    builder
      .addCase(deleteFillerLog2Action.pending, (state) => {
        state.operationLoading.delete = true
        state.error = null
      })
      .addCase(deleteFillerLog2Action.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.fillerLog2s = state.fillerLog2s.filter(item => item.id !== action.payload)
        state.lastFetched = null // Force refresh on next fetch
      })
      .addCase(deleteFillerLog2Action.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.error.message || 'Failed to delete filler log 2'
      })

    // Fetch Package Integrities
    builder
      .addCase(fetchFillerLog2PackageIntegrities.pending, (state) => {
        state.operationLoading.fetch = true
        state.loading = true
        state.error = null
      })
      .addCase(fetchFillerLog2PackageIntegrities.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.loading = false
        state.packageIntegrities = action.payload
        state.lastFetched = Date.now()
      })
      .addCase(fetchFillerLog2PackageIntegrities.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.loading = false
        state.error = action.error.message || 'Failed to fetch package integrities'
      })

    // Create Package Integrity
    builder
      .addCase(createFillerLog2PackageIntegrityAction.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createFillerLog2PackageIntegrityAction.fulfilled, (state, action) => {
        state.operationLoading.create = false
        state.packageIntegrities.push(action.payload)
        state.lastFetched = null // Force refresh on next fetch
      })
      .addCase(createFillerLog2PackageIntegrityAction.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.error.message || 'Failed to create package integrity'
      })

    // Update Package Integrity
    builder
      .addCase(updateFillerLog2PackageIntegrityAction.pending, (state) => {
        state.operationLoading.update = true
        state.error = null
      })
      .addCase(updateFillerLog2PackageIntegrityAction.fulfilled, (state, action) => {
        state.operationLoading.update = false
        const index = state.packageIntegrities.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.packageIntegrities[index] = action.payload
        }
        state.lastFetched = null // Force refresh on next fetch
      })
      .addCase(updateFillerLog2PackageIntegrityAction.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.error.message || 'Failed to update package integrity'
      })

    // Delete Package Integrity
    builder
      .addCase(deleteFillerLog2PackageIntegrityAction.pending, (state) => {
        state.operationLoading.delete = true
        state.error = null
      })
      .addCase(deleteFillerLog2PackageIntegrityAction.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.packageIntegrities = state.packageIntegrities.filter(item => item.id !== action.payload)
        state.lastFetched = null // Force refresh on next fetch
      })
      .addCase(deleteFillerLog2PackageIntegrityAction.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.error.message || 'Failed to delete package integrity'
      })

    // Fetch Package Integrity Parameters
    builder
      .addCase(fetchFillerLog2PackageIntegrityParameters.pending, (state) => {
        state.operationLoading.fetch = true
        state.loading = true
        state.error = null
      })
      .addCase(fetchFillerLog2PackageIntegrityParameters.fulfilled, (state, action) => {
        state.operationLoading.fetch = false
        state.loading = false
        state.packageIntegrityParameters = action.payload
        state.lastFetched = Date.now()
      })
      .addCase(fetchFillerLog2PackageIntegrityParameters.rejected, (state, action) => {
        state.operationLoading.fetch = false
        state.loading = false
        state.error = action.error.message || 'Failed to fetch package integrity parameters'
      })

    // Create Package Integrity Parameters
    builder
      .addCase(createFillerLog2PackageIntegrityParametersAction.pending, (state) => {
        state.operationLoading.create = true
        state.error = null
      })
      .addCase(createFillerLog2PackageIntegrityParametersAction.fulfilled, (state, action) => {
        state.operationLoading.create = false
        state.packageIntegrityParameters.push(action.payload)
        state.lastFetched = null // Force refresh on next fetch
      })
      .addCase(createFillerLog2PackageIntegrityParametersAction.rejected, (state, action) => {
        state.operationLoading.create = false
        state.error = action.error.message || 'Failed to create package integrity parameters'
      })

    // Update Package Integrity Parameters
    builder
      .addCase(updateFillerLog2PackageIntegrityParametersAction.pending, (state) => {
        state.operationLoading.update = true
        state.error = null
      })
      .addCase(updateFillerLog2PackageIntegrityParametersAction.fulfilled, (state, action) => {
        state.operationLoading.update = false
        const index = state.packageIntegrityParameters.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.packageIntegrityParameters[index] = action.payload
        }
        state.lastFetched = null // Force refresh on next fetch
      })
      .addCase(updateFillerLog2PackageIntegrityParametersAction.rejected, (state, action) => {
        state.operationLoading.update = false
        state.error = action.error.message || 'Failed to update package integrity parameters'
      })

    // Delete Package Integrity Parameters
    builder
      .addCase(deleteFillerLog2PackageIntegrityParametersAction.pending, (state) => {
        state.operationLoading.delete = true
        state.error = null
      })
      .addCase(deleteFillerLog2PackageIntegrityParametersAction.fulfilled, (state, action) => {
        state.operationLoading.delete = false
        state.packageIntegrityParameters = state.packageIntegrityParameters.filter(item => item.id !== action.payload)
        state.lastFetched = null // Force refresh on next fetch
      })
      .addCase(deleteFillerLog2PackageIntegrityParametersAction.rejected, (state, action) => {
        state.operationLoading.delete = false
        state.error = action.error.message || 'Failed to delete package integrity parameters'
      })
  }
})

export const {
  clearError,
  setSelectedFillerLog2,
  setSelectedPackageIntegrity,
  setSelectedPackageIntegrityParameter,
  setSelectedProcessControl,
  setSelectedProcessControlParameter,
  setSelectedPMSplice,
  setSelectedPrepAndSterilization,
  setSelectedStoppagesLog,
  setSelectedStripSplice
} = fillerLog2Slice.actions

export default fillerLog2Slice.reducer
