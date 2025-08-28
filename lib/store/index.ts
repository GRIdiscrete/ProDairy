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
