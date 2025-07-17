import { WidgetConfig, CountdownData, BudgetData, PackingData, PlannerData, PlannerDay, PlannerPlan, BudgetCategory, Expense, PackingItem } from '@/types'
import { DisneyPark, CountdownPalette } from '@/config/types'
import { User } from '@/lib/userManagement'

// Root state type
export interface RootState {
  user: UserState
  widgets: WidgetsState
  countdown: CountdownState
  budget: BudgetState
  packing: PackingState
  planner: PlannerState
  ui: UIState
}

// User state
export interface UserState {
  currentUser: User | null
  isLoading: boolean
  error: string | null
}

// Widgets state
export interface WidgetsState {
  configs: WidgetConfig[]
  isLoading: boolean
  error: string | null
  pendingLinks: Record<string, { widgetId: string; widgetType: string }>
}

// Countdown state
export interface CountdownState {
  items: CountdownData[]
  currentItem: CountdownData | null
  isLoading: boolean
  error: string | null
  lastSaved: Date | null
  isSaving: boolean
  // Real-time countdown state
  targetDate: string
  selectedPark: DisneyPark | null
  settings: {
    showMilliseconds: boolean
    showTimezone: boolean
    showTips: boolean
    showAttractions: boolean
    playSound: boolean
    autoRefresh: boolean
    digitStyle: 'modern' | 'classic' | 'neon' | 'minimal'
    layout: 'horizontal' | 'vertical' | 'compact' | 'grid'
    fontSize: 'small' | 'medium' | 'large' | 'xl'
    backgroundEffect: 'none' | 'particles' | 'gradient' | 'animated'
  }
  customTheme: CountdownPalette | null
  isActive: boolean
  countdown: {
    days: number
    hours: number
    minutes: number
    seconds: number
    total: number
  }
  milliseconds: number
  disneyParks: DisneyPark[]
}

// Budget state
export interface BudgetState {
  items: BudgetData[]
  currentItem: BudgetData | null
  isLoading: boolean
  error: string | null
  lastSaved: Date | null
  isSaving: boolean
  // Real-time budget state
  totalBudget: number
  categories: BudgetCategory[]
  expenses: Expense[]
  showAddExpense: boolean
  newExpense: {
    category: string
    description: string
    amount: string
    date: string
    isEstimate: boolean
  }
}

// Packing state
export interface PackingState {
  items: PackingData[]
  currentItem: PackingData | null
  isLoading: boolean
  error: string | null
  lastSaved: Date | null
  isSaving: boolean
  // Real-time packing state
  packingItems: PackingItem[]
  selectedWeather: string[]
  filterCategory: string
  showAddItem: boolean
  newItem: {
    name: string
    category: string
    isEssential: boolean
  }
  completionStats: {
    total: number
    completed: number
    essential: number
    completedEssential: number
  }
}

// Planner state
export interface PlannerState {
  items: PlannerData[]
  currentItem: PlannerData | null
  isLoading: boolean
  error: string | null
  lastSaved: Date | null
  isSaving: boolean
  // Real-time planner state
  days: PlannerDay[]
  currentName: string
  showAddDay: boolean
  showAddPlan: boolean
  editingPlan: PlannerPlan | null
  newDay: {
    date: string
    park: string
  }
  newPlan: {
    time: string
    activity: string
    park: string
  }
  selectedDayId: string | null
  formErrors: {
    date: string
    park: string
  }
  stats: {
    totalDays: number
    totalPlans: number
    parksCount: number
  }
}

// UI state
export interface UIState {
  modals: {
    saveModal: boolean
    loadModal: boolean
    settingsModal: boolean
    configModal: boolean
  }
  loading: {
    global: boolean
    widgets: boolean
    data: boolean
  }
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    duration?: number
  }>
}

// Action types
export type UserAction =
  | { type: 'user/setUser'; payload: User }
  | { type: 'user/clearUser' }
  | { type: 'user/setLoading'; payload: boolean }
  | { type: 'user/setError'; payload: string | null }

export type WidgetsAction =
  | { type: 'widgets/setConfigs'; payload: WidgetConfig[] }
  | { type: 'widgets/addConfig'; payload: WidgetConfig }
  | { type: 'widgets/updateConfig'; payload: { id: string; updates: Partial<WidgetConfig> } }
  | { type: 'widgets/removeConfig'; payload: string }
  | { type: 'widgets/reorderConfigs'; payload: string[] }
  | { type: 'widgets/setLoading'; payload: boolean }
  | { type: 'widgets/setError'; payload: string | null }
  | { type: 'widgets/setPendingLink'; payload: { widgetId: string; itemId: string; widgetType: string } }
  | { type: 'widgets/clearPendingLink'; payload: string }

export type CountdownAction =
  | { type: 'countdown/setItems'; payload: CountdownData[] }
  | { type: 'countdown/addItem'; payload: CountdownData }
  | { type: 'countdown/updateItem'; payload: { id: string; updates: Partial<CountdownData> } }
  | { type: 'countdown/removeItem'; payload: string }
  | { type: 'countdown/setCurrentItem'; payload: CountdownData | null }
  | { type: 'countdown/setSaving'; payload: boolean }
  | { type: 'countdown/setLastSaved'; payload: Date | null }
  | { type: 'countdown/clearError' }
  | { type: 'countdown/setTargetDate'; payload: string }
  | { type: 'countdown/setSelectedPark'; payload: DisneyPark | null }
  | { type: 'countdown/setSettings'; payload: CountdownState['settings'] }
  | { type: 'countdown/setCustomTheme'; payload: CountdownPalette | null }
  | { type: 'countdown/setCountdown'; payload: CountdownState['countdown'] }
  | { type: 'countdown/setMilliseconds'; payload: number }
  | { type: 'countdown/setIsActive'; payload: boolean }
  | { type: 'countdown/startCountdown' }
  | { type: 'countdown/stopCountdown' }
  | { type: 'countdown/resetCountdown' }
  | { type: 'countdown/loadCountdown'; payload: CountdownData }
  | { type: 'countdown/clearAllCountdowns' }

export type BudgetAction =
  | { type: 'budget/setItems'; payload: BudgetData[] }
  | { type: 'budget/addItem'; payload: BudgetData }
  | { type: 'budget/updateItem'; payload: { id: string; updates: Partial<BudgetData> } }
  | { type: 'budget/removeItem'; payload: string }
  | { type: 'budget/setCurrentItem'; payload: BudgetData | null }
  | { type: 'budget/setSaving'; payload: boolean }
  | { type: 'budget/setLastSaved'; payload: Date | null }
  | { type: 'budget/clearError' }
  | { type: 'budget/setTotalBudget'; payload: number }
  | { type: 'budget/setCategories'; payload: BudgetCategory[] }
  | { type: 'budget/updateCategoryBudget'; payload: { categoryId: string; budget: number } }
  | { type: 'budget/setExpenses'; payload: Expense[] }
  | { type: 'budget/addExpense'; payload: Expense }
  | { type: 'budget/deleteExpense'; payload: string }
  | { type: 'budget/setShowAddExpense'; payload: boolean }
  | { type: 'budget/setNewExpense'; payload: Partial<BudgetState['newExpense']> }
  | { type: 'budget/resetNewExpense' }
  | { type: 'budget/loadBudget'; payload: BudgetData }
  | { type: 'budget/clearAllBudgets' }

export type PackingAction =
  | { type: 'packing/setItems'; payload: PackingData[] }
  | { type: 'packing/addItem'; payload: PackingData }
  | { type: 'packing/updateItem'; payload: { id: string; updates: Partial<PackingData> } }
  | { type: 'packing/removeItem'; payload: string }
  | { type: 'packing/setCurrentItem'; payload: PackingData | null }
  | { type: 'packing/setSaving'; payload: boolean }
  | { type: 'packing/setLastSaved'; payload: Date | null }
  | { type: 'packing/clearError' }
  | { type: 'packing/setPackingItems'; payload: PackingItem[] }
  | { type: 'packing/setSelectedWeather'; payload: string[] }
  | { type: 'packing/setFilterCategory'; payload: string }
  | { type: 'packing/setShowAddItem'; payload: boolean }
  | { type: 'packing/setNewItem'; payload: Partial<PackingState['newItem']> }
  | { type: 'packing/resetNewItem' }
  | { type: 'packing/setCompletionStats'; payload: PackingState['completionStats'] }
  | { type: 'packing/togglePackingItem'; payload: string }
  | { type: 'packing/addPackingItem'; payload: PackingItem }
  | { type: 'packing/deletePackingItem'; payload: string }
  | { type: 'packing/toggleWeather'; payload: string }
  | { type: 'packing/loadPacking'; payload: PackingData }
  | { type: 'packing/clearAllPacking' }

export type PlannerAction =
  | { type: 'planner/setItems'; payload: PlannerData[] }
  | { type: 'planner/addItem'; payload: PlannerData }
  | { type: 'planner/updateItem'; payload: { id: string; updates: Partial<PlannerData> } }
  | { type: 'planner/removeItem'; payload: string }
  | { type: 'planner/setCurrentItem'; payload: PlannerData | null }
  | { type: 'planner/setSaving'; payload: boolean }
  | { type: 'planner/setLastSaved'; payload: Date | null }
  | { type: 'planner/clearError' }
  | { type: 'planner/setDays'; payload: PlannerDay[] }
  | { type: 'planner/setCurrentName'; payload: string }
  | { type: 'planner/setShowAddDay'; payload: boolean }
  | { type: 'planner/setShowAddPlan'; payload: boolean }
  | { type: 'planner/setEditingPlan'; payload: PlannerPlan | null }
  | { type: 'planner/setNewDay'; payload: Partial<PlannerState['newDay']> }
  | { type: 'planner/resetNewDay' }
  | { type: 'planner/setNewPlan'; payload: Partial<PlannerState['newPlan']> }
  | { type: 'planner/resetNewPlan' }
  | { type: 'planner/setSelectedDayId'; payload: string | null }
  | { type: 'planner/setFormErrors'; payload: Partial<PlannerState['formErrors']> }
  | { type: 'planner/clearFormErrors' }
  | { type: 'planner/setStats'; payload: PlannerState['stats'] }
  | { type: 'planner/addDay'; payload: PlannerDay }
  | { type: 'planner/deleteDay'; payload: string }
  | { type: 'planner/addPlan'; payload: { dayId: string; plan: PlannerPlan } }
  | { type: 'planner/updatePlan'; payload: { planId: string; updates: Partial<PlannerPlan> } }
  | { type: 'planner/deletePlan'; payload: string }
  | { type: 'planner/loadPlanner'; payload: PlannerData }
  | { type: 'planner/clearAllPlanner' }

export type UIAction =
  | { type: 'ui/setModal'; payload: { modal: keyof UIState['modals']; open: boolean } }
  | { type: 'ui/setLoading'; payload: { type: keyof UIState['loading']; loading: boolean } }
  | { type: 'ui/addNotification'; payload: Omit<UIState['notifications'][0], 'id'> }
  | { type: 'ui/removeNotification'; payload: string }

// Combined action type
export type AppAction = UserAction | WidgetsAction | CountdownAction | BudgetAction | PackingAction | PlannerAction | UIAction

// Auto-save types
export interface AutoSaveConfig {
  enabled: boolean
  delay: number
  debounce: boolean
}

export interface AutoSaveData {
  type: 'countdown' | 'budget' | 'packing' | 'planner'
  id: string
  data: any
  widgetId?: string
}

// Storage types
export interface StorageConfig {
  persist: boolean
  key: string
  whitelist?: string[]
  blacklist?: string[]
}