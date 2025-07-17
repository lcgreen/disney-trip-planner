import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { RootState } from './types'

// Import slices
import userReducer from './slices/userSlice'
import widgetsReducer from './slices/widgetsSlice'
import countdownReducer from './slices/countdownSlice'
import budgetReducer from './slices/budgetSlice'
import packingReducer from './slices/packingSlice'
import plannerReducer from './slices/plannerSlice'
import uiReducer from './slices/uiSlice'

// Import middleware
import { storageMiddleware, loadInitialState } from './middleware/storageMiddleware'
import { autoSaveMiddleware } from './middleware/autoSaveMiddleware'

// Load initial state from localStorage
const preloadedState = loadInitialState()

// Configure the store
export const store = configureStore({
  reducer: {
    user: userReducer,
    widgets: widgetsReducer,
    countdown: countdownReducer,
    budget: budgetReducer,
    packing: packingReducer,
    planner: plannerReducer,
    ui: uiReducer,
  },
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization checks
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
          'persist/FLUSH',
        ],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.timestamp', 'meta.arg.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['ui.notifications'],
      },
    }).concat(storageMiddleware, autoSaveMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
})

// Export types for use throughout the app
export type AppDispatch = typeof store.dispatch
export type AppState = ReturnType<typeof store.getState>

// Typed hooks for use in components
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// Export store for use in tests and other contexts
export default store