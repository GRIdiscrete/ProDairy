import { configureStore } from "@reduxjs/toolkit"
import { type TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import dashboardReducer from "./slices/dashboardSlice"
import productionReducer from "./slices/productionSlice"
import laboratoryReducer from "./slices/laboratorySlice"
import machineReducer from "./slices/machineSlice"
import supplierReducer from "./slices/supplierSlice"
import userReducer from "./slices/userSlice"
import rolesReducer from "./slices/rolesSlice"
import usersReducer from "./slices/usersSlice"
import siloReducer from "./slices/siloSlice"
import rawMaterialReducer from "./slices/rawMaterialSlice"
import processReducer from "./slices/processSlice"
import productionPlanReducer from "./slices/productionPlanSlice"
import driverFormReducer from "./slices/driverFormSlice"
import authReducer from "./slices/authSlice"
import bmtControlFormReducer from "./slices/bmtControlFormSlice"
import cipControlFormReducer from "./slices/cipControlFormSlice"
import istControlFormReducer from "./slices/istControlFormSlice"
import sterilisedMilkProcessReducer from "./slices/sterilisedMilkProcessSlice"
import palletiserSheetReducer from "./slices/palletiserSheetSlice"
import flexOneSteriliserProcessReducer from "./slices/flexOneSteriliserProcessSlice"
import fillerLog2Reducer from "./slices/fillerLog2Slice"
import rawMilkIntakeReducer from "./slices/rawMilkIntakeSlice"
import standardizingReducer from "./slices/standardizingSlice"
import pasteurizingReducer from "./slices/pasteurizingSlice"
import filmaticLinesProductionSheetReducer from "./slices/filmaticLinesProductionSheetSlice"
import filmaticLinesProductionSheetDetailReducer from "./slices/filmaticLinesProductionSheetDetailSlice"
import filmaticLinesBottlesReconciliationReducer from "./slices/filmaticLinesBottlesReconciliationSlice"
import filmaticLinesMilkReconciliationReducer from "./slices/filmaticLinesMilkReconciliationSlice"
import filmaticLinesStoppageTimeMinutesReducer from "./slices/filmaticLinesStoppageTimeMinutesSlice"
export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    production: productionReducer,
    laboratory: laboratoryReducer,
    machine: machineReducer,
    supplier: supplierReducer,
    user: userReducer,
    roles: rolesReducer,
    users: usersReducer,
    silo: siloReducer,
    rawMaterial: rawMaterialReducer,
    process: processReducer,
    productionPlan: productionPlanReducer,
    driverForm: driverFormReducer,
    auth: authReducer,
    bmtControlForms: bmtControlFormReducer,
    cipControlForms: cipControlFormReducer,
    istControlForms: istControlFormReducer,
    sterilisedMilkProcesses: sterilisedMilkProcessReducer,
    palletiserSheets: palletiserSheetReducer,
    flexOneSteriliserProcesses: flexOneSteriliserProcessReducer,
    fillerLog2s: fillerLog2Reducer,
    rawMilkIntake: rawMilkIntakeReducer,
    standardizing: standardizingReducer,
    pasteurizing: pasteurizingReducer,
    filmaticLinesProductionSheets: filmaticLinesProductionSheetReducer,
    filmaticLinesProductionSheetDetails: filmaticLinesProductionSheetDetailReducer,
    filmaticLinesBottlesReconciliations: filmaticLinesBottlesReconciliationReducer,
    filmaticLinesMilkReconciliations: filmaticLinesMilkReconciliationReducer,
    filmaticLinesStoppageTimeMinutes: filmaticLinesStoppageTimeMinutesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector


