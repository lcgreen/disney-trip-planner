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

// Import demo dashboard data
import demoDashboard from '@/config/demo-dashboard.json'
import type { CountdownData, BudgetData, PackingData, PlannerData, WidgetConfig } from '@/types'

function getInitialState() {
  if (typeof window !== 'undefined') {
    // Try to get user from localStorage
    let user = undefined
    try {
      const userData = localStorage.getItem('disney-user')
      if (userData) {
        user = JSON.parse(userData)
      }
    } catch {}

    // If anonymous, always use demo data
    if (user?.level === 'anon' || !user) {
      // Patch demo data for required fields and enums
      const validDigitStyles = ['modern', 'classic', 'neon', 'minimal']
      const validWidgetSizes = ['small', 'medium', 'large', 'wide', 'tall', 'full']
      const validLayouts = ['horizontal', 'vertical', 'compact', 'grid']
      const validFontSizes = ['small', 'medium', 'large', 'xl']
      const validBackgroundEffects = ['none', 'particles', 'gradient', 'animated']
      const defaultCategory = { color: 'blue', icon: 'Star' }
      const patchedCountdowns = (demoDashboard.data?.countdowns || []).map(item => ({
        ...item,
        updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
        settings: {
          ...item.settings,
          digitStyle: (validDigitStyles.includes(item.settings?.digitStyle) ? item.settings.digitStyle : 'modern') as 'modern' | 'classic' | 'neon' | 'minimal',
          layout: (validLayouts.includes(item.settings?.layout) ? item.settings.layout : 'horizontal') as 'horizontal' | 'vertical' | 'compact' | 'grid',
          fontSize: (validFontSizes.includes(item.settings?.fontSize) ? item.settings.fontSize : 'medium') as 'small' | 'medium' | 'large' | 'xl',
          backgroundEffect: (validBackgroundEffects.includes(item.settings?.backgroundEffect) ? item.settings.backgroundEffect : 'gradient') as 'none' | 'particles' | 'gradient' | 'animated',
        },
      })) as unknown as CountdownData[]
      const patchedBudgets = (demoDashboard.data?.budgets || []).map(item => ({
        ...item,
        updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
        categories: (item.categories || []).map(cat => ({
          ...cat,
          color: (cat.color || defaultCategory.color) as string,
          icon: (cat.icon || defaultCategory.icon) as string,
        })),
      })) as unknown as BudgetData[]
      const patchedPackingLists = (demoDashboard.data?.packingLists || []).map(item => ({
        ...item,
        updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
        selectedWeather: Array.isArray(item.selectedWeather) ? item.selectedWeather : [],
      })) as unknown as PackingData[]
      const patchedTripPlans = (demoDashboard.data?.tripPlans || []).map(item => ({
        ...item,
        updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
        days: (item.days || []).map(day => ({
          ...day,
          plans: Array.isArray(day.activities)
            ? day.activities.map(act => ({
                id: act.id,
                date: day.date,
                time: act.time,
                activity: act.title,
                park: day.park,
              }))
            : [],
        })),
      })) as unknown as PlannerData[]
      const patchedWidgets = demoDashboard.widgets.map(w => ({
        ...w,
        type: w.type as 'countdown' | 'planner' | 'budget' | 'packing',
        size: (validWidgetSizes.includes(w.size) ? w.size : 'medium') as 'small' | 'medium' | 'large' | 'wide' | 'tall' | 'full',
      })) as unknown as WidgetConfig[]

      return {
        user: {
          currentUser: user || {
            id: `anon-${Date.now()}`,
            level: 'anon',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          isLoading: false,
          error: null
        },
        widgets: {
          configs: patchedWidgets,
          isLoading: false,
          error: null,
          pendingLinks: {}
        },
        countdown: {
          items: patchedCountdowns,
          currentItem: null,
          isLoading: false,
          error: null,
          lastSaved: null,
          isSaving: false,
          targetDate: '',
          selectedPark: null,
          settings: {
            showMilliseconds: false,
            showTimezone: true,
            showTips: true,
            showAttractions: true,
            playSound: true,
            autoRefresh: true,
            digitStyle: 'modern',
            layout: 'horizontal',
            fontSize: 'medium',
            backgroundEffect: 'gradient'
          },
          customTheme: null,
          isActive: false,
          countdown: { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 },
          milliseconds: 0,
          disneyParks: []
        },
        budget: {
          items: patchedBudgets,
          currentItem: null,
          isLoading: false,
          error: null,
          lastSaved: null,
          isSaving: false,
          totalBudget: 0,
          categories: [],
          expenses: [],
          showAddExpense: false,
          newExpense: { category: '', description: '', amount: '', date: '', isEstimate: false }
        },
        packing: {
          items: patchedPackingLists,
          currentItem: null,
          isLoading: false,
          error: null,
          lastSaved: null,
          isSaving: false,
          packingItems: [],
          selectedWeather: [],
          filterCategory: 'all',
          showAddItem: false,
          newItem: { name: '', category: '', isEssential: false },
          completionStats: { total: 0, completed: 0, essential: 0, completedEssential: 0 }
        },
        planner: {
          items: patchedTripPlans,
          currentItem: null,
          isLoading: false,
          error: null,
          lastSaved: null,
          isSaving: false,
          days: [],
          currentName: '',
          showAddDay: false,
          showAddPlan: false,
          editingPlan: null,
          newDay: { date: '', park: '' },
          newPlan: { time: '', activity: '', park: '' },
          selectedDayId: null,
          formErrors: { date: '', park: '' },
          stats: { totalDays: 0, totalPlans: 0, parksCount: 0 }
        }
      }
    }
  }
  // Default: load from localStorage for authenticated users
  return loadInitialState()
}

const preloadedState = getInitialState()

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