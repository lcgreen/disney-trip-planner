import { WidgetConfigManager } from './widgetConfig'

export interface AutoSaveData {
  id: string
  name: string
  type: 'countdown' | 'planner' | 'budget' | 'packing'
  data: any
  updatedAt: string
}

/**
 * Service for handling auto-save operations across all widget types
 */
export class AutoSaveService {
  private static readonly AUTO_SAVE_KEY = 'disney-auto-save-data'
  private static readonly DEBOUNCE_DELAY = 1000 // 1 second

  /**
   * Save countdown data with auto-save functionality
   */
  static async saveCountdownData(data: {
    id: string
    name: string
    park: any
    date: string
    settings: any
    theme?: any
    createdAt: string
  }, widgetId?: string): Promise<void> {
    try {
      // Check if user has save permissions
      const { userManager } = await import('@/lib/userManagement')
      if (!userManager.hasFeatureAccess('saveData')) {
        console.warn('Auto-save blocked: User does not have save permissions')
        return
      }

      // Update localStorage
      const saved = localStorage.getItem('disney-countdowns')
      let countdowns = []

      if (saved) {
        const parsed = JSON.parse(saved)
        countdowns = Array.isArray(parsed) ? parsed : (parsed.countdowns || [])
      }

      let found = false;
      const updatedCountdowns = countdowns.map((c: any) => {
        if (c.id === data.id) {
          found = true;
          return { ...data, updatedAt: new Date().toISOString() };
        }
        return c;
      });
      if (!found) {
        updatedCountdowns.push({ ...data, updatedAt: new Date().toISOString() });
      }
      localStorage.setItem('disney-countdowns', JSON.stringify({ countdowns: updatedCountdowns }))

      // Update widget config manager
      WidgetConfigManager.saveCurrentCountdownState(data.date, data.name, data.park)

      // Ensure widget config links to this countdown
      if (widgetId) {
        const config = WidgetConfigManager.getConfig(widgetId)
        if (!config?.selectedItemId || config.selectedItemId !== data.id) {
          WidgetConfigManager.updateConfig(widgetId, { selectedItemId: data.id })
          console.log('[AutoSave] Linked widget', widgetId, 'to countdown', data.id)
        } else {
          console.log('[AutoSave] Widget', widgetId, 'already linked to countdown', data.id)
        }
      }

      // Store auto-save metadata
      this.storeAutoSaveMetadata({
        id: data.id,
        name: data.name,
        type: 'countdown',
        data,
        updatedAt: new Date().toISOString()
      })

      console.log('Auto-saved countdown:', data.name)
    } catch (error) {
      console.error('Failed to auto-save countdown:', error)
      throw error
    }
  }

  /**
   * Save budget data with auto-save functionality
   */
  static async saveBudgetData(data: {
    id: string
    name: string
    totalBudget: number
    categories: any[]
    expenses: any[]
    createdAt: string
  }, widgetId?: string): Promise<void> {
    try {
      // Check if user has save permissions
      const { userManager } = await import('@/lib/userManagement')
      if (!userManager.hasFeatureAccess('saveData')) {
        console.warn('Auto-save blocked: User does not have save permissions')
        return
      }

      // Update localStorage
      const saved = localStorage.getItem('disney-budget-data')
      if (saved) {
        const parsed = JSON.parse(saved)
        const budgets = parsed.budgets || []
        let found = false;
        const updatedBudgets = budgets.map((b: any) => {
          if (b.id === data.id) {
            found = true;
            return { ...data, updatedAt: new Date().toISOString() };
          }
          return b;
        });
        if (!found) {
          updatedBudgets.push({ ...data, updatedAt: new Date().toISOString() });
        }
        localStorage.setItem('disney-budget-data', JSON.stringify({ budgets: updatedBudgets }))
      }

      // Update widget config manager
      WidgetConfigManager.saveCurrentBudgetState(data.totalBudget, data.categories, data.expenses)

      // Ensure widget config links to this budget
      if (widgetId) {
        const config = WidgetConfigManager.getConfig(widgetId)
        if (!config?.selectedItemId || config.selectedItemId !== data.id) {
          WidgetConfigManager.updateConfig(widgetId, { selectedItemId: data.id })
          console.log('[AutoSave] Linked widget', widgetId, 'to budget', data.id)
        } else {
          console.log('[AutoSave] Widget', widgetId, 'already linked to budget', data.id)
        }
      }

      // Store auto-save metadata
      this.storeAutoSaveMetadata({
        id: data.id,
        name: data.name,
        type: 'budget',
        data,
        updatedAt: new Date().toISOString()
      })

      console.log('Auto-saved budget:', data.name)
    } catch (error) {
      console.error('Failed to auto-save budget:', error)
      throw error
    }
  }

  /**
   * Save packing list data with auto-save functionality
   */
  static async savePackingData(data: {
    id: string
    name: string
    items: any[]
    selectedWeather: string[]
    createdAt: string
  }, widgetId?: string): Promise<void> {
    try {
      // Check if user has save permissions
      const { userManager } = await import('@/lib/userManagement')
      if (!userManager.hasFeatureAccess('saveData')) {
        console.warn('Auto-save blocked: User does not have save permissions')
        return
      }

      // Update localStorage
      const saved = localStorage.getItem('disney-packing-lists')
      if (saved) {
        const parsed = JSON.parse(saved)
        const lists = parsed.lists || []
        let found = false;
        const updatedLists = lists.map((l: any) => {
          if (l.id === data.id) {
            found = true;
            return { ...data, updatedAt: new Date().toISOString() };
          }
          return l;
        });
        if (!found) {
          updatedLists.push({ ...data, updatedAt: new Date().toISOString() });
        }
        localStorage.setItem('disney-packing-lists', JSON.stringify({ lists: updatedLists }))
      }

      // Update widget config manager
      WidgetConfigManager.saveCurrentPackingState(data.items, data.selectedWeather)

      // Ensure widget config links to this packing list
      if (widgetId) {
        const config = WidgetConfigManager.getConfig(widgetId)
        if (!config?.selectedItemId || config.selectedItemId !== data.id) {
          WidgetConfigManager.updateConfig(widgetId, { selectedItemId: data.id })
          console.log('[AutoSave] Linked widget', widgetId, 'to packing', data.id)
        } else {
          console.log('[AutoSave] Widget', widgetId, 'already linked to packing', data.id)
        }
      }

      // Store auto-save metadata
      this.storeAutoSaveMetadata({
        id: data.id,
        name: data.name,
        type: 'packing',
        data,
        updatedAt: new Date().toISOString()
      })

      console.log('Auto-saved packing list:', data.name)
    } catch (error) {
      console.error('Failed to auto-save packing list:', error)
      throw error
    }
  }

  /**
   * Save trip plan data with auto-save functionality
   */
  static async saveTripPlanData(data: {
    id: string
    name: string
    days: any[]
    createdAt: string
  }, widgetId?: string): Promise<void> {
    try {
      // Check if user has save permissions
      const { userManager } = await import('@/lib/userManagement')
      if (!userManager.hasFeatureAccess('saveData')) {
        console.warn('Auto-save blocked: User does not have save permissions')
        return
      }

      // Update localStorage
      const saved = localStorage.getItem('disney-trip-plans')
      if (saved) {
        const parsed = JSON.parse(saved)
        const plans = parsed.plans || []
        let found = false;
        const updatedPlans = plans.map((p: any) => {
          if (p.id === data.id) {
            found = true;
            return { ...data, updatedAt: new Date().toISOString() };
          }
          return p;
        });
        if (!found) {
          updatedPlans.push({ ...data, updatedAt: new Date().toISOString() });
        }
        localStorage.setItem('disney-trip-plans', JSON.stringify({ plans: updatedPlans }))
      }

      // Update widget config manager
      WidgetConfigManager.saveCurrentTripPlanState(data.days)

      // Ensure widget config links to this trip plan
      if (widgetId) {
        const config = WidgetConfigManager.getConfig(widgetId)
        if (!config?.selectedItemId || config.selectedItemId !== data.id) {
          WidgetConfigManager.updateConfig(widgetId, { selectedItemId: data.id })
          console.log('[AutoSave] Linked widget', widgetId, 'to trip plan', data.id)
        } else {
          console.log('[AutoSave] Widget', widgetId, 'already linked to trip plan', data.id)
        }
      }

      // Store auto-save metadata
      this.storeAutoSaveMetadata({
        id: data.id,
        name: data.name,
        type: 'planner',
        data,
        updatedAt: new Date().toISOString()
      })

      console.log('Auto-saved trip plan:', data.name)
    } catch (error) {
      console.error('Failed to auto-save trip plan:', error)
      throw error
    }
  }

  /**
   * Store auto-save metadata for tracking
   */
  private static storeAutoSaveMetadata(metadata: AutoSaveData): void {
    try {
      const saved = localStorage.getItem(this.AUTO_SAVE_KEY)
      const autoSaveData = saved ? JSON.parse(saved) : {}

      autoSaveData[metadata.id] = metadata

            // Keep only last 50 auto-save records
      const entries = Object.entries(autoSaveData)
      if (entries.length > 50) {
        const sorted = entries.sort((a, b) =>
          new Date((b[1] as AutoSaveData).updatedAt).getTime() - new Date((a[1] as AutoSaveData).updatedAt).getTime()
        )
        const trimmed = Object.fromEntries(sorted.slice(0, 50))
        localStorage.setItem(this.AUTO_SAVE_KEY, JSON.stringify(trimmed))
      } else {
        localStorage.setItem(this.AUTO_SAVE_KEY, JSON.stringify(autoSaveData))
      }
    } catch (error) {
      console.error('Failed to store auto-save metadata:', error)
    }
  }

  /**
   * Get auto-save metadata for a specific item
   */
  static getAutoSaveMetadata(itemId: string): AutoSaveData | null {
    try {
      const saved = localStorage.getItem(this.AUTO_SAVE_KEY)
      if (!saved) return null

      const autoSaveData = JSON.parse(saved)
      return autoSaveData[itemId] || null
    } catch (error) {
      console.error('Failed to get auto-save metadata:', error)
      return null
    }
  }

  /**
   * Get all auto-save metadata
   */
  static getAllAutoSaveMetadata(): AutoSaveData[] {
    try {
      const saved = localStorage.getItem(this.AUTO_SAVE_KEY)
      if (!saved) return []

      const autoSaveData = JSON.parse(saved)
      return Object.values(autoSaveData)
    } catch (error) {
      console.error('Failed to get all auto-save metadata:', error)
      return []
    }
  }

  /**
   * Clear auto-save metadata for a specific item
   */
  static clearAutoSaveMetadata(itemId: string): void {
    try {
      const saved = localStorage.getItem(this.AUTO_SAVE_KEY)
      if (!saved) return

      const autoSaveData = JSON.parse(saved)
      delete autoSaveData[itemId]
      localStorage.setItem(this.AUTO_SAVE_KEY, JSON.stringify(autoSaveData))
    } catch (error) {
      console.error('Failed to clear auto-save metadata:', error)
    }
  }

  /**
   * Clear all auto-save metadata
   */
  static clearAllAutoSaveMetadata(): void {
    try {
      localStorage.removeItem(this.AUTO_SAVE_KEY)
    } catch (error) {
      console.error('Failed to clear all auto-save metadata:', error)
    }
  }
}