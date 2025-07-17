// Migration utility to help transition from WidgetConfigManager singleton to Redux
// This provides backward compatibility during the migration phase

import { store } from '@/store'
import {
  setConfigs,
  addConfig,
  updateConfig,
  removeConfig,
  reorderConfigs,
  setPendingLink,
  clearPendingLink,
  createAndLinkItem,
  checkAndApplyPendingLinks
} from '@/store/slices/widgetsSlice'
import { WidgetConfig } from '@/types'
import { RootState } from '@/store/types'
import { userManager } from './userMigration'

// Legacy WidgetConfigManager interface for backward compatibility
export interface LegacyWidgetConfigManager {
  getConfigs(): WidgetConfig[]
  saveConfigs(configs: WidgetConfig[]): Promise<void>
  getConfig(id: string): WidgetConfig | null
  updateConfig(id: string, updates: Partial<WidgetConfig>): Promise<void>
  updateConfigSync(id: string, updates: Partial<WidgetConfig>): void
  addConfig(config: WidgetConfig): Promise<void>
  addConfigSync(config: WidgetConfig): void
  removeConfig(id: string): Promise<void>
  removeConfigSync(id: string): void
  reorderWidgets(newOrder: string[]): Promise<void>
  reorderWidgetsSync(newOrder: string[]): void
  setPendingWidgetLink(widgetId: string, widgetType: WidgetConfig['type']): void
  checkAndApplyPendingLinks(itemId: string, widgetType: WidgetConfig['type']): Promise<void>
  clearPendingLink(widgetId: string): Promise<void>
  createAndLinkItem(widgetId: string, widgetType: WidgetConfig['type']): Promise<string | null>
}

// Redux-based WidgetConfigManager implementation
class ReduxWidgetConfigManager implements LegacyWidgetConfigManager {
  getConfigs(): WidgetConfig[] {
    return (store.getState() as RootState).widgets.configs
  }

  async saveConfigs(configs: WidgetConfig[]): Promise<void> {
    // Don't save for anonymous users (except in test mode)
    if (userManager.getCurrentUser()?.level === 'anon' && process.env.NODE_ENV !== 'test') {
      return
    }
    store.dispatch(setConfigs(configs))
  }

  getConfig(id: string): WidgetConfig | null {
    const configs = this.getConfigs()
    return configs.find(c => c.id === id) || null
  }

  async updateConfig(id: string, updates: Partial<WidgetConfig>): Promise<void> {
    // Don't save for anonymous users (except in test mode)
    if (userManager.getCurrentUser()?.level === 'anon' && process.env.NODE_ENV !== 'test') {
      return
    }
    store.dispatch(updateConfig({ id, updates }))
  }

  updateConfigSync(id: string, updates: Partial<WidgetConfig>): void {
    // Don't save for anonymous users (except in test mode)
    if (userManager.getCurrentUser()?.level === 'anon' && process.env.NODE_ENV !== 'test') {
      return
    }
    store.dispatch(updateConfig({ id, updates }))
  }

  async addConfig(config: WidgetConfig): Promise<void> {
    // Don't save for anonymous users (except in test mode)
    if (userManager.getCurrentUser()?.level === 'anon' && process.env.NODE_ENV !== 'test') {
      return
    }
    store.dispatch(addConfig(config))
  }

  addConfigSync(config: WidgetConfig): void {
    // Don't save for anonymous users (except in test mode)
    if (userManager.getCurrentUser()?.level === 'anon' && process.env.NODE_ENV !== 'test') {
      return
    }
    store.dispatch(addConfig(config))
  }

  async removeConfig(id: string): Promise<void> {
    // Don't save for anonymous users (except in test mode)
    if (userManager.getCurrentUser()?.level === 'anon' && process.env.NODE_ENV !== 'test') {
      return
    }
    store.dispatch(removeConfig(id))
  }

  removeConfigSync(id: string): void {
    // Don't save for anonymous users (except in test mode)
    if (userManager.getCurrentUser()?.level === 'anon' && process.env.NODE_ENV !== 'test') {
      return
    }
    store.dispatch(removeConfig(id))
  }

  async reorderWidgets(newOrder: string[]): Promise<void> {
    // Don't save for anonymous users (except in test mode)
    if (userManager.getCurrentUser()?.level === 'anon' && process.env.NODE_ENV !== 'test') {
      return
    }
    store.dispatch(reorderConfigs(newOrder))
  }

  reorderWidgetsSync(newOrder: string[]): void {
    // Don't save for anonymous users (except in test mode)
    if (userManager.getCurrentUser()?.level === 'anon' && process.env.NODE_ENV !== 'test') {
      return
    }
    store.dispatch(reorderConfigs(newOrder))
  }

  setPendingWidgetLink(widgetId: string, widgetType: WidgetConfig['type']): void {
    const itemId = `pending-${Date.now()}`
    store.dispatch(setPendingLink({ widgetId, itemId, widgetType }))
  }

  async checkAndApplyPendingLinks(itemId: string, widgetType: WidgetConfig['type']): Promise<void> {
    const result = await store.dispatch(checkAndApplyPendingLinks({ itemId, widgetType }))
    if (checkAndApplyPendingLinks.rejected.match(result)) {
      throw new Error('Failed to check and apply pending links')
    }
  }

  async clearPendingLink(widgetId: string): Promise<void> {
    // Find the pending link for this widget and clear it
    const state = store.getState() as RootState
    const pendingLinks = state.widgets.pendingLinks

    for (const [itemId, link] of Object.entries(pendingLinks)) {
      if (link.widgetId === widgetId) {
        store.dispatch(clearPendingLink(itemId))
        break
      }
    }
  }

  async createAndLinkItem(widgetId: string, widgetType: WidgetConfig['type']): Promise<string | null> {
    const result = await store.dispatch(createAndLinkItem({ widgetId, widgetType }))
    if (createAndLinkItem.fulfilled.match(result)) {
      return result.payload
    }
    throw new Error('Failed to create and link item')
  }
}

// Export the Redux-based WidgetConfigManager as a singleton
export const WidgetConfigManager = new ReduxWidgetConfigManager()

// Migration helper to load existing widget data
export const migrateWidgetData = () => {
  try {
    const savedWidgetData = localStorage.getItem('disney-widget-configs')
    if (savedWidgetData) {
      const configs = JSON.parse(savedWidgetData)
      store.dispatch(setConfigs(configs))
      console.log('[WidgetMigration] Migrated widget configs to Redux')
    }
  } catch (error) {
    console.error('[WidgetMigration] Failed to migrate widget data:', error)
  }
}

// Migration helper to ensure demo dashboard is loaded for anonymous users
export const ensureDemoDashboard = () => {
  const state = store.getState() as RootState
  const user = state.user.currentUser

  if (user?.level === 'anon') {
    // Always load demo dashboard for anonymous users
    const demoDashboard = require('@/config/demo-dashboard.json')
    if (demoDashboard?.widgets) {
      store.dispatch(setConfigs(demoDashboard.widgets))
      console.log('[WidgetMigration] Loaded demo dashboard for anonymous user (always)')
    }

    // Also load demo data into unified storage for widgets to access
    if (demoDashboard?.data) {
      const { UnifiedStorage } = require('@/lib/unifiedStorage')

      // Load countdown data
      if (demoDashboard.data.countdowns) {
        UnifiedStorage.savePluginItems('countdown', demoDashboard.data.countdowns)
      }

      // Load budget data
      if (demoDashboard.data.budgets) {
        UnifiedStorage.savePluginItems('budget', demoDashboard.data.budgets)
      }

      // Load packing data
      if (demoDashboard.data.packingLists) {
        UnifiedStorage.savePluginItems('packing', demoDashboard.data.packingLists)
      }

      // Load planner data
      if (demoDashboard.data.tripPlans) {
        UnifiedStorage.savePluginItems('planner', demoDashboard.data.tripPlans)
      }

      console.log('[WidgetMigration] Loaded demo data into unified storage (always)')
    }
  }
}