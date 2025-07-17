// Unified storage system to eliminate duplications
import { userManager } from './userManagement'

export interface StorageKeys {
  items: string
  widgets: string
  current: string
}

export class UnifiedStorage {
  public static instance: UnifiedStorage
  public storageCache: Map<string, any> = new Map()

  static getInstance(): UnifiedStorage {
    if (!UnifiedStorage.instance) {
      UnifiedStorage.instance = new UnifiedStorage()
    }
    return UnifiedStorage.instance
  }

  // Generic data operations
  static getData<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue

    const instance = UnifiedStorage.getInstance()

    // Check cache first (works for both anonymous and authenticated users)
    if (instance.storageCache.has(key)) {
      return instance.storageCache.get(key)
    }

    // For anonymous users, only return from cache
    if (!userManager.hasFeatureAccess('saveData')) {
      return defaultValue
    }

    // For authenticated users, try localStorage
    const saved = localStorage.getItem(key)
    const data = saved ? JSON.parse(saved) : defaultValue

    // Cache the result
    instance.storageCache.set(key, data)
    return data
  }

  static async saveData<T>(key: string, data: T): Promise<void> {
    console.log('[UnifiedStorage] saveData called with:', { key, data })
    if (typeof window === 'undefined') return

    const instance = UnifiedStorage.getInstance()

    // Update cache (always works for memory storage)
    instance.storageCache.set(key, data)

    // Debug logging for user state
    const currentUser = userManager.getCurrentUser()
    const hasSaveAccess = userManager.hasFeatureAccess('saveData')
    console.log('[UnifiedStorage Debug] saveData called:', {
      key,
      currentUser: currentUser ? { id: currentUser.id, level: currentUser.level, email: currentUser.email } : null,
      hasSaveAccess,
      isTestEnv: process.env.NODE_ENV === 'test',
      willSaveToLocalStorage: process.env.NODE_ENV === 'test' || hasSaveAccess
    })

    // Check if user has save permissions for persistent storage
    if (process.env.NODE_ENV !== 'test' && !hasSaveAccess) {
      console.log('Anonymous user: Data saved to memory only (not persistent)')
      return
    }

    // Save to localStorage for authenticated users
    localStorage.setItem(key, JSON.stringify(data))
    console.log('[UnifiedStorage Debug] Data saved to localStorage:', key)
  }

  static async updateData<T>(key: string, updates: Partial<T>): Promise<void> {
    const currentData = this.getData(key, {} as T)
    const newData = { ...currentData, ...updates }
    await this.saveData(key, newData)
  }

  // Plugin-specific operations
  static getPluginItems<T>(pluginId: string, defaultValue: T[] = []): T[] {
    const key = `disney-${pluginId}s`
    const data = this.getData(key, { [pluginId]: [] })
    return data[pluginId] || defaultValue
  }

  static async savePluginItems<T>(pluginId: string, items: T[]): Promise<void> {
    const key = `disney-${pluginId}s`
    await this.saveData(key, { [pluginId]: items })
  }

  static async addPluginItem<T>(pluginId: string, item: T): Promise<void> {
    const items = this.getPluginItems<T>(pluginId)
    items.push(item)
    await this.savePluginItems(pluginId, items)
  }

  static async updatePluginItem<T>(pluginId: string, itemId: string, updates: Partial<T>): Promise<void> {
    const items = this.getPluginItems<T>(pluginId)
    const index = items.findIndex((item: any) => item.id === itemId)

    if (index >= 0) {
      items[index] = {
        ...items[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      await this.savePluginItems(pluginId, items)
    }
  }

  static async deletePluginItem<T>(pluginId: string, itemId: string): Promise<void> {
    const items = this.getPluginItems<T>(pluginId)
    const filtered = items.filter((item: any) => item.id !== itemId)
    await this.savePluginItems(pluginId, filtered)
  }

  // Widget configuration operations
  static getWidgetConfigs(): any[] {
    return this.getData('disney-widget-configs', [])
  }

  static async saveWidgetConfigs(configs: any[]): Promise<void> {
    await this.saveData('disney-widget-configs', configs)
  }

  static getWidgetConfig(id: string): any | null {
    const configs = this.getWidgetConfigs()
    return configs.find(c => c.id === id) || null
  }

  static async updateWidgetConfig(id: string, updates: any): Promise<void> {
    const configs = this.getWidgetConfigs()
    const index = configs.findIndex(c => c.id === id)

    if (index >= 0) {
      configs[index] = { ...configs[index], ...updates }
      await this.saveWidgetConfigs(configs)
    }
  }

  // Clear cache (useful for testing or when data becomes stale)
  static clearCache(): void {
    const instance = UnifiedStorage.getInstance()
    instance.storageCache.clear()
  }

  // Migration helper for old data formats
  static migrateOldData(): void {
    // Migrate old countdown format
    const oldCountdowns = localStorage.getItem('disney-countdowns')
    if (oldCountdowns) {
      try {
        const parsed = JSON.parse(oldCountdowns)
        if (Array.isArray(parsed)) {
          // Old format was array, convert to new format
          this.savePluginItems('countdown', parsed)
        }
      } catch (error) {
        console.warn('Failed to migrate old countdown data:', error)
      }
    }

    // Similar migrations for other data types...
  }
}

// Export singleton instance
export const unifiedStorage = UnifiedStorage.getInstance()