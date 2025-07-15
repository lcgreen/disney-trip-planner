import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createStorageHandler, storageUtils, STORAGE_KEYS } from '@/lib/storage'

describe('Storage Utilities', () => {
  let testStorage: ReturnType<typeof createStorageHandler>

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
    testStorage = createStorageHandler('test-key')
  })

  afterEach(() => {
    // Clean up after each test
    localStorage.clear()
  })

  describe('createStorageHandler', () => {
    it('should return null for non-existent data', () => {
      expect(testStorage.get()).toBeNull()
    })

    it('should store and retrieve data correctly', () => {
      const testData = { name: 'test', value: 123 }
      testStorage.set(testData)

      expect(testStorage.get()).toEqual(testData)
    })

    it('should handle null and undefined values', () => {
      testStorage.set(null as any)
      expect(testStorage.get()).toBeNull()

      testStorage.set(undefined as any)
      expect(testStorage.get()).toBeNull()
    })

    it('should overwrite existing values', () => {
      testStorage.set('original')
      testStorage.set('updated')

      expect(testStorage.get()).toBe('updated')
    })

    it('should remove data correctly', () => {
      testStorage.set('test data')
      testStorage.remove()

      expect(testStorage.get()).toBeNull()
    })

    it('should handle non-existent keys gracefully when removing', () => {
      expect(() => testStorage.remove()).not.toThrow()
    })

        it('should update data using updater function', () => {
      testStorage.set({ count: 1 })
      testStorage.update(current => ({ count: ((current as any)?.count || 0) + 1 }))

      expect(testStorage.get()).toEqual({ count: 2 })
    })

    it('should handle updater function with null current value', () => {
      testStorage.update(current => ({ count: ((current as any)?.count || 0) + 1 }))

      expect(testStorage.get()).toEqual({ count: 1 })
    })
  })

  describe('storageUtils', () => {
    describe('initializeTripPlanStorage', () => {
      it('should initialize with empty plans array when no data exists', () => {
        const result = storageUtils.initializeTripPlanStorage()

        expect(result).toEqual({ plans: [] })
        expect(localStorage.getItem(STORAGE_KEYS.TRIP_PLANS)).toBe(JSON.stringify({ plans: [] }))
      })

      it('should return existing data when already initialized', () => {
        const existingData = { plans: [{ id: '1', name: 'Test Plan' } as any] }
        localStorage.setItem(STORAGE_KEYS.TRIP_PLANS, JSON.stringify(existingData))

        const result = storageUtils.initializeTripPlanStorage()

        expect(result).toEqual(existingData)
      })
    })

    describe('initializeBudgetStorage', () => {
      it('should initialize with empty budgets array when no data exists', () => {
        const result = storageUtils.initializeBudgetStorage()

        expect(result).toEqual({ budgets: [] })
        expect(localStorage.getItem(STORAGE_KEYS.BUDGET_DATA)).toBe(JSON.stringify({ budgets: [] }))
      })

      it('should return existing data when already initialized', () => {
        const existingData = { budgets: [{ id: '1', name: 'Test Budget' } as any] }
        localStorage.setItem(STORAGE_KEYS.BUDGET_DATA, JSON.stringify(existingData))

        const result = storageUtils.initializeBudgetStorage()

        expect(result).toEqual(existingData)
      })
    })

    describe('initializePackingStorage', () => {
      it('should initialize with empty lists array when no data exists', () => {
        const result = storageUtils.initializePackingStorage()

        expect(result).toEqual({ lists: [] })
        expect(localStorage.getItem(STORAGE_KEYS.PACKING_LISTS)).toBe(JSON.stringify({ lists: [] }))
      })

      it('should return existing data when already initialized', () => {
        const existingData = { lists: [{ id: '1', name: 'Test List' } as any] }
        localStorage.setItem(STORAGE_KEYS.PACKING_LISTS, JSON.stringify(existingData))

        const result = storageUtils.initializePackingStorage()

        expect(result).toEqual(existingData)
      })
    })

    describe('generateId', () => {
      it('should generate unique IDs', () => {
        const id1 = storageUtils.generateId()
        const id2 = storageUtils.generateId()

        expect(id1).toBeDefined()
        expect(id2).toBeDefined()
        expect(id1).not.toBe(id2)
      })

      it('should generate IDs with timestamp and random string', () => {
        const id = storageUtils.generateId()

        expect(id).toMatch(/^\d+-[a-z0-9]{9}$/)
      })
    })

    describe('getCurrentTimestamp', () => {
      it('should return ISO timestamp', () => {
        const timestamp = storageUtils.getCurrentTimestamp()

        expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      })
    })

    describe('clearAllData', () => {
      it('should clear all storage keys', () => {
        // Set up some test data
        localStorage.setItem(STORAGE_KEYS.TRIP_PLANS, 'test')
        localStorage.setItem(STORAGE_KEYS.BUDGET_DATA, 'test')
        localStorage.setItem(STORAGE_KEYS.PACKING_LISTS, 'test')

        storageUtils.clearAllData()

        expect(localStorage.getItem(STORAGE_KEYS.TRIP_PLANS)).toBeNull()
        expect(localStorage.getItem(STORAGE_KEYS.BUDGET_DATA)).toBeNull()
        expect(localStorage.getItem(STORAGE_KEYS.PACKING_LISTS)).toBeNull()
      })
    })
  })

  describe('Error handling', () => {
    it('should handle localStorage quota exceeded errors', () => {
      // Mock localStorage.setItem to throw quota exceeded error
      const originalSetItem = localStorage.setItem
      localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('QuotaExceededError')
      })

      expect(() => testStorage.set('large data')).toThrow('QuotaExceededError')

      // Restore original function
      localStorage.setItem = originalSetItem
    })

    it('should handle localStorage access denied errors', () => {
      // Mock localStorage.getItem to throw access denied error
      const originalGetItem = localStorage.getItem
      localStorage.getItem = vi.fn().mockImplementation(() => {
        throw new Error('Access denied')
      })

      expect(() => testStorage.get()).toThrow('Access denied')

      // Restore original function
      localStorage.getItem = originalGetItem
    })

    it('should handle JSON parse errors gracefully', () => {
      localStorage.setItem('test-key', 'invalid json')

      expect(testStorage.get()).toBeNull()
    })
  })

  describe('Integration tests', () => {
    it('should work together for a complete storage cycle', () => {
      const testData = { name: 'test', items: [1, 2, 3] }

      // Set data
      testStorage.set(testData)
      expect(testStorage.get()).toEqual(testData)

      // Update data
      const updatedData = { ...testData, items: [1, 2, 3, 4] }
      testStorage.set(updatedData)
      expect(testStorage.get()).toEqual(updatedData)

      // Remove data
      testStorage.remove()
      expect(testStorage.get()).toBeNull()
    })

    it('should handle multiple storage handlers', () => {
      const storage1 = createStorageHandler('key1')
      const storage2 = createStorageHandler('key2')

      const data1 = { id: 1, name: 'first' }
      const data2 = { id: 2, name: 'second' }

      storage1.set(data1)
      storage2.set(data2)

      expect(storage1.get()).toEqual(data1)
      expect(storage2.get()).toEqual(data2)

      storage1.remove()
      expect(storage1.get()).toBeNull()
      expect(storage2.get()).toEqual(data2)
    })
  })
})