import { WidgetSize } from '@/components/widgets/WidgetBase'

export interface WidgetConfig {
  id: string
  type: 'countdown' | 'planner' | 'budget' | 'packing'
  size: WidgetSize
  selectedItemId?: string // ID of the specific saved item to display
  settings: Record<string, any>
}

export interface WidgetData {
  countdown?: {
    tripDate: string
    title?: string
  }
  planner?: {
    plans: Array<{
      id: string
      date: string
      time: string
      activity: string
      park: string
    }>
  }
  budget?: {
    total: number
    categories: Record<string, number>
    expenses: Array<{
      id: string
      date: string
      category: string
      amount: number
      description: string
    }>
  }
  packing?: {
    items: Array<{
      id: string
      name: string
      checked: boolean
      category: string
    }>
  }
}

// Add saved item interfaces for type safety
export interface SavedCountdown {
  id: string
  name: string
  park: any
  date: string
  settings: any
  theme?: any
  createdAt: string
}

export interface SavedPackingList {
  id: string
  name: string
  items: any[]
  selectedWeather: string[]
  createdAt: string
  updatedAt: string
}

export interface SavedTripPlan {
  id: string
  name: string
  days: any[]
  createdAt: string
  updatedAt: string
}

export interface SavedBudget {
  id: string
  name: string
  totalBudget: number
  categories: any[]
  expenses: any[]
  createdAt: string
  updatedAt: string
}

const WIDGET_CONFIG_KEY = 'disney-widget-configs'
const WIDGET_DATA_KEY = 'disney-widget-data'

export class WidgetConfigManager {
  static getConfigs(): WidgetConfig[] {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem(WIDGET_CONFIG_KEY)
    return saved ? JSON.parse(saved) : []
  }

  static saveConfigs(configs: WidgetConfig[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(WIDGET_CONFIG_KEY, JSON.stringify(configs))
  }

  static getConfig(id: string): WidgetConfig | null {
    const configs = this.getConfigs()
    return configs.find(c => c.id === id) || null
  }

  static updateConfig(id: string, updates: Partial<WidgetConfig>): void {
    const configs = this.getConfigs()
    const index = configs.findIndex(c => c.id === id)
    if (index >= 0) {
      configs[index] = { ...configs[index], ...updates }
      this.saveConfigs(configs)
    }
  }

  static addConfig(config: WidgetConfig): void {
    const configs = this.getConfigs()
    configs.push(config)
    this.saveConfigs(configs)
  }

  static removeConfig(id: string): void {
    const configs = this.getConfigs()
    const filtered = configs.filter(c => c.id !== id)
    this.saveConfigs(filtered)
  }

  static getData(): WidgetData {
    if (typeof window === 'undefined') return {}
    const saved = localStorage.getItem(WIDGET_DATA_KEY)
    return saved ? JSON.parse(saved) : {}
  }

  static saveData(data: WidgetData): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(data))
  }

  static updateData(updates: Partial<WidgetData>): void {
    const currentData = this.getData()
    const newData = { ...currentData, ...updates }
    this.saveData(newData)
  }

  // Helper methods for specific widget data
  static getCountdownData() {
    return this.getData().countdown || null
  }

  static getPlannerData() {
    return this.getData().planner?.plans || []
  }

  static getBudgetData() {
    const data = this.getData().budget
    return data ? {
      total: data.total,
      categories: data.categories,
      expenses: data.expenses || []
    } : null
  }

  static getPackingData() {
    return this.getData().packing?.items || []
  }

  static updateCountdownData(data: { tripDate: string; title?: string }) {
    this.updateData({ countdown: data })
  }

  static updatePlannerData(plans: any[]) {
    this.updateData({ planner: { plans } })
  }

  static updateBudgetData(budget: { total: number; categories: Record<string, number>; expenses: any[] }) {
    this.updateData({ budget })
  }

  static updatePackingData(items: any[]) {
    this.updateData({ packing: { items } })
  }

  // Methods to save/get current app state (live defaults for widgets)
  static saveCurrentCountdownState(tripDate: string, title?: string, park?: any) {
    if (typeof window === 'undefined') return
    const currentState = {
      tripDate,
      title: title || 'My Disney Trip',
      park: park || { name: 'Disney World' },
      updatedAt: new Date().toISOString()
    }
    localStorage.setItem('disney-current-countdown', JSON.stringify(currentState))
  }

  static getCurrentCountdownState() {
    if (typeof window === 'undefined') return null
    const saved = localStorage.getItem('disney-current-countdown')
    return saved ? JSON.parse(saved) : null
  }

  static saveCurrentPackingState(items: any[], selectedWeather?: string[]) {
    if (typeof window === 'undefined') return
    const currentState = {
      items,
      selectedWeather: selectedWeather || ['sunny'],
      updatedAt: new Date().toISOString()
    }
    localStorage.setItem('disney-current-packing', JSON.stringify(currentState))
  }

  static getCurrentPackingState() {
    if (typeof window === 'undefined') return null
    const saved = localStorage.getItem('disney-current-packing')
    return saved ? JSON.parse(saved) : null
  }

  static saveCurrentTripPlanState(days: any[]) {
    if (typeof window === 'undefined') return
    const currentState = {
      days,
      updatedAt: new Date().toISOString()
    }
    localStorage.setItem('disney-current-tripplan', JSON.stringify(currentState))
  }

  static getCurrentTripPlanState() {
    if (typeof window === 'undefined') return null
    const saved = localStorage.getItem('disney-current-tripplan')
    return saved ? JSON.parse(saved) : null
  }

  static saveCurrentBudgetState(totalBudget: number, categories: any[], expenses: any[]) {
    if (typeof window === 'undefined') return
    const currentState = {
      totalBudget,
      categories,
      expenses,
      updatedAt: new Date().toISOString()
    }
    localStorage.setItem('disney-current-budget', JSON.stringify(currentState))
  }

  static getCurrentBudgetState() {
    if (typeof window === 'undefined') return null
    const saved = localStorage.getItem('disney-current-budget')
    return saved ? JSON.parse(saved) : null
  }

  // Helper methods for getting saved items for widget selection
  static getAvailableCountdowns(): SavedCountdown[] {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem('disney-countdowns')
    return saved ? JSON.parse(saved) : []
  }

  static getAvailablePackingLists(): SavedPackingList[] {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem('disney-packing-lists')
    if (!saved) return []

    try {
      const storage = JSON.parse(saved)
      return storage.lists || []
    } catch {
      return []
    }
  }

  static getAvailableTripPlans(): SavedTripPlan[] {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem('disney-trip-plans')
    if (!saved) return []

    try {
      const storage = JSON.parse(saved)
      return storage.plans || []
    } catch {
      return []
    }
  }

  static getAvailableBudgets(): SavedBudget[] {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem('disney-budget-data')
    if (!saved) return []

    try {
      const storage = JSON.parse(saved)
      return storage.budgets || []
    } catch {
      return []
    }
  }

  // Helper method to get selected item data based on widget type and selectedItemId
  static getSelectedItemData(widgetType: string, selectedItemId?: string) {
    if (!selectedItemId) return null

    switch (widgetType) {
      case 'countdown':
        return this.getAvailableCountdowns().find(item => item.id === selectedItemId) || null
      case 'packing':
        return this.getAvailablePackingLists().find(item => item.id === selectedItemId) || null
      case 'planner':
        return this.getAvailableTripPlans().find(item => item.id === selectedItemId) || null
      case 'budget':
        return this.getAvailableBudgets().find(item => item.id === selectedItemId) || null
      default:
        return null
    }
  }
}