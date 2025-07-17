import { Middleware } from '@reduxjs/toolkit'
import { RootState } from '../types'
import { getAllParksFlattened } from '@/config'

// Storage keys for different parts of the state
const STORAGE_KEYS = {
  USER: 'disney-user',
  WIDGETS: 'disney-widget-configs',
  COUNTDOWN: 'disney-countdowns',
  BUDGET: 'disney-budgets',
  PACKING: 'disney-packing-lists',
  PLANNER: 'disney-trip-plans',
} as const

// Actions that should trigger storage updates
const STORAGE_ACTIONS = [
  'user/setUser',
  'user/clearUser',
  'user/updateUser',
  'user/createStandardUser/fulfilled',
  'user/upgradeToStandard/fulfilled',
  'user/upgradeToPremium/fulfilled',
  'user/upgradeToAdmin/fulfilled',
  'widgets/setConfigs',
  'widgets/addConfig',
  'widgets/updateConfig',
  'widgets/removeConfig',
  'widgets/reorderConfigs',
  'countdown/setItems',
  'countdown/addItem',
  'countdown/updateItem',
  'countdown/removeItem',
  'budget/setItems',
  'budget/addItem',
  'budget/updateItem',
  'budget/removeItem',
  'packing/setItems',
  'packing/addItem',
  'packing/updateItem',
  'packing/removeItem',
  'planner/setItems',
  'planner/addItem',
  'planner/updateItem',
  'planner/removeItem',
] as const

export const storageMiddleware: Middleware<{}, RootState> = store => next => action => {
  // Call the next middleware
  const result = next(action)

  // Check if this action should trigger storage update
  if (STORAGE_ACTIONS.includes((action as any).type)) {
    const state = store.getState()

    // Don't save for anonymous users (except in test mode)
    if (state.user.currentUser?.level === 'anon' && process.env.NODE_ENV !== 'test') {
      return result
    }

    try {
      const actionType = (action as any).type as string

      // Save user state
      if (actionType.startsWith('user/')) {
        console.log('[StorageMiddleware] Saving user to localStorage:', state.user.currentUser)
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user.currentUser))
      }

      // Save widgets state
      if (actionType.startsWith('widgets/')) {
        localStorage.setItem(STORAGE_KEYS.WIDGETS, JSON.stringify(state.widgets.configs))
      }

      // Save countdown state
      if (actionType.startsWith('countdown/')) {
        localStorage.setItem(STORAGE_KEYS.COUNTDOWN, JSON.stringify(state.countdown.items))
      }

      // Save budget state
      if (actionType.startsWith('budget/')) {
        localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(state.budget.items))
      }

      // Save packing state
      if (actionType.startsWith('packing/')) {
        localStorage.setItem(STORAGE_KEYS.PACKING, JSON.stringify(state.packing.items))
      }

      // Save planner state
      if (actionType.startsWith('planner/')) {
        localStorage.setItem(STORAGE_KEYS.PLANNER, JSON.stringify(state.planner.items))
      }

      console.log('[StorageMiddleware] Saved state for action:', actionType)
    } catch (error) {
      console.error('[StorageMiddleware] Failed to save state:', error)
    }
  }

  return result
}

// Helper function to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined'

// Helper function to load initial state from localStorage
export const loadInitialState = () => {
  const initialState: Partial<RootState> = {}

  // Don't try to access localStorage during SSR
  if (!isBrowser) {
    console.log('[StorageMiddleware] Skipping localStorage access during SSR')
    return initialState
  }

  try {
    // Load user state
    const userData = localStorage.getItem(STORAGE_KEYS.USER)
    if (userData) {
      const user = JSON.parse(userData)
      console.log('[StorageMiddleware] Loading user from localStorage:', user)
      initialState.user = {
        currentUser: user,
        isLoading: false,
        error: null
      }
    } else {
      console.log('[StorageMiddleware] No user data found in localStorage')
    }

    // Load widgets state
    const widgetsData = localStorage.getItem(STORAGE_KEYS.WIDGETS)
    if (widgetsData) {
      initialState.widgets = { configs: JSON.parse(widgetsData), isLoading: false, error: null, pendingLinks: {} }
    }

    // Load countdown state
    const countdownData = localStorage.getItem(STORAGE_KEYS.COUNTDOWN)
    if (countdownData) {
      initialState.countdown = {
        items: JSON.parse(countdownData),
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
        disneyParks: getAllParksFlattened()
      }
    }

    // Load budget state
    const budgetData = localStorage.getItem(STORAGE_KEYS.BUDGET)
    if (budgetData) {
      initialState.budget = {
        items: JSON.parse(budgetData),
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
      }
    }

    // Load packing state
    const packingData = localStorage.getItem(STORAGE_KEYS.PACKING)
    if (packingData) {
      initialState.packing = {
        items: JSON.parse(packingData),
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
      }
    }

    // Load planner state
    const plannerData = localStorage.getItem(STORAGE_KEYS.PLANNER)
    if (plannerData) {
      initialState.planner = {
        items: JSON.parse(plannerData),
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

    console.log('[StorageMiddleware] Loaded initial state from localStorage')
  } catch (error) {
    console.error('[StorageMiddleware] Failed to load initial state:', error)
  }

  return initialState
}