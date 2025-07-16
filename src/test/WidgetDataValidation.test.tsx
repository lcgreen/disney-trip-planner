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
    validateAndCleanupItemReference: vi.fn(),
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
  }
}))

// Mock user management
vi.mock('@/lib/userManagement', () => ({
  userManager: {
    getCurrentUser: vi.fn(),
    hasFeatureAccess: vi.fn(),
  }
}))

describe('Widget Data Validation', () => {
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

  describe('Countdown Data Validation', () => {
    it('should validate required countdown fields', () => {
      const validCountdown = {
        id: 'test-countdown-1',
        name: 'Test Countdown',
        tripDate: '2024-12-25',
        park: { name: 'Magic Kingdom' },
        createdAt: '2024-01-01T00:00:00Z',
      }

      const invalidCountdown = {
        id: 'test-countdown-1',
        name: '', // Missing required name
        tripDate: '', // Missing required date
        park: null, // Missing required park
        createdAt: '2024-01-01T00:00:00Z',
      }

      // Validation functions
      const validateCountdown = (data: any) => {
        const errors = []
        if (!data.name || data.name.trim() === '') {
          errors.push('Name is required')
        }
        if (!data.tripDate || data.tripDate.trim() === '') {
          errors.push('Trip date is required')
        }
        if (!data.park) {
          errors.push('Park selection is required')
        }
        return errors
      }

      expect(validateCountdown(validCountdown)).toEqual([])
      expect(validateCountdown(invalidCountdown)).toEqual([
        'Name is required',
        'Trip date is required',
        'Park selection is required'
      ])
    })

    it('should validate countdown date format', () => {
      const validDates = [
        '2024-12-25',
        '2025-01-01',
        '2024-06-15',
      ]

      const invalidDates = [
        'invalid-date',
        '2024/12/25',
        '12-25-2024',
        '2024-13-01', // Invalid month
        '2024-12-32', // Invalid day
        '',
        null,
        undefined,
      ]

      const validateDate = (date: string) => {
        if (!date) return false
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(date)) return false

        const parsedDate = new Date(date)
        return !isNaN(parsedDate.getTime())
      }

      validDates.forEach(date => {
        expect(validateDate(date)).toBe(true)
      })

      invalidDates.forEach(date => {
        expect(validateDate(date)).toBe(false)
      })
    })

    it('should validate countdown date is in the future', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30)

      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 30)

      const validateFutureDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        return date > now
      }

      expect(validateFutureDate(futureDate.toISOString().split('T')[0])).toBe(true)
      expect(validateFutureDate(pastDate.toISOString().split('T')[0])).toBe(false)
    })

    it('should validate countdown name length and format', () => {
      const validNames = [
        'My Disney Trip',
        'Christmas 2024',
        'Summer Vacation',
        'A', // Minimum length
        'A'.repeat(100), // Maximum reasonable length
      ]

      const invalidNames = [
        '', // Empty
        '   ', // Only whitespace
        'A'.repeat(101), // Too long
        null,
        undefined,
      ]

      const validateName = (name: string) => {
        if (!name || typeof name !== 'string') return false
        const trimmed = name.trim()
        if (trimmed.length === 0) return false
        if (trimmed.length > 100) return false
        return true
      }

      validNames.forEach(name => {
        expect(validateName(name)).toBe(true)
      })

      invalidNames.forEach(name => {
        expect(validateName(name)).toBe(false)
      })
    })

    it('should validate park selection', () => {
      const validParks = [
        { id: 'mk', name: 'Magic Kingdom' },
        { id: 'ep', name: 'Epcot' },
        { id: 'hs', name: 'Hollywood Studios' },
        { id: 'ak', name: 'Animal Kingdom' },
      ]

      const invalidParks = [
        null,
        undefined,
        {},
        { name: 'Invalid Park' }, // Missing id
        { id: 'invalid' }, // Missing name
      ]

      const validatePark = (park: any) => {
        if (!park) return false
        if (!park.id || !park.name) return false
        const validParkIds = ['mk', 'ep', 'hs', 'ak']
        return validParkIds.includes(park.id)
      }

      validParks.forEach(park => {
        expect(validatePark(park)).toBe(true)
      })

      invalidParks.forEach(park => {
        expect(validatePark(park)).toBe(false)
      })
    })
  })

  describe('Budget Data Validation', () => {
    it('should validate budget amount format', () => {
      const validAmounts = [
        0,
        100,
        1000.50,
        9999.99,
        10000,
      ]

      const invalidAmounts = [
        -100, // Negative
        'invalid',
        null,
        undefined,
        NaN,
        Infinity,
        -Infinity,
      ]

      const validateAmount = (amount: number) => {
        if (typeof amount !== 'number') return false
        if (isNaN(amount) || !isFinite(amount)) return false
        if (amount < 0) return false
        if (amount > 1000000) return false // Reasonable maximum
        return true
      }

      validAmounts.forEach(amount => {
        expect(validateAmount(amount)).toBe(true)
      })

      invalidAmounts.forEach(amount => {
        expect(validateAmount(amount)).toBe(false)
      })
    })

    it('should validate budget categories', () => {
      const validCategories = [
        { id: '1', name: 'Food', budget: 1000, spent: 500 },
        { id: '2', name: 'Transportation', budget: 800, spent: 400 },
      ]

      const invalidCategories = [
        { name: 'Food', budget: 1000 }, // Missing id
        { id: '1', budget: 1000, spent: 500 }, // Missing name
        { id: '1', name: '', budget: 1000, spent: 500 }, // Empty name
        { id: '1', name: 'Food', budget: -100, spent: 500 }, // Negative budget
        { id: '1', name: 'Food', budget: 1000, spent: 1500 }, // Spent > budget
      ]

      const validateCategory = (category: any) => {
        if (!category.id || !category.name) return false
        if (category.name.trim() === '') return false
        if (category.budget < 0) return false
        if (category.spent < 0) return false
        if (category.spent > category.budget) return false
        return true
      }

      validCategories.forEach(category => {
        expect(validateCategory(category)).toBe(true)
      })

      invalidCategories.forEach(category => {
        expect(validateCategory(category)).toBe(false)
      })
    })

    it('should validate budget expenses', () => {
      const validExpenses = [
        { id: '1', date: '2024-01-01', category: 'Food', amount: 50, description: 'Lunch' },
        { id: '2', date: '2024-01-02', category: 'Transportation', amount: 25, description: 'Uber' },
      ]

      const invalidExpenses = [
        { date: '2024-01-01', category: 'Food', amount: 50, description: 'Lunch' }, // Missing id
        { id: '1', category: 'Food', amount: 50, description: 'Lunch' }, // Missing date
        { id: '1', date: '2024-01-01', amount: 50, description: 'Lunch' }, // Missing category
        { id: '1', date: '2024-01-01', category: 'Food', description: 'Lunch' }, // Missing amount
        { id: '1', date: 'invalid-date', category: 'Food', amount: 50, description: 'Lunch' }, // Invalid date
        { id: '1', date: '2024-01-01', category: 'Food', amount: -50, description: 'Lunch' }, // Negative amount
      ]

      const validateExpense = (expense: any) => {
        if (!expense.id || !expense.date || !expense.category || !expense.amount || !expense.description) {
          return false
        }
        if (expense.amount < 0) return false
        if (expense.description.trim() === '') return false

        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(expense.date)) return false

        const parsedDate = new Date(expense.date)
        return !isNaN(parsedDate.getTime())
      }

      validExpenses.forEach(expense => {
        expect(validateExpense(expense)).toBe(true)
      })

      invalidExpenses.forEach(expense => {
        expect(validateExpense(expense)).toBe(false)
      })
    })

    it('should validate total budget consistency', () => {
      const validBudget = {
        totalBudget: 5000,
        categories: [
          { id: '1', name: 'Food', budget: 2000, spent: 1000 },
          { id: '2', name: 'Transportation', budget: 1500, spent: 500 },
          { id: '3', name: 'Souvenirs', budget: 1500, spent: 200 },
        ]
      }

      const invalidBudget = {
        totalBudget: 5000,
        categories: [
          { id: '1', name: 'Food', budget: 2000, spent: 1000 },
          { id: '2', name: 'Transportation', budget: 1500, spent: 500 },
          { id: '3', name: 'Souvenirs', budget: 1500, spent: 200 },
          { id: '4', name: 'Extra', budget: 1000, spent: 0 }, // Exceeds total
        ]
      }

      const validateBudgetConsistency = (budget: any) => {
        const categoryTotal = budget.categories.reduce((sum: number, cat: any) => sum + cat.budget, 0)
        return categoryTotal <= budget.totalBudget
      }

      expect(validateBudgetConsistency(validBudget)).toBe(true)
      expect(validateBudgetConsistency(invalidBudget)).toBe(false)
    })
  })

  describe('Packing List Data Validation', () => {
    it('should validate packing item structure', () => {
      const validItems = [
        { id: '1', name: 'Passport', checked: true, category: 'Documents' },
        { id: '2', name: 'Phone Charger', checked: false, category: 'Electronics' },
      ]

      const invalidItems = [
        { name: 'Passport', checked: true, category: 'Documents' }, // Missing id
        { id: '1', checked: true, category: 'Documents' }, // Missing name
        { id: '1', name: '', checked: true, category: 'Documents' }, // Empty name
        { id: '1', name: 'Passport', category: 'Documents' }, // Missing checked
        { id: '1', name: 'Passport', checked: true }, // Missing category
      ]

      const validateItem = (item: any) => {
        if (!item.id || !item.name || typeof item.checked !== 'boolean' || !item.category) {
          return false
        }
        if (item.name.trim() === '') return false
        return true
      }

      validItems.forEach(item => {
        expect(validateItem(item)).toBe(true)
      })

      invalidItems.forEach(item => {
        expect(validateItem(item)).toBe(false)
      })
    })

    it('should validate packing item categories', () => {
      const validCategories = [
        'Documents',
        'Electronics',
        'Clothing',
        'Toiletries',
        'Entertainment',
        'Other',
      ]

      const invalidCategories = [
        '',
        null,
        undefined,
        'InvalidCategory',
      ]

      const validateCategory = (category: string) => {
        const validCategories = ['Documents', 'Electronics', 'Clothing', 'Toiletries', 'Entertainment', 'Other']
        return validCategories.includes(category)
      }

      validCategories.forEach(category => {
        expect(validateCategory(category)).toBe(true)
      })

      invalidCategories.forEach(category => {
        expect(validateCategory(category)).toBe(false)
      })
    })

    it('should validate weather selection', () => {
      const validWeather = [
        ['sunny'],
        ['rainy'],
        ['sunny', 'warm'],
        ['cold', 'snowy'],
        ['sunny', 'warm', 'humid'],
      ]

      const invalidWeather = [
        [],
        ['invalid-weather'],
        [null],
        [undefined],
        ['sunny', 'invalid-weather'],
      ]

      const validateWeather = (weather: string[]) => {
        if (!Array.isArray(weather) || weather.length === 0) return false
        const validOptions = ['sunny', 'rainy', 'warm', 'cold', 'humid', 'snowy']
        return weather.every(w => validOptions.includes(w))
      }

      validWeather.forEach(weather => {
        expect(validateWeather(weather)).toBe(true)
      })

      invalidWeather.forEach(weather => {
        expect(validateWeather(weather)).toBe(false)
      })
    })
  })

  describe('Trip Planner Data Validation', () => {
    it('should validate trip day structure', () => {
      const validDay = {
        id: '1',
        date: '2024-12-25',
        plans: [
          { id: '1', time: '09:00', activity: 'Breakfast', park: 'Magic Kingdom' },
          { id: '2', time: '10:00', activity: 'Ride Space Mountain', park: 'Magic Kingdom' },
        ]
      }

      const invalidDay = {
        id: '1',
        date: 'invalid-date',
        plans: [
          { time: '09:00', activity: 'Breakfast', park: 'Magic Kingdom' }, // Missing id
          { id: '2', activity: 'Ride Space Mountain', park: 'Magic Kingdom' }, // Missing time
        ]
      }

      const validateDay = (day: any) => {
        if (!day.id || !day.date) return false

        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(day.date)) return false

        // Validate plans
        if (!Array.isArray(day.plans)) return false
        return day.plans.every((plan: any) =>
          plan.id && plan.time && plan.activity && plan.park
        )
      }

      expect(validateDay(validDay)).toBe(true)
      expect(validateDay(invalidDay)).toBe(false)
    })

    it('should validate plan time format', () => {
      const validTimes = [
        '09:00',
        '12:30',
        '15:45',
        '23:59',
        '00:00',
      ]

      const invalidTimes = [
        '9:00', // Missing leading zero
        '25:00', // Invalid hour
        '12:60', // Invalid minute
        '12:30 PM', // Wrong format
        'invalid',
        '',
        null,
        undefined,
        '24:00', // Invalid hour (should be 23:59 max)
      ]

      const validateTime = (time: string) => {
        if (!time) return false
        const timeRegex = /^([01][0-9]|2[0-3]):[0-5][0-9]$/
        if (!timeRegex.test(time)) return false

        // Additional validation for hours and minutes
        const [hours, minutes] = time.split(':').map(Number)
        return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
      }

      validTimes.forEach(time => {
        expect(validateTime(time)).toBe(true)
      })

      invalidTimes.forEach(time => {
        const result = validateTime(time)
        if (result === true) {
          console.log(`Unexpectedly valid time: "${time}"`)
        }
        expect(result).toBe(false)
      })
    })

    it('should validate plan activity and park', () => {
      const validPlans = [
        { id: '1', time: '09:00', activity: 'Breakfast', park: 'Magic Kingdom' },
        { id: '2', time: '10:00', activity: 'Ride Space Mountain', park: 'Magic Kingdom' },
      ]

      const invalidPlans = [
        { id: '1', time: '09:00', activity: '', park: 'Magic Kingdom' }, // Empty activity
        { id: '2', time: '10:00', activity: 'Ride Space Mountain', park: '' }, // Empty park
        { id: '3', time: '11:00', activity: 'A'.repeat(101), park: 'Magic Kingdom' }, // Too long activity
      ]

      const validatePlan = (plan: any) => {
        if (!plan.activity || plan.activity.trim() === '') return false
        if (!plan.park || plan.park.trim() === '') return false
        if (plan.activity.length > 100) return false
        return true
      }

      validPlans.forEach(plan => {
        expect(validatePlan(plan)).toBe(true)
      })

      invalidPlans.forEach(plan => {
        expect(validatePlan(plan)).toBe(false)
      })
    })
  })

  describe('Data Integrity Validation', () => {
    it('should validate data consistency across saves', async () => {
      const originalData = {
        id: 'test-countdown-1',
        name: 'Original Countdown',
        tripDate: '2024-12-25',
        park: { name: 'Magic Kingdom' },
        createdAt: '2024-01-01T00:00:00Z',
      }

      const updatedData = {
        ...originalData,
        name: 'Updated Countdown',
        updatedAt: new Date().toISOString(),
      }

      // Simulate save and retrieve
      vi.mocked(UnifiedStorage.savePluginItems).mockResolvedValue()
      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([updatedData])

      await UnifiedStorage.savePluginItems('countdown', [updatedData])
      const retrievedData = UnifiedStorage.getPluginItems('countdown')

      // Validate data integrity
      expect(retrievedData[0].id).toBe(originalData.id)
      expect(retrievedData[0].name).toBe('Updated Countdown')
      expect(retrievedData[0].tripDate).toBe(originalData.tripDate)
      expect(retrievedData[0].park).toEqual(originalData.park)
      expect(retrievedData[0].createdAt).toBe(originalData.createdAt)
      expect(retrievedData[0].updatedAt).toBeDefined()
    })

    it('should validate widget configuration integrity', () => {
      const validConfig = {
        id: 'test-widget-1',
        type: 'countdown',
        order: 0,
        selectedItemId: 'test-countdown-1',
      }

      const invalidConfig = {
        id: '', // Empty id
        type: 'invalid-type', // Invalid type
        order: -1, // Negative order
        selectedItemId: null, // Invalid selected item
      }

      const validateConfig = (config: any) => {
        if (!config.id || config.id.trim() === '') return false
        if (!['countdown', 'budget', 'packing', 'planner'].includes(config.type)) return false
        if (typeof config.order !== 'number' || config.order < 0) return false
        return true
      }

      expect(validateConfig(validConfig)).toBe(true)
      expect(validateConfig(invalidConfig)).toBe(false)
    })

    it('should validate data relationships', () => {
      const widgetConfig = {
        id: 'test-widget-1',
        type: 'countdown',
        selectedItemId: 'test-countdown-1',
      }

      const availableItems = [
        { id: 'test-countdown-1', name: 'Test Countdown' },
        { id: 'test-countdown-2', name: 'Another Countdown' },
      ]

      const validateRelationship = (config: any, items: any[]) => {
        if (!config.selectedItemId) return true // No selection is valid
        return items.some(item => item.id === config.selectedItemId)
      }

      expect(validateRelationship(widgetConfig, availableItems)).toBe(true)

      // Test with invalid relationship
      const invalidConfig = {
        ...widgetConfig,
        selectedItemId: 'non-existent-item',
      }

      expect(validateRelationship(invalidConfig, availableItems)).toBe(false)
    })
  })

  describe('Cross-Field Validation', () => {
    it('should validate countdown date is after creation date', () => {
      const validCountdown = {
        createdAt: '2024-01-01T00:00:00Z',
        tripDate: '2024-12-25',
      }

      const invalidCountdown = {
        createdAt: '2024-12-26T00:00:00Z', // After trip date
        tripDate: '2024-12-25',
      }

      const validateDateOrder = (countdown: any) => {
        const createdDate = new Date(countdown.createdAt)
        const tripDate = new Date(countdown.tripDate)
        return tripDate > createdDate
      }

      expect(validateDateOrder(validCountdown)).toBe(true)
      expect(validateDateOrder(invalidCountdown)).toBe(false)
    })

    it('should validate budget totals match category totals', () => {
      const validBudget = {
        totalBudget: 5000,
        categories: [
          { budget: 2000 },
          { budget: 1500 },
          { budget: 1500 },
        ]
      }

      const invalidBudget = {
        totalBudget: 5000,
        categories: [
          { budget: 2000 },
          { budget: 1500 },
          { budget: 1500 },
          { budget: 1000 }, // Exceeds total
        ]
      }

      const validateBudgetTotals = (budget: any) => {
        const categoryTotal = budget.categories.reduce((sum: number, cat: any) => sum + cat.budget, 0)
        return categoryTotal <= budget.totalBudget
      }

      expect(validateBudgetTotals(validBudget)).toBe(true)
      expect(validateBudgetTotals(invalidBudget)).toBe(false)
    })

    it('should validate packing list completeness', () => {
      const validPackingList = {
        items: [
          { name: 'Passport', category: 'Documents', checked: true },
          { name: 'Phone Charger', category: 'Electronics', checked: false },
        ],
        selectedWeather: ['sunny', 'warm'],
      }

      const invalidPackingList = {
        items: [
          { name: 'Passport', category: 'Documents', checked: true },
          { name: 'Phone Charger', category: 'Electronics', checked: false },
        ],
        selectedWeather: [], // No weather selected
      }

      const validatePackingCompleteness = (packingList: any) => {
        if (packingList.selectedWeather.length === 0) return false
        if (packingList.items.length === 0) return false
        return true
      }

      expect(validatePackingCompleteness(validPackingList)).toBe(true)
      expect(validatePackingCompleteness(invalidPackingList)).toBe(false)
    })
  })

  describe('Error Recovery Validation', () => {
    it('should handle corrupted data gracefully', () => {
      const corruptedData = [
        null,
        undefined,
        {},
        { id: null },
        { id: 'test', name: null },
      ]

      const validateAndCleanData = (data: any) => {
        if (!data || typeof data !== 'object') return null
        if (!data.id || typeof data.id !== 'string') return null
        if (!data.name || typeof data.name !== 'string') return null
        return data
      }

      corruptedData.forEach(data => {
        expect(validateAndCleanData(data)).toBeNull()
      })
    })

    it('should recover from partial data corruption', () => {
      const partiallyCorruptedData = {
        id: 'test-countdown-1',
        name: 'Test Countdown',
        tripDate: null, // Corrupted
        park: { name: 'Magic Kingdom' },
        createdAt: '2024-01-01T00:00:00Z',
      }

      const recoverData = (data: any) => {
        const recovered = { ...data }

        // Provide defaults for corrupted fields
        if (!recovered.tripDate) {
          recovered.tripDate = new Date().toISOString().split('T')[0]
        }

        return recovered
      }

      const recovered = recoverData(partiallyCorruptedData)
      expect(recovered.tripDate).toBeDefined()
      expect(recovered.name).toBe('Test Countdown')
    })

    it('should validate data after recovery', () => {
      const recoveredData = {
        id: 'test-countdown-1',
        name: 'Test Countdown',
        tripDate: '2024-12-25',
        park: { name: 'Magic Kingdom' },
        createdAt: '2024-01-01T00:00:00Z',
      }

      const validateRecoveredData = (data: any) => {
        const errors = []
        if (!data.id || data.id.trim() === '') errors.push('Invalid ID')
        if (!data.name || data.name.trim() === '') errors.push('Invalid name')
        if (!data.tripDate) errors.push('Invalid trip date')
        if (!data.park || !data.park.name) errors.push('Invalid park')
        return errors
      }

      const errors = validateRecoveredData(recoveredData)
      expect(errors).toEqual([])
    })
  })
})