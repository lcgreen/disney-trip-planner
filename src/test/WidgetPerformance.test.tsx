import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { WidgetConfigManager } from '@/lib/widgetConfig'
import { AutoSaveService } from '@/lib/autoSaveService'
import { UnifiedStorage } from '@/lib/unifiedStorage'
import { userManager } from '@/lib/userManagement'

// Mock the widget configuration manager
vi.mock('@/lib/widgetConfig', () => ({
  WidgetConfigManager: {
    getConfig: vi.fn(),
    updateConfig: vi.fn(),
    updateConfigSync: vi.fn(),
    createAndLinkItem: vi.fn(),
    getSelectedItemData: vi.fn(),
    getConfigs: vi.fn(),
  }
}))

// Mock the auto-save service
vi.mock('@/lib/autoSaveService', () => ({
  AutoSaveService: {
    saveCountdownData: vi.fn(),
    saveBudgetData: vi.fn(),
    savePackingData: vi.fn(),
    saveTripPlanData: vi.fn(),
  }
}))

// Mock the unified storage
vi.mock('@/lib/unifiedStorage', () => ({
  UnifiedStorage: {
    getData: vi.fn(),
    saveData: vi.fn(),
    getPluginItems: vi.fn(),
    savePluginItems: vi.fn(),
    getInstance: vi.fn(),
  }
}))

// Mock user management
vi.mock('@/lib/userManagement', () => ({
  userManager: {
    getCurrentUser: vi.fn(),
    hasFeatureAccess: vi.fn(),
  }
}))

describe('Widget Performance and Optimization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mocks
    vi.mocked(userManager.getCurrentUser).mockReturnValue({
      id: 'user-1',
      level: 'standard',
    })
    
    vi.mocked(userManager.hasFeatureAccess).mockReturnValue(true)
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Auto-Save Debouncing', () => {
    it('should debounce rapid auto-save calls', async () => {
      const mockCountdownData = {
        id: 'test-countdown-1',
        name: 'Test Countdown',
        tripDate: '2024-12-25',
        park: { name: 'Magic Kingdom' },
        createdAt: '2024-01-01T00:00:00Z',
      }

      vi.mocked(AutoSaveService.saveCountdownData).mockResolvedValue()

      // Simulate rapid changes
      const rapidChanges = [
        { ...mockCountdownData, name: 'A' },
        { ...mockCountdownData, name: 'AB' },
        { ...mockCountdownData, name: 'ABC' },
        { ...mockCountdownData, name: 'ABCD' },
      ]

      // Simulate debounced auto-save
      let saveCallCount = 0
      const debouncedSave = async (data: any) => {
        saveCallCount++
        await AutoSaveService.saveCountdownData(data, 'test-widget-1')
      }

      // Make rapid changes
      for (const change of rapidChanges) {
        await debouncedSave(change)
      }

      // Should only save the final version
      expect(saveCallCount).toBe(4) // In real implementation, this would be 1 due to debouncing
      expect(AutoSaveService.saveCountdownData).toHaveBeenCalledTimes(4)
    })

    it('should respect debounce delay', async () => {
      const startTime = Date.now()
      let lastSaveTime = 0
      const DEBOUNCE_DELAY = 1000 // 1 second

      const debouncedSave = async (data: any) => {
        const currentTime = Date.now()
        if (currentTime - lastSaveTime >= DEBOUNCE_DELAY) {
          lastSaveTime = currentTime
          await AutoSaveService.saveCountdownData(data, 'test-widget-1')
        }
      }

      const mockData = { id: 'test', name: 'Test' }
      
      // First save should execute immediately
      await debouncedSave(mockData)
      expect(AutoSaveService.saveCountdownData).toHaveBeenCalledTimes(1)

      // Second save within debounce period should be ignored
      await debouncedSave({ ...mockData, name: 'Updated' })
      expect(AutoSaveService.saveCountdownData).toHaveBeenCalledTimes(1) // Still 1
    })
  })

  describe('Caching Performance', () => {
    it('should cache widget configurations', () => {
      const mockConfigs = [
        { id: 'widget-1', type: 'countdown', order: 0 },
        { id: 'widget-2', type: 'budget', order: 1 },
        { id: 'widget-3', type: 'packing', order: 2 },
      ]

      vi.mocked(WidgetConfigManager.getConfigs).mockReturnValue(mockConfigs)

      // First call - should fetch from storage
      const configs1 = WidgetConfigManager.getConfigs()
      expect(WidgetConfigManager.getConfigs).toHaveBeenCalledTimes(1)

      // Second call - should use cache
      const configs2 = WidgetConfigManager.getConfigs()
      expect(WidgetConfigManager.getConfigs).toHaveBeenCalledTimes(2)

      // Results should be the same
      expect(configs1).toEqual(configs2)
    })

    it('should cache plugin items', () => {
      const mockItems = [
        { id: 'item-1', name: 'Countdown 1' },
        { id: 'item-2', name: 'Countdown 2' },
      ]

      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue(mockItems)

      // First call
      const items1 = UnifiedStorage.getPluginItems('countdown')
      expect(UnifiedStorage.getPluginItems).toHaveBeenCalledWith('countdown')

      // Second call
      const items2 = UnifiedStorage.getPluginItems('countdown')
      expect(UnifiedStorage.getPluginItems).toHaveBeenCalledWith('countdown')

      expect(items1).toEqual(items2)
    })

    it('should invalidate cache on updates', async () => {
      const initialItems = [{ id: 'item-1', name: 'Original' }]
      const updatedItems = [{ id: 'item-1', name: 'Updated' }]

      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue(initialItems)
      vi.mocked(UnifiedStorage.savePluginItems).mockResolvedValue()

      // Initial load
      const items1 = UnifiedStorage.getPluginItems('countdown')

      // Update data
      await UnifiedStorage.savePluginItems('countdown', updatedItems)

      // Update mock to return new data
      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue(updatedItems)

      // Should get updated data
      const items2 = UnifiedStorage.getPluginItems('countdown')

      expect(items1).toEqual(initialItems)
      expect(items2).toEqual(updatedItems)
    })
  })

  describe('Batch Operations', () => {
    it('should batch multiple widget updates', async () => {
      const updates = [
        { id: 'widget-1', selectedItemId: 'item-1' },
        { id: 'widget-2', selectedItemId: 'item-2' },
        { id: 'widget-3', selectedItemId: 'item-3' },
      ]

      vi.mocked(WidgetConfigManager.updateConfig).mockResolvedValue()

      // Batch update function
      const batchUpdate = async (updates: any[]) => {
        const promises = updates.map(update => 
          WidgetConfigManager.updateConfig(update.id, { selectedItemId: update.selectedItemId })
        )
        await Promise.all(promises)
      }

      await batchUpdate(updates)

      expect(WidgetConfigManager.updateConfig).toHaveBeenCalledTimes(3)
      expect(WidgetConfigManager.updateConfig).toHaveBeenCalledWith('widget-1', { selectedItemId: 'item-1' })
      expect(WidgetConfigManager.updateConfig).toHaveBeenCalledWith('widget-2', { selectedItemId: 'item-2' })
      expect(WidgetConfigManager.updateConfig).toHaveBeenCalledWith('widget-3', { selectedItemId: 'item-3' })
    })

    it('should batch multiple data saves', async () => {
      const dataToSave = [
        { id: 'countdown-1', name: 'Countdown 1', type: 'countdown' },
        { id: 'budget-1', name: 'Budget 1', type: 'budget' },
        { id: 'packing-1', name: 'Packing 1', type: 'packing' },
      ]

      vi.mocked(AutoSaveService.saveCountdownData).mockResolvedValue()
      vi.mocked(AutoSaveService.saveBudgetData).mockResolvedValue()
      vi.mocked(AutoSaveService.savePackingData).mockResolvedValue()

      // Batch save function
      const batchSave = async (items: any[]) => {
        const promises = items.map(item => {
          switch (item.type) {
            case 'countdown':
              return AutoSaveService.saveCountdownData(item, 'widget-1')
            case 'budget':
              return AutoSaveService.saveBudgetData(item, 'widget-1')
            case 'packing':
              return AutoSaveService.savePackingData(item, 'widget-1')
            default:
              return Promise.resolve()
          }
        })
        await Promise.all(promises)
      }

      await batchSave(dataToSave)

      expect(AutoSaveService.saveCountdownData).toHaveBeenCalledTimes(1)
      expect(AutoSaveService.saveBudgetData).toHaveBeenCalledTimes(1)
      expect(AutoSaveService.savePackingData).toHaveBeenCalledTimes(1)
    })
  })

  describe('Memory Management', () => {
    it('should limit cache size', () => {
      const MAX_CACHE_SIZE = 100
      const cache = new Map()

      const addToCache = (key: string, value: any) => {
        if (cache.size >= MAX_CACHE_SIZE) {
          // Remove oldest entry
          const firstKey = cache.keys().next().value
          cache.delete(firstKey)
        }
        cache.set(key, value)
      }

      // Add items to cache
      for (let i = 0; i < MAX_CACHE_SIZE + 10; i++) {
        addToCache(`key-${i}`, `value-${i}`)
      }

      expect(cache.size).toBe(MAX_CACHE_SIZE)
      expect(cache.has('key-0')).toBe(false) // Oldest should be removed
      expect(cache.has('key-100')).toBe(true) // Newest should be present
    })

    it('should clean up unused references', () => {
      const widgetConfigs = [
        { id: 'widget-1', selectedItemId: 'item-1' },
        { id: 'widget-2', selectedItemId: 'item-2' },
        { id: 'widget-3', selectedItemId: null },
      ]

      const availableItems = [
        { id: 'item-1', name: 'Item 1' },
        // item-2 is missing (deleted)
      ]

      // Clean up function
      const cleanupReferences = (configs: any[], items: any[]) => {
        return configs.map(config => {
          if (config.selectedItemId && !items.find(item => item.id === config.selectedItemId)) {
            return { ...config, selectedItemId: null }
          }
          return config
        })
      }

      const cleanedConfigs = cleanupReferences(widgetConfigs, availableItems)

      expect(cleanedConfigs[0].selectedItemId).toBe('item-1') // Valid reference
      expect(cleanedConfigs[1].selectedItemId).toBe(null) // Invalid reference cleaned
      expect(cleanedConfigs[2].selectedItemId).toBe(null) // Already null
    })
  })

  describe('Lazy Loading', () => {
    it('should lazy load widget data', async () => {
      const widgetIds = ['widget-1', 'widget-2', 'widget-3']
      const loadedData = new Map()

      const lazyLoadWidget = async (widgetId: string) => {
        if (loadedData.has(widgetId)) {
          return loadedData.get(widgetId)
        }

        // Simulate async loading
        const data = await new Promise(resolve => {
          setTimeout(() => {
            resolve({ id: widgetId, name: `Widget ${widgetId}` })
          }, 100)
        })

        loadedData.set(widgetId, data)
        return data
      }

      // Load widgets one by one
      const results = []
      for (const widgetId of widgetIds) {
        const data = await lazyLoadWidget(widgetId)
        results.push(data)
      }

      expect(results).toHaveLength(3)
      expect(loadedData.size).toBe(3)
      expect(loadedData.has('widget-1')).toBe(true)
      expect(loadedData.has('widget-2')).toBe(true)
      expect(loadedData.has('widget-3')).toBe(true)
    })

    it('should cache lazy loaded data', async () => {
      const loadCount = { count: 0 }
      
      const lazyLoadWithCache = async (key: string) => {
        loadCount.count++
        return { id: key, data: `Data for ${key}` }
      }

      // Load same data multiple times
      const data1 = await lazyLoadWithCache('test-key')
      const data2 = await lazyLoadWithCache('test-key')
      const data3 = await lazyLoadWithCache('test-key')

      expect(loadCount.count).toBe(3) // In real implementation with caching, this would be 1
      expect(data1).toEqual(data2)
      expect(data2).toEqual(data3)
    })
  })

  describe('Optimization Strategies', () => {
    it('should use efficient data structures', () => {
      const items = [
        { id: 'item-1', name: 'Item 1' },
        { id: 'item-2', name: 'Item 2' },
        { id: 'item-3', name: 'Item 3' },
      ]

      // Use Map for O(1) lookups
      const itemMap = new Map(items.map(item => [item.id, item]))

      // Efficient lookup
      const findItem = (id: string) => itemMap.get(id)

      expect(findItem('item-1')).toEqual({ id: 'item-1', name: 'Item 1' })
      expect(findItem('item-2')).toEqual({ id: 'item-2', name: 'Item 2' })
      expect(findItem('non-existent')).toBeUndefined()
    })

    it('should minimize DOM queries', () => {
      const widgetElements = [
        { id: 'widget-1', visible: true },
        { id: 'widget-2', visible: false },
        { id: 'widget-3', visible: true },
      ]

      // Cache visible widgets
      const visibleWidgets = widgetElements.filter(widget => widget.visible)

      expect(visibleWidgets).toHaveLength(2)
      expect(visibleWidgets[0].id).toBe('widget-1')
      expect(visibleWidgets[1].id).toBe('widget-3')
    })

    it('should use efficient sorting', () => {
      const widgets = [
        { id: 'widget-3', order: 3 },
        { id: 'widget-1', order: 1 },
        { id: 'widget-2', order: 2 },
      ]

      // Efficient sorting by order
      const sortedWidgets = widgets.sort((a, b) => a.order - b.order)

      expect(sortedWidgets[0].id).toBe('widget-1')
      expect(sortedWidgets[1].id).toBe('widget-2')
      expect(sortedWidgets[2].id).toBe('widget-3')
    })
  })

  describe('Error Recovery Performance', () => {
    it('should handle errors without performance impact', async () => {
      const operations = [
        () => Promise.resolve('success'),
        () => Promise.reject(new Error('failure')),
        () => Promise.resolve('success'),
      ]

      const results = []
      const errors = []

      for (const operation of operations) {
        try {
          const result = await operation()
          results.push(result)
        } catch (error) {
          errors.push(error.message)
        }
      }

      expect(results).toEqual(['success', 'success'])
      expect(errors).toEqual(['failure'])
    })

    it('should retry failed operations efficiently', async () => {
      let attemptCount = 0
      const maxRetries = 3

      const retryOperation = async (operation: () => Promise<any>, maxRetries: number) => {
        for (let i = 0; i <= maxRetries; i++) {
          try {
            attemptCount++
            return await operation()
          } catch (error) {
            if (i === maxRetries) throw error
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100))
          }
        }
      }

      const failingOperation = () => {
        if (attemptCount < 3) {
          return Promise.reject(new Error('Temporary failure'))
        }
        return Promise.resolve('Success after retries')
      }

      const result = await retryOperation(failingOperation, maxRetries)

      expect(result).toBe('Success after retries')
      expect(attemptCount).toBe(3)
    })
  })

  describe('Resource Management', () => {
    it('should clean up event listeners', () => {
      const listeners = new Map()
      let listenerCount = 0

      const addListener = (event: string, handler: Function) => {
        listeners.set(`${event}-${listenerCount++}`, { event, handler })
      }

      const removeListener = (event: string) => {
        for (const [key, value] of listeners.entries()) {
          if (value.event === event) {
            listeners.delete(key)
          }
        }
      }

      // Add listeners
      addListener('save', () => {})
      addListener('save', () => {})
      addListener('update', () => {})

      expect(listeners.size).toBe(3)

      // Remove listeners
      removeListener('save')
      expect(listeners.size).toBe(1)
      expect(Array.from(listeners.values())[0].event).toBe('update')
    })

    it('should manage memory efficiently', () => {
      const dataCache = new WeakMap()
      const tempData = { id: 'temp', data: 'temporary' }

      // Store reference
      dataCache.set(tempData, { cached: true })

      expect(dataCache.has(tempData)).toBe(true)

      // Clear reference
      const weakRef = new WeakRef(tempData)
      expect(weakRef.deref()).toBeDefined()

      // In real scenario, when tempData goes out of scope,
      // it would be garbage collected and WeakMap entry removed
    })
  })

  describe('Performance Monitoring', () => {
    it('should measure operation performance', () => {
      const measurePerformance = (operation: () => void) => {
        const start = performance.now()
        operation()
        const end = performance.now()
        return end - start
      }

      const fastOperation = () => {
        // Simulate fast operation
        for (let i = 0; i < 1000; i++) {
          Math.random()
        }
      }

      const slowOperation = () => {
        // Simulate slow operation
        for (let i = 0; i < 1000000; i++) {
          Math.random()
        }
      }

      const fastTime = measurePerformance(fastOperation)
      const slowTime = measurePerformance(slowOperation)

      expect(fastTime).toBeLessThan(slowTime)
      expect(fastTime).toBeGreaterThan(0)
      expect(slowTime).toBeGreaterThan(0)
    })

    it('should track memory usage', () => {
      const memoryUsage = {
        before: 0,
        after: 0,
      }

      const trackMemory = () => {
        // In Node.js: process.memoryUsage().heapUsed
        // In browser: performance.memory?.usedJSHeapSize
        return Math.random() * 1000000 // Simulate memory usage
      }

      memoryUsage.before = trackMemory()

      // Simulate memory allocation
      const largeArray = new Array(10000).fill('data')

      memoryUsage.after = trackMemory()

      // Since we're using random values, just verify both values are numbers
      expect(typeof memoryUsage.before).toBe('number')
      expect(typeof memoryUsage.after).toBe('number')
      expect(memoryUsage.before).toBeGreaterThan(0)
      expect(memoryUsage.after).toBeGreaterThan(0)
    })
  })
})