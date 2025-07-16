import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { WidgetConfigManager } from '@/lib/widgetConfig'
import { UnifiedStorage } from '@/lib/unifiedStorage'

describe('WidgetConfigManager', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Also clear the specific key used by WidgetConfigManager
    localStorage.removeItem('disney-widget-configs')
    // Clear the UnifiedStorage cache to ensure fresh data
    UnifiedStorage.clearCache()
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Clean up after each test
    localStorage.clear()
    localStorage.removeItem('disney-widget-configs')
    // Clear the UnifiedStorage cache
    UnifiedStorage.clearCache()
    vi.restoreAllMocks()
  })

  describe('getConfigs', () => {
    it('should return empty array when no configs exist', () => {
      const configs = WidgetConfigManager.getConfigs()
      expect(configs).toEqual([])
    })

    it('should return all widget configs', () => {
      const config1 = {
        id: 'test-widget-1',
        type: 'countdown' as const,
        size: 'medium' as const,
        order: 0,
        settings: {}
      }
      const config2 = {
        id: 'test-widget-2',
        type: 'packing' as const,
        size: 'medium' as const,
        order: 1,
        settings: {}
      }

      WidgetConfigManager.addConfigSync(config1)
      WidgetConfigManager.addConfigSync(config2)

      const configs = WidgetConfigManager.getConfigs()
      expect(configs).toHaveLength(2)
      expect(configs.find(c => c.id === 'test-widget-1')).toBeDefined()
      expect(configs.find(c => c.id === 'test-widget-2')).toBeDefined()
    })
  })

  describe('getConfig', () => {
    it('should return null for non-existent widget', () => {
      const config = WidgetConfigManager.getConfig('non-existent-widget')
      expect(config).toBeNull()
    })

    it('should return existing config for existing widget', () => {
      const existingConfig = {
        id: 'test-widget-get',
        type: 'countdown' as const,
        size: 'medium' as const,
        order: 0,
        selectedItemId: 'item-123',
        settings: { theme: 'dark' }
      }

      WidgetConfigManager.addConfigSync(existingConfig)

      const config = WidgetConfigManager.getConfig('test-widget-get')
      expect(config).toEqual(existingConfig)
    })
  })

  describe('addConfig', () => {
    it('should add new widget configuration', () => {
      const config = {
        id: 'test-widget-add',
        type: 'countdown' as const,
        size: 'medium' as const,
        order: 0,
        settings: {}
      }

      WidgetConfigManager.addConfigSync(config)

      const savedConfig = WidgetConfigManager.getConfig('test-widget-add')
      expect(savedConfig).toEqual({ ...config, order: 0 })
    })

    it('should set order to be at the end', () => {
      // Add first widget
      WidgetConfigManager.addConfigSync({
        id: 'test-widget-order-1',
        type: 'countdown' as const,
        size: 'medium' as const,
        order: 0,
        settings: {}
      })

      // Add second widget
      WidgetConfigManager.addConfigSync({
        id: 'test-widget-order-2',
        type: 'packing' as const,
        size: 'medium' as const,
        order: 0, // This should be overridden
        settings: {}
      })

      const configs = WidgetConfigManager.getConfigs()
      expect(configs[0].order).toBe(0)
      expect(configs[1].order).toBe(1)
    })
  })

  describe('updateConfig', () => {
    it('should update widget configuration', () => {
      const initialConfig = {
        id: 'test-widget-update',
        type: 'countdown' as const,
        size: 'medium' as const,
        order: 0,
        settings: {}
      }

      WidgetConfigManager.addConfigSync(initialConfig)

      const updates = {
        selectedItemId: 'new-item',
        settings: { theme: 'dark' }
      }

      WidgetConfigManager.updateConfigSync('test-widget-update', updates)

      const config = WidgetConfigManager.getConfig('test-widget-update')
      expect(config?.selectedItemId).toBe('new-item')
      expect(config?.settings).toEqual({ theme: 'dark' })
    })

    it('should handle non-existent widget gracefully', () => {
      expect(() => WidgetConfigManager.updateConfigSync('non-existent', { selectedItemId: 'item-1' })).not.toThrow()
    })
  })

  describe('removeConfig', () => {
    it('should remove widget configuration', () => {
      const config = {
        id: 'test-widget-remove',
        type: 'countdown' as const,
        size: 'medium' as const,
        order: 0,
        settings: {}
      }

      WidgetConfigManager.addConfigSync(config)
      WidgetConfigManager.removeConfigSync('test-widget-remove')

      const savedConfig = WidgetConfigManager.getConfig('test-widget-remove')
      expect(savedConfig).toBeNull()
    })

    it('should reorder remaining widgets', () => {
      // Add multiple widgets
      WidgetConfigManager.addConfigSync({
        id: 'test-widget-reorder-1',
        type: 'countdown' as const,
        size: 'medium' as const,
        order: 0,
        settings: {}
      })
      WidgetConfigManager.addConfigSync({
        id: 'test-widget-reorder-2',
        type: 'packing' as const,
        size: 'medium' as const,
        order: 1,
        settings: {}
      })
      WidgetConfigManager.addConfigSync({
        id: 'test-widget-reorder-3',
        type: 'budget' as const,
        size: 'medium' as const,
        order: 2,
        settings: {}
      })

      // Remove middle widget
      WidgetConfigManager.removeConfigSync('test-widget-reorder-2')

      const configs = WidgetConfigManager.getConfigs()
      expect(configs).toHaveLength(2)
      expect(configs[0].order).toBe(0)
      expect(configs[1].order).toBe(1)
    })
  })

  describe('cleanupDeletedItemReferences', () => {
    it('should remove references to deleted items', () => {
      // Add widgets with item references
      WidgetConfigManager.addConfigSync({
        id: 'test-widget-cleanup-1',
        type: 'countdown' as const,
        size: 'medium' as const,
        order: 0,
        selectedItemId: 'deleted-item',
        settings: {}
      })
      WidgetConfigManager.addConfigSync({
        id: 'test-widget-cleanup-2',
        type: 'countdown' as const,
        size: 'medium' as const,
        order: 1,
        selectedItemId: 'existing-item',
        settings: {}
      })

      WidgetConfigManager.cleanupDeletedItemReferences('deleted-item', 'countdown')

      const configs = WidgetConfigManager.getConfigs()
      const widget1 = configs.find(c => c.id === 'test-widget-cleanup-1')
      const widget2 = configs.find(c => c.id === 'test-widget-cleanup-2')

      expect(widget1?.selectedItemId).toBeUndefined()
      expect(widget2?.selectedItemId).toBe('existing-item') // Should be preserved
    })
  })

  describe('cleanupAllItemReferences', () => {
    it('should remove all item references for a widget type', () => {
      // Add widgets with item references
      WidgetConfigManager.addConfigSync({
        id: 'test-widget-cleanup-all-1',
        type: 'countdown' as const,
        size: 'medium' as const,
        order: 0,
        selectedItemId: 'item-1',
        settings: {}
      })
      WidgetConfigManager.addConfigSync({
        id: 'test-widget-cleanup-all-2',
        type: 'packing' as const,
        size: 'medium' as const,
        order: 1,
        selectedItemId: 'item-2',
        settings: {}
      })

      WidgetConfigManager.cleanupAllItemReferences('countdown')

      const configs = WidgetConfigManager.getConfigs()
      const widget1 = configs.find(c => c.id === 'test-widget-cleanup-all-1')
      const widget2 = configs.find(c => c.id === 'test-widget-cleanup-all-2')

      expect(widget1?.selectedItemId).toBeUndefined()
      expect(widget2?.selectedItemId).toBe('item-2') // Should be preserved
    })
  })

  describe('reorderWidgets', () => {
    it('should reorder widgets according to new order', () => {
      // Add widgets
      WidgetConfigManager.addConfigSync({
        id: 'test-widget-reorder-a',
        type: 'countdown' as const,
        size: 'medium' as const,
        order: 0,
        settings: {}
      })
      WidgetConfigManager.addConfigSync({
        id: 'test-widget-reorder-b',
        type: 'packing' as const,
        size: 'medium' as const,
        order: 1,
        settings: {}
      })

      // Reorder
      WidgetConfigManager.reorderWidgetsSync(['test-widget-reorder-b', 'test-widget-reorder-a'])

      const configs = WidgetConfigManager.getConfigs()
      expect(configs[0].id).toBe('test-widget-reorder-b')
      expect(configs[0].order).toBe(0)
      expect(configs[1].id).toBe('test-widget-reorder-a')
      expect(configs[1].order).toBe(1)
    })
  })

  describe('Error handling', () => {
    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw errors
      const originalSetItem = localStorage.setItem
      const originalGetItem = localStorage.getItem

      localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage error')
      })

      expect(() => WidgetConfigManager.addConfigSync({
        id: 'test-widget-error',
        type: 'countdown' as const,
        size: 'medium' as const,
        order: 0,
        settings: {}
      })).not.toThrow()

      localStorage.getItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage error')
      })

      expect(() => WidgetConfigManager.getConfigs()).not.toThrow()

      // Restore original functions
      localStorage.setItem = originalSetItem
      localStorage.getItem = originalGetItem
    })
  })

  describe('Integration tests', () => {
    it('should handle complete widget lifecycle', () => {
      // Create widget
      const config = {
        id: 'test-widget-lifecycle',
        type: 'countdown' as const,
        size: 'medium' as const,
        order: 0,
        selectedItemId: 'item-1',
        settings: { theme: 'dark' }
      }

      WidgetConfigManager.addConfigSync(config)

      // Verify config
      let savedConfig = WidgetConfigManager.getConfig('test-widget-lifecycle')
      expect(savedConfig?.selectedItemId).toBe('item-1')
      expect(savedConfig?.settings).toEqual({ theme: 'dark' })

      // Update config
      WidgetConfigManager.updateConfigSync('test-widget-lifecycle', {
        selectedItemId: 'item-2',
        settings: { theme: 'light' }
      })

      savedConfig = WidgetConfigManager.getConfig('test-widget-lifecycle')
      expect(savedConfig?.selectedItemId).toBe('item-2')
      expect(savedConfig?.settings).toEqual({ theme: 'light' })

      // Clean up item reference
      WidgetConfigManager.cleanupDeletedItemReferences('item-2', 'countdown')

      savedConfig = WidgetConfigManager.getConfig('test-widget-lifecycle')
      expect(savedConfig?.selectedItemId).toBeUndefined()

      // Remove widget
      WidgetConfigManager.removeConfigSync('test-widget-lifecycle')

      savedConfig = WidgetConfigManager.getConfig('test-widget-lifecycle')
      expect(savedConfig).toBeNull()
    })
  })
})