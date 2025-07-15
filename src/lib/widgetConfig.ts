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

  // Clean up widget configurations when an item is deleted
  static cleanupDeletedItemReferences(deletedItemId: string, widgetType: WidgetConfig['type']): void {
    const configs = this.getConfigs()
    let updated = false

    const cleanedConfigs = configs.map(config => {
      if (config.type === widgetType && config.selectedItemId === deletedItemId) {
        updated = true
        return { ...config, selectedItemId: undefined }
      }
      return config
    })

    if (updated) {
      this.saveConfigs(cleanedConfigs)
    }
  }

  // Clean up all widget configurations for a specific widget type
  static cleanupAllItemReferences(widgetType: WidgetConfig['type']): void {
    const configs = this.getConfigs()
    let updated = false

    const cleanedConfigs = configs.map(config => {
      if (config.type === widgetType && config.selectedItemId) {
        updated = true
        return { ...config, selectedItemId: undefined }
      }
      return config
    })

    if (updated) {
      this.saveConfigs(cleanedConfigs)
    }
  }

  // Check if a selected item still exists, and clean up widget config if not
  static validateAndCleanupItemReference(widgetId: string, widgetType: WidgetConfig['type'], selectedItemId: string): boolean {
    const itemExists = this.getSelectedItemData(widgetType, selectedItemId) !== null

    if (!itemExists) {
      // Item no longer exists, clean up the widget configuration
      this.updateConfig(widgetId, { selectedItemId: undefined })
      return false
    }

    return true
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

  // Auto-creation methods for new widgets
  static createNewCountdown(name?: string): string {
    if (typeof window === 'undefined') return 'temp-id'

    const existingCountdowns = this.getAvailableCountdowns()
    const defaultName = name || `Countdown ${existingCountdowns.length + 1}`

    // Create with a future date (7 days from now as default)
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 7)

    const newCountdown: SavedCountdown = {
      id: Date.now().toString(),
      name: defaultName,
      park: { name: 'Magic Kingdom', id: 'magic-kingdom' },
      date: futureDate.toISOString(),
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
      createdAt: new Date().toISOString()
    }

    const countdowns = [...existingCountdowns, newCountdown]
    localStorage.setItem('disney-countdowns', JSON.stringify(countdowns))

    return newCountdown.id
  }

  static createNewPackingList(name?: string): string {
    if (typeof window === 'undefined') return 'temp-id'

    const existingLists = this.getAvailablePackingLists()
    const defaultName = name || `Packing List ${existingLists.length + 1}`

    // Create with some default items
    const defaultItems = [
      { id: '1', name: 'Magic Band', category: 'essentials', checked: false, isEssential: true, isCustom: false },
      { id: '2', name: 'Phone Charger', category: 'electronics', checked: false, isEssential: true, isCustom: false },
      { id: '3', name: 'Comfortable Shoes', category: 'clothing', checked: false, isEssential: true, isCustom: false },
      { id: '4', name: 'Sunscreen', category: 'health', checked: false, isEssential: true, isCustom: false },
      { id: '5', name: 'Water Bottle', category: 'essentials', checked: false, isEssential: true, isCustom: false }
    ]

    const newList: SavedPackingList = {
      id: Date.now().toString(),
      name: defaultName,
      items: defaultItems,
      selectedWeather: ['sunny'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const storage = { lists: [...existingLists, newList] }
    localStorage.setItem('disney-packing-lists', JSON.stringify(storage))

    return newList.id
  }

  static createNewTripPlan(name?: string): string {
    if (typeof window === 'undefined') return 'temp-id'

    const existingPlans = this.getAvailableTripPlans()
    const defaultName = name || `Trip Plan ${existingPlans.length + 1}`

    // Create with a sample day
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    const defaultActivities = [
      {
        id: '1',
        time: '9:00 AM',
        title: 'Park Opening',
        location: 'Magic Kingdom Entrance',
        type: 'other',
        priority: 'high',
        notes: 'Arrive early for rope drop'
      },
      {
        id: '2',
        time: '12:00 PM',
        title: 'Lunch Break',
        location: 'Be Our Guest Restaurant',
        type: 'dining',
        priority: 'medium',
        notes: 'Make reservations in advance'
      }
    ]

    const newPlan: SavedTripPlan = {
      id: Date.now().toString(),
      name: defaultName,
      days: [{
        id: '1',
        date: tomorrow.toISOString().split('T')[0],
        park: 'Magic Kingdom',
        activities: defaultActivities
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const storage = { plans: [...existingPlans, newPlan] }
    localStorage.setItem('disney-trip-plans', JSON.stringify(storage))

    return newPlan.id
  }

  static createNewBudget(name?: string): string {
    if (typeof window === 'undefined') return 'temp-id'

    const existingBudgets = this.getAvailableBudgets()
    const defaultName = name || `Budget ${existingBudgets.length + 1}`

    // Create with default categories
    const defaultCategories = [
      { id: 'tickets', name: 'Park Tickets', budget: 500, color: '#3B82F6', icon: '🎫' },
      { id: 'accommodation', name: 'Accommodation', budget: 800, color: '#10B981', icon: '🏨' },
      { id: 'food', name: 'Food & Dining', budget: 400, color: '#F59E0B', icon: '🍽️' },
      { id: 'souvenirs', name: 'Souvenirs', budget: 200, color: '#EF4444', icon: '🎁' },
      { id: 'transport', name: 'Transportation', budget: 100, color: '#8B5CF6', icon: '🚗' }
    ]

    const newBudget: SavedBudget = {
      id: Date.now().toString(),
      name: defaultName,
      totalBudget: 2000,
      categories: defaultCategories,
      expenses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const storage = { budgets: [...existingBudgets, newBudget] }
    localStorage.setItem('disney-budget-data', JSON.stringify(storage))

    return newBudget.id
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

  // Auto-linking functionality for new routes
  static setPendingWidgetLink(widgetId: string, widgetType: WidgetConfig['type']) {
    if (typeof window === 'undefined') return

    const pendingLinks = JSON.parse(localStorage.getItem('disney-pending-widget-links') || '{}')
    pendingLinks[widgetId] = { widgetType, timestamp: Date.now() }
    localStorage.setItem('disney-pending-widget-links', JSON.stringify(pendingLinks))
  }

  static checkAndApplyPendingLinks(itemId: string, widgetType: WidgetConfig['type']) {
    if (typeof window === 'undefined') return

    const pendingLinks = JSON.parse(localStorage.getItem('disney-pending-widget-links') || '{}')

    // Find any pending links for this widget type
    for (const [widgetId, linkData] of Object.entries(pendingLinks)) {
      if ((linkData as any).widgetType === widgetType) {
        // Link the newly created item to this widget
        this.updateConfig(widgetId, { selectedItemId: itemId })

        // Remove the pending link
        delete pendingLinks[widgetId]
        localStorage.setItem('disney-pending-widget-links', JSON.stringify(pendingLinks))

        // Navigate back to dashboard
        window.location.href = '/dashboard'
        break // Only link to the first pending widget of this type
      }
    }
  }

    static clearPendingLink(widgetId: string) {
    if (typeof window === 'undefined') return

    const pendingLinks = JSON.parse(localStorage.getItem('disney-pending-widget-links') || '{}')
    delete pendingLinks[widgetId]
    localStorage.setItem('disney-pending-widget-links', JSON.stringify(pendingLinks))
  }

  // Seamless auto-creation and linking
  static createAndLinkItem(widgetId: string, widgetType: WidgetConfig['type']): string | null {
    if (typeof window === 'undefined') return null

    let itemId: string | null = null

    switch (widgetType) {
      case 'countdown':
        itemId = this.createNewCountdown()
        break
      case 'packing':
        itemId = this.createNewPackingList()
        break
      case 'planner':
        itemId = this.createNewTripPlan()
        break
      case 'budget':
        itemId = this.createNewBudget()
        break
    }

    if (itemId) {
      // Immediately link to widget
      this.updateConfig(widgetId, { selectedItemId: itemId })
      // Clear any pending links for this widget
      this.clearPendingLink(widgetId)
    }

    return itemId
  }
}