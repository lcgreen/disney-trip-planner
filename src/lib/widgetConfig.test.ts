import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { WidgetConfigManager } from '@/lib/widgetConfig'

describe('WidgetConfigManager', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Clean up after each test
    localStorage.clear()
  })

  describe('getConfigs', () => {
    it('should return empty array when no configs exist', () => {
      const configs = WidgetConfigManager.getConfigs()
      expect(configs).toEqual([])
    })

    it('should return all widget configs', () => {
      const config1 = {
        id: 'widget-1',
        type: 'countdown' as const,
        size: 'medium' as const,
        order: 0,
        settings: {}
      }
      const config2 = {
        id: 'widget-2',
        type: 'packing' as const,
        size: 'medium' as const,
        order: 1,
        settings: {}
      }

      WidgetConfigManager.addConfig(config1)
      WidgetConfigManager.addConfig(config2)

      const configs = WidgetConfigManager.getConfigs()
      expect(configs).toHaveLength(2)
      expect(configs.find(c => c.id === 'widget-1')).toBeDefined()
      expect(configs.find(c => c.id === 'widget-2')).toBeDefined()
    })
  })

  describe('getConfig', () => {
    it('should return null for non-existent widget', () => {
      const config = WidgetConfigManager.getConfig('test-widget')
      expect(config).toBeNull()
    })

    it('should return existing config for existing widget', () => {
      const existingConfig = {
        id: 'test-widget',
        type: 'countdown' as const,
        size: 'medium' as const,
        order: 0,
        selectedItemId: 'item-123',
        settings: { theme: 'dark' }
      }

      WidgetConfigManager.addConfig(existingConfig)

      const config = WidgetConfigManager.getConfig('test-widget')
      expect(config).toEqual(existingConfig)
    })
  })

  describe('addConfig', () => {
    it('should add new widget configuration', () => {
      const config = {
        id: 'new-widget',
        type: 'countdown' as const,
        size: 'medium' as const,
        order: 0,
        settings: {}
      }

      WidgetConfigManager.addConfig(config)

      const savedConfig = WidgetConfigManager.getConfig('new-widget')
      expect(savedConfig).toEqual({ ...config, order: 0 })
    })

    it('should set order to be at the end', () => {
      // Add first widget
      WidgetConfigManager.addConfig({
        id: 'widget-1',
        type: 'countdown' as const,
        size: 'medium' as const,
        order: 0,
        settings: {}
      })

      // Add second widget
      WidgetConfigManager.addConfig({
        id: 'widget-2',
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
        id: 'test-widget',
        type: 'countdown' as const,
        size: 'medium' as const,
        order: 0,
        settings: {}
      }

      WidgetConfigManager.addConfig(initialConfig)

      const updates = {
        selectedItemId: 'new-item',
        settings: { theme: 'dark' }
      }

      WidgetConfigManager.updateConfig('test-widget', updates)

      const config = WidgetConfigManager.getConfig('test-widget')
      expect(config?.selectedItemId).toBe('new-item')
      expect(config?.settings).toEqual({ theme: 'dark' })
    })

    it('should handle non-existent widget gracefully', () => {
      expect(() => WidgetConfigManager.updateConfig('non-existent', { selectedItemId: 'item-1' })).not.toThrow()
    })
  })

  describe('removeConfig', () => {
    it('should remove widget configuration', () => {
      const config = {
        id: 'test-widget',
        type: 'countdown' as const,
        size: 'medium' as const,
        order: 0,
        settings: {}
      }

      WidgetConfigManager.addConfig(config)
      WidgetConfigManager.removeConfig('test-widget')

      const savedConfig = WidgetConfigManager.getConfig('test-widget')
      expect(savedConfig).toBeNull()
    })

    it('should reorder remaining widgets', () => {
      // Add multiple widgets
      WidgetConfigManager.addConfig({
        id: 'widget-1',
        type: 'countdown' as const,
        size: 'medium' as const,
        order: 0,
        settings: {}
      })
      WidgetConfigManager.addConfig({
        id: 'widget-2',
        type: 'packing' as const,
        size: 'medium' as const,
        order: 1,
        settings: {}
      })
      WidgetConfigManager.addConfig({
        id: 'widget-3',
        type: 'budget' as const,
        size: 'medium' as const,
        order: 2,
        settings: {}
      })

      // Remove middle widget
      WidgetConfigManager.removeConfig('widget-2')

      const configs = WidgetConfigManager.getConfigs()
      expect(configs).toHaveLength(2)
      expect(configs[0].order).toBe(0)
      expect(configs[1].order).toBe(1)
    })
  })

  describe('cleanupDeletedItemReferences', () => {
    it('should remove references to deleted items', () => {
      // Add widgets with item references
      WidgetConfigManager.addConfig({
        id: 'widget-1',
        type: 'countdown' as const,
        size: 'medium' as const,
        order: 0,
        selectedItemId: 'deleted-item',
        settings: {}
      })
      WidgetConfigManager.addConfig({
        id: 'widget-2',
        type: 'countdown' as const,
        size: 'medium' as const,
        order: 1,
        selectedItemId: 'existing-item',
        settings: {}
      })

      WidgetConfigManager.cleanupDeletedItemReferences('deleted-item', 'countdown')

      const configs = WidgetConfigManager.getConfigs()
      const widget1 = configs.find(c => c.id === 'widget-1')
      const widget2 = configs.find(c => c.id === 'widget-2')

      expect(widget1?.selectedItemId).toBeUndefined()
      expect(widget2?.selectedItemId).toBe('existing-item') // Should be preserved
    })
  })

  describe('cleanupAllItemReferences', () => {
    it('should remove all item references for a widget type', () => {
      // Add widgets with item references
      WidgetConfigManager.addConfig({
        id: 'widget-1',
        type: 'countdown' as const,
        size: 'medium' as const,
        order: 0,
        selectedItemId: 'item-1',
        settings: {}
      })
      WidgetConfigManager.addConfig({
        id: 'widget-2',
        type: 'packing' as const,
        size: 'medium' as const,
        order: 1,
        selectedItemId: 'item-2',
        settings: {}
      })

      WidgetConfigManager.cleanupAllItemReferences('countdown')

      const configs = WidgetConfigManager.getConfigs()
      const widget1 = configs.find(c => c.id === 'widget-1')
      const widget2 = configs.find(c => c.id === 'widget-2')

      expect(widget1?.selectedItemId).toBeUndefined()
      expect(widget2?.selectedItemId).toBe('item-2') // Should be preserved
    })
  })

  describe('reorderWidgets', () => {
    it('should reorder widgets according to new order', () => {
      // Add widgets
      WidgetConfigManager.addConfig({
        id: 'widget-1',
        type: 'countdown' as const,
        size: 'medium' as const,
        order: 0,
        settings: {}
      })
      WidgetConfigManager.addConfig({
        id: 'widget-2',
        type: 'packing' as const,
        size: 'medium' as const,
        order: 1,
        settings: {}
      })

      // Reorder
      WidgetConfigManager.reorderWidgets(['widget-2', 'widget-1'])

      const configs = WidgetConfigManager.getConfigs()
      expect(configs[0].id).toBe('widget-2')
      expect(configs[0].order).toBe(0)
      expect(configs[1].id).toBe('widget-1')
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

      expect(() => WidgetConfigManager.addConfig({
        id: 'test-widget',
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
        id: 'test-widget',
        type: 'countdown' as const,
        size: 'medium' as const,
        order: 0,
        selectedItemId: 'item-1',
        settings: { theme: 'dark' }
      }

      WidgetConfigManager.addConfig(config)

      // Verify config
      let savedConfig = WidgetConfigManager.getConfig('test-widget')
      expect(savedConfig?.selectedItemId).toBe('item-1')
      expect(savedConfig?.settings).toEqual({ theme: 'dark' })

      // Update config
      WidgetConfigManager.updateConfig('test-widget', {
        selectedItemId: 'item-2',
        settings: { theme: 'light' }
      })

      savedConfig = WidgetConfigManager.getConfig('test-widget')
      expect(savedConfig?.selectedItemId).toBe('item-2')
      expect(savedConfig?.settings).toEqual({ theme: 'light' })

      // Clean up item reference
      WidgetConfigManager.cleanupDeletedItemReferences('item-2', 'countdown')

      savedConfig = WidgetConfigManager.getConfig('test-widget')
      expect(savedConfig?.selectedItemId).toBeUndefined()

      // Remove widget
      WidgetConfigManager.removeConfig('test-widget')

      savedConfig = WidgetConfigManager.getConfig('test-widget')
      expect(savedConfig).toBeNull()
    })
  })
})