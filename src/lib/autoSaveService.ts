import { UnifiedStorage } from './unifiedStorage'

interface AutoSaveMetadata {
  id: string
  name: string
  type: 'countdown' | 'budget' | 'packing' | 'planner'
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
    tripDate: string
    settings: any
    theme?: any
    createdAt: string
  }, widgetId?: string): Promise<void> {
    console.log('[AutoSaveService] saveCountdownData called with:', { data, widgetId })
    try {
      // Check if user has save permissions
      const { userManager } = await import('@/lib/userManagement')

      // Ensure user exists (create anonymous user if none exists)
      const currentUser = userManager.ensureUser()

      // Debug logging for auto-save
      console.log('[AutoSaveService Debug] saveCountdownData called:', {
        dataId: data.id,
        dataName: data.name,
        widgetId,
        currentUser: { id: currentUser.id, level: currentUser.level, email: currentUser.email },
        hasSaveAccess: userManager.hasFeatureAccess('saveData'),
        isTestEnv: process.env.NODE_ENV === 'test'
      })

      // Update using UnifiedStorage (handles anonymous users automatically)
      const countdowns = UnifiedStorage.getPluginItems('countdown')
      let found = false;
      const updatedCountdowns = countdowns.map((c: any) => {
        if (c.id === data.id) {
          found = true;
          return { ...c, ...data, updatedAt: new Date().toISOString() };
        }
        return c;
      });
      if (!found) {
        updatedCountdowns.push({ ...data, updatedAt: new Date().toISOString() });
      }
      console.log('[AutoSaveService Debug] About to save countdowns:', {
        count: updatedCountdowns.length,
        found,
        dataId: data.id
      })
      await UnifiedStorage.savePluginItems('countdown', updatedCountdowns)

      // Ensure widget config links to this countdown
      if (widgetId) {
        const { WidgetConfigManager } = await import('@/lib/widgetConfig')
        const config = WidgetConfigManager.getConfig(widgetId)
        if (!config?.selectedItemId || config.selectedItemId !== data.id) {
          await WidgetConfigManager.updateConfig(widgetId, { selectedItemId: data.id })
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
      // Ensure user exists (create anonymous user if none exists)
      userManager.ensureUser()

      // Update using UnifiedStorage (handles anonymous users automatically)
      const budgets = UnifiedStorage.getPluginItems('budget')
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
      await UnifiedStorage.savePluginItems('budget', updatedBudgets)

      // Ensure widget config links to this budget
      if (widgetId) {
        const { WidgetConfigManager } = await import('@/lib/widgetConfig')
        const config = WidgetConfigManager.getConfig(widgetId)
        if (!config?.selectedItemId || config.selectedItemId !== data.id) {
          await WidgetConfigManager.updateConfig(widgetId, { selectedItemId: data.id })
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
      // Ensure user exists (create anonymous user if none exists)
      userManager.ensureUser()

      // Update using UnifiedStorage (handles anonymous users automatically)
      const lists = UnifiedStorage.getPluginItems('packing')
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
      await UnifiedStorage.savePluginItems('packing', updatedLists)

      // Ensure widget config links to this packing list
      if (widgetId) {
        const { WidgetConfigManager } = await import('@/lib/widgetConfig')
        const config = WidgetConfigManager.getConfig(widgetId)
        if (!config?.selectedItemId || config.selectedItemId !== data.id) {
          await WidgetConfigManager.updateConfig(widgetId, { selectedItemId: data.id })
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
      // Ensure user exists (create anonymous user if none exists)
      userManager.ensureUser()

      // Update using UnifiedStorage (handles anonymous users automatically)
      const plans = UnifiedStorage.getPluginItems('planner')
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
      await UnifiedStorage.savePluginItems('planner', updatedPlans)

      // Ensure widget config links to this trip plan
      if (widgetId) {
        const { WidgetConfigManager } = await import('@/lib/widgetConfig')
        const config = WidgetConfigManager.getConfig(widgetId)
        if (!config?.selectedItemId || config.selectedItemId !== data.id) {
          await WidgetConfigManager.updateConfig(widgetId, { selectedItemId: data.id })
          console.log('[AutoSave] Linked widget', widgetId, 'to planner', data.id)
        } else {
          console.log('[AutoSave] Widget', widgetId, 'already linked to planner', data.id)
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
   * Store auto-save metadata for debugging and recovery
   */
  private static storeAutoSaveMetadata(metadata: AutoSaveMetadata): void {
    try {
      const existing: AutoSaveMetadata[] = UnifiedStorage.getData(this.AUTO_SAVE_KEY, [])
      const updated = existing.filter((item: AutoSaveMetadata) => item.id !== metadata.id)
      updated.push(metadata)

      // Keep only last 10 auto-saves per type
      const limited = updated.slice(-40) // 10 items * 4 types max
      UnifiedStorage.saveData(this.AUTO_SAVE_KEY, limited)
    } catch (error) {
      console.error('Failed to store auto-save metadata:', error)
    }
  }

  /**
   * Get auto-save metadata for debugging
   */
  static getAutoSaveMetadata(): AutoSaveMetadata[] {
    return UnifiedStorage.getData(this.AUTO_SAVE_KEY, [])
  }

  /**
   * Clear auto-save metadata
   */
  static clearAutoSaveMetadata(): void {
    UnifiedStorage.saveData(this.AUTO_SAVE_KEY, [])
  }
}