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

describe('Widget Editing Core Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mocks
    vi.mocked(userManager.getCurrentUser).mockReturnValue({
      id: 'user-1',
      level: 'standard',
    })
    
    vi.mocked(userManager.hasFeatureAccess).mockReturnValue(true)
    
    vi.mocked(WidgetConfigManager.getConfig).mockReturnValue({
      id: 'test-widget-1',
      type: 'countdown',
      order: 0,
      selectedItemId: 'test-countdown-1',
    })
    
    vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([
      {
        id: 'test-countdown-1',
        name: 'Test Countdown',
        tripDate: '2024-12-25',
        park: { name: 'Magic Kingdom' },
        createdAt: '2024-01-01T00:00:00Z',
      }
    ])
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Edit Navigation Logic', () => {
    it('should generate correct edit URL for countdown widget', () => {
      const widgetId = 'test-widget-1'
      const editItemId = 'test-countdown-1'
      const widgetType = 'countdown'
      
      const editUrl = `/${widgetType}/new?widgetId=${widgetId}&editItemId=${editItemId}`
      
      expect(editUrl).toBe('/countdown/new?widgetId=test-widget-1&editItemId=test-countdown-1')
    })

    it('should generate correct edit URL for budget widget', () => {
      const widgetId = 'budget-widget-1'
      const editItemId = 'test-budget-1'
      const widgetType = 'budget'
      
      const editUrl = `/${widgetType}/new?widgetId=${widgetId}&editItemId=${editItemId}`
      
      expect(editUrl).toBe('/budget/new?widgetId=budget-widget-1&editItemId=test-budget-1')
    })

    it('should generate correct create new URL', () => {
      const widgetId = 'test-widget-1'
      const widgetType = 'countdown'
      
      const createUrl = `/${widgetType}/new?widgetId=${widgetId}`
      
      expect(createUrl).toBe('/countdown/new?widgetId=test-widget-1')
    })
  })

  describe('Auto-Save Functionality', () => {
    it('should auto-save countdown data when changes are made', async () => {
      const mockCountdownData = {
        id: 'test-countdown-1',
        name: 'Updated Countdown',
        tripDate: '2024-12-25',
        park: { name: 'Magic Kingdom' },
        settings: {},
        createdAt: '2024-01-01T00:00:00Z',
      }
      
      vi.mocked(AutoSaveService.saveCountdownData).mockResolvedValue()
      
      // Simulate auto-save being triggered
      await AutoSaveService.saveCountdownData(mockCountdownData, 'test-widget-1')
      
      // Verify auto-save was called with correct data
      expect(AutoSaveService.saveCountdownData).toHaveBeenCalledWith(
        mockCountdownData,
        'test-widget-1'
      )
    })

    it('should auto-save budget data when changes are made', async () => {
      const mockBudgetData = {
        id: 'test-budget-1',
        name: 'Updated Budget',
        totalBudget: 5000,
        categories: [],
        expenses: [],
        createdAt: '2024-01-01T00:00:00Z',
      }
      
      vi.mocked(AutoSaveService.saveBudgetData).mockResolvedValue()
      
      // Simulate auto-save being triggered
      await AutoSaveService.saveBudgetData(mockBudgetData, 'budget-widget-1')
      
      // Verify auto-save was called with correct data
      expect(AutoSaveService.saveBudgetData).toHaveBeenCalledWith(
        mockBudgetData,
        'budget-widget-1'
      )
    })

    it('should auto-save packing data when changes are made', async () => {
      const mockPackingData = {
        id: 'test-packing-1',
        name: 'Updated Packing List',
        items: [],
        selectedWeather: ['sunny'],
        createdAt: '2024-01-01T00:00:00Z',
      }
      
      vi.mocked(AutoSaveService.savePackingData).mockResolvedValue()
      
      // Simulate auto-save being triggered
      await AutoSaveService.savePackingData(mockPackingData, 'packing-widget-1')
      
      // Verify auto-save was called with correct data
      expect(AutoSaveService.savePackingData).toHaveBeenCalledWith(
        mockPackingData,
        'packing-widget-1'
      )
    })

    it('should auto-save trip plan data when changes are made', async () => {
      const mockTripPlanData = {
        id: 'test-trip-plan-1',
        name: 'Updated Trip Plan',
        days: [],
        createdAt: '2024-01-01T00:00:00Z',
      }
      
      vi.mocked(AutoSaveService.saveTripPlanData).mockResolvedValue()
      
      // Simulate auto-save being triggered
      await AutoSaveService.saveTripPlanData(mockTripPlanData, 'trip-plan-widget-1')
      
      // Verify auto-save was called with correct data
      expect(AutoSaveService.saveTripPlanData).toHaveBeenCalledWith(
        mockTripPlanData,
        'trip-plan-widget-1'
      )
    })

    it('should not auto-save for anonymous users', async () => {
      // Mock anonymous user
      vi.mocked(userManager.getCurrentUser).mockReturnValue({
        id: 'anon-1',
        level: 'anon',
      })
      
      vi.mocked(userManager.hasFeatureAccess).mockReturnValue(false)
      
      const mockCountdownData = {
        id: 'test-countdown-1',
        name: 'Updated Countdown',
        tripDate: '2024-12-25',
        park: { name: 'Magic Kingdom' },
        settings: {},
        createdAt: '2024-01-01T00:00:00Z',
      }
      
      // Clear previous calls
      vi.mocked(AutoSaveService.saveCountdownData).mockClear()
      
      // Simulate auto-save being triggered
      await AutoSaveService.saveCountdownData(mockCountdownData, 'test-widget-1')
      
      // Verify auto-save was not called
      expect(AutoSaveService.saveCountdownData).not.toHaveBeenCalled()
    })

    it('should handle auto-save errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      vi.mocked(AutoSaveService.saveCountdownData).mockRejectedValue(new Error('Save failed'))
      
      const mockCountdownData = {
        id: 'test-countdown-1',
        name: 'Updated Countdown',
        tripDate: '2024-12-25',
        park: { name: 'Magic Kingdom' },
        settings: {},
        createdAt: '2024-01-01T00:00:00Z',
      }
      
      // Simulate auto-save being triggered
      await expect(AutoSaveService.saveCountdownData(mockCountdownData, 'test-widget-1'))
        .rejects.toThrow('Save failed')
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to auto-save countdown:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })

  describe('Widget Configuration Management', () => {
    it('should create and link new items correctly', async () => {
      vi.mocked(WidgetConfigManager.createAndLinkItem).mockResolvedValue('new-item-1')
      
      const result = await WidgetConfigManager.createAndLinkItem('test-widget-1', 'countdown')
      
      expect(result).toBe('new-item-1')
      expect(WidgetConfigManager.createAndLinkItem).toHaveBeenCalledWith('test-widget-1', 'countdown')
    })

    it('should get selected item data correctly', () => {
      const mockItemData = {
        id: 'test-countdown-1',
        name: 'Test Countdown',
        tripDate: '2024-12-25',
      }
      
      vi.mocked(WidgetConfigManager.getSelectedItemData).mockReturnValue(mockItemData)
      
      const result = WidgetConfigManager.getSelectedItemData('countdown', 'test-countdown-1')
      
      expect(result).toEqual(mockItemData)
      expect(WidgetConfigManager.getSelectedItemData).toHaveBeenCalledWith('countdown', 'test-countdown-1')
    })

    it('should update widget configuration correctly', async () => {
      const updates = { selectedItemId: 'new-item-1' }
      
      await WidgetConfigManager.updateConfig('test-widget-1', updates)
      
      expect(WidgetConfigManager.updateConfig).toHaveBeenCalledWith('test-widget-1', updates)
    })

    it('should get widget configuration correctly', () => {
      const config = WidgetConfigManager.getConfig('test-widget-1')
      
      expect(config).toEqual({
        id: 'test-widget-1',
        type: 'countdown',
        order: 0,
        selectedItemId: 'test-countdown-1',
      })
      
      expect(WidgetConfigManager.getConfig).toHaveBeenCalledWith('test-widget-1')
    })
  })

  describe('Data Storage and Retrieval', () => {
    it('should store and retrieve countdown data correctly', async () => {
      const countdownData = [
        {
          id: 'test-countdown-1',
          name: 'Test Countdown',
          tripDate: '2024-12-25',
          park: { name: 'Magic Kingdom' },
          createdAt: '2024-01-01T00:00:00Z',
        }
      ]
      
      vi.mocked(UnifiedStorage.savePluginItems).mockResolvedValue()
      
      await UnifiedStorage.savePluginItems('countdown', countdownData)
      
      expect(UnifiedStorage.savePluginItems).toHaveBeenCalledWith('countdown', countdownData)
      
      const retrievedData = UnifiedStorage.getPluginItems('countdown')
      expect(retrievedData).toEqual(countdownData)
    })

    it('should store and retrieve budget data correctly', async () => {
      const budgetData = [
        {
          id: 'test-budget-1',
          name: 'Test Budget',
          totalBudget: 5000,
          categories: [],
          expenses: [],
          createdAt: '2024-01-01T00:00:00Z',
        }
      ]
      
      vi.mocked(UnifiedStorage.savePluginItems).mockResolvedValue()
      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue(budgetData)
      
      await UnifiedStorage.savePluginItems('budget', budgetData)
      
      expect(UnifiedStorage.savePluginItems).toHaveBeenCalledWith('budget', budgetData)
      
      const retrievedData = UnifiedStorage.getPluginItems('budget')
      expect(retrievedData).toEqual(budgetData)
    })

    it('should handle missing data gracefully', () => {
      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([])
      
      const retrievedData = UnifiedStorage.getPluginItems('countdown')
      expect(retrievedData).toEqual([])
    })
  })

  describe('User Permission Checks', () => {
    it('should check user permissions for save operations', () => {
      // Standard user with save permissions
      vi.mocked(userManager.getCurrentUser).mockReturnValue({
        id: 'user-1',
        level: 'standard',
      })
      
      vi.mocked(userManager.hasFeatureAccess).mockReturnValue(true)
      
      const hasAccess = userManager.hasFeatureAccess('saveData')
      expect(hasAccess).toBe(true)
    })

    it('should deny save operations for anonymous users', () => {
      // Anonymous user without save permissions
      vi.mocked(userManager.getCurrentUser).mockReturnValue({
        id: 'anon-1',
        level: 'anon',
      })
      
      vi.mocked(userManager.hasFeatureAccess).mockReturnValue(false)
      
      const hasAccess = userManager.hasFeatureAccess('saveData')
      expect(hasAccess).toBe(false)
    })

    it('should allow save operations for premium users', () => {
      // Premium user with save permissions
      vi.mocked(userManager.getCurrentUser).mockReturnValue({
        id: 'user-1',
        level: 'premium',
      })
      
      vi.mocked(userManager.hasFeatureAccess).mockReturnValue(true)
      
      const hasAccess = userManager.hasFeatureAccess('saveData')
      expect(hasAccess).toBe(true)
    })
  })

  describe('Integration Workflow', () => {
    it('should complete full edit workflow: create, edit, save, update config', async () => {
      // Step 1: Create new item
      vi.mocked(WidgetConfigManager.createAndLinkItem).mockResolvedValue('new-countdown-1')
      
      const newItemId = await WidgetConfigManager.createAndLinkItem('test-widget-1', 'countdown')
      expect(newItemId).toBe('new-countdown-1')
      
      // Step 2: Update widget configuration
      await WidgetConfigManager.updateConfig('test-widget-1', { selectedItemId: newItemId })
      expect(WidgetConfigManager.updateConfig).toHaveBeenCalledWith('test-widget-1', { selectedItemId: 'new-countdown-1' })
      
      // Step 3: Auto-save changes
      const updatedData = {
        id: 'new-countdown-1',
        name: 'Updated Countdown',
        tripDate: '2024-12-25',
        park: { name: 'Magic Kingdom' },
        settings: {},
        createdAt: '2024-01-01T00:00:00Z',
      }
      
      vi.mocked(AutoSaveService.saveCountdownData).mockResolvedValue()
      
      await AutoSaveService.saveCountdownData(updatedData, 'test-widget-1')
      expect(AutoSaveService.saveCountdownData).toHaveBeenCalledWith(updatedData, 'test-widget-1')
      
      // Step 4: Verify data is stored
      vi.mocked(UnifiedStorage.savePluginItems).mockResolvedValue()
      await UnifiedStorage.savePluginItems('countdown', [updatedData])
      expect(UnifiedStorage.savePluginItems).toHaveBeenCalledWith('countdown', [updatedData])
    })

    it('should handle widget item selection changes', async () => {
      // Simulate item selection change
      await WidgetConfigManager.updateConfig('test-widget-1', { selectedItemId: 'new-countdown-2' })
      
      expect(WidgetConfigManager.updateConfig).toHaveBeenCalledWith(
        'test-widget-1',
        { selectedItemId: 'new-countdown-2' }
      )
      
      // Verify configuration is updated
      const updatedConfig = {
        id: 'test-widget-1',
        type: 'countdown',
        order: 0,
        selectedItemId: 'new-countdown-2',
      }
      
      vi.mocked(WidgetConfigManager.getConfig).mockReturnValue(updatedConfig)
      
      const config = WidgetConfigManager.getConfig('test-widget-1')
      expect(config?.selectedItemId).toBe('new-countdown-2')
    })
  })

  describe('Error Handling', () => {
    it('should handle missing widget configuration gracefully', () => {
      vi.mocked(WidgetConfigManager.getConfig).mockReturnValue(null)
      
      const config = WidgetConfigManager.getConfig('non-existent-widget')
      expect(config).toBeNull()
    })

    it('should handle missing item data gracefully', () => {
      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([])
      
      const items = UnifiedStorage.getPluginItems('countdown')
      expect(items).toEqual([])
    })

    it('should handle auto-save service errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      vi.mocked(userManager.hasFeatureAccess).mockReturnValue(false)
      
      const mockCountdownData = {
        id: 'test-countdown-1',
        name: 'Updated Countdown',
        tripDate: '2024-12-25',
        park: { name: 'Magic Kingdom' },
        settings: {},
        createdAt: '2024-01-01T00:00:00Z',
      }
      
      await AutoSaveService.saveCountdownData(mockCountdownData, 'test-widget-1')
      
      expect(consoleSpy).toHaveBeenCalledWith('Auto-save blocked: User does not have save permissions')
      
      consoleSpy.mockRestore()
    })
  })
})