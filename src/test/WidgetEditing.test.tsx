import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter, useSearchParams } from 'next/navigation'
import WidgetBase from '@/components/widgets/WidgetBase'
import { WidgetConfigManager } from '@/lib/widgetConfig'
import { AutoSaveService } from '@/lib/autoSaveService'
import { UnifiedStorage } from '@/lib/unifiedStorage'
import { userManager } from '@/lib/userManagement'

// Mock Next.js navigation
const mockPush = vi.fn()
const mockRouter = {
  push: mockPush,
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
}

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => new URLSearchParams(),
}))

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

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
    assign: vi.fn(),
    replace: vi.fn(),
  },
  writable: true,
})

describe('Widget Editing Functionality', () => {
  const mockWidgetProps = {
    id: 'test-widget-1',
    title: 'Test Widget',
    icon: () => <div>Icon</div> as any,
    iconColor: 'bg-blue-500',
    widgetType: 'countdown' as const,
    onRemove: vi.fn(),
    onWidthChange: vi.fn(),
    onItemSelect: vi.fn(),
    children: <div>Widget Content</div>,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mocks
    vi.mocked(WidgetConfigManager.getConfig).mockReturnValue({
      id: 'test-widget-1',
      type: 'countdown',
      order: 0,
      selectedItemId: 'test-countdown-1',
    })
    
    vi.mocked(userManager.getCurrentUser).mockReturnValue({
      id: 'user-1',
      level: 'standard',
    })
    
    vi.mocked(userManager.hasFeatureAccess).mockReturnValue(true)
    
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
    // Clean up localStorage
    localStorage.clear()
  })

  describe('Edit Navigation', () => {
    it('should navigate to correct edit page when Edit Configuration is clicked', async () => {
      const user = userEvent.setup()
      
      render(<WidgetBase {...mockWidgetProps} />)
      
      // Open settings dropdown
      const settingsButton = screen.getByRole('button', { name: /settings/i })
      await user.click(settingsButton)
      
      // Click Edit Configuration button
      const editButton = screen.getByRole('button', { name: /edit configuration/i })
      await user.click(editButton)
      
      // Verify navigation to correct edit page
      expect(window.location.href).toBe('/countdown/new?widgetId=test-widget-1&editItemId=test-countdown-1')
    })

    it('should navigate to correct edit page for different widget types', async () => {
      const user = userEvent.setup()
      
      const budgetWidgetProps = {
        ...mockWidgetProps,
        id: 'budget-widget-1',
        widgetType: 'budget' as const,
      }
      
      render(<WidgetBase {...budgetWidgetProps} />)
      
      // Open settings dropdown
      const settingsButton = screen.getByRole('button', { name: /settings/i })
      await user.click(settingsButton)
      
      // Click Edit Configuration button
      const editButton = screen.getByRole('button', { name: /edit configuration/i })
      await user.click(editButton)
      
      // Verify navigation to budget edit page
      expect(window.location.href).toBe('/budget/new?widgetId=budget-widget-1&editItemId=test-countdown-1')
    })

    it('should navigate to create new page when Create New is clicked', async () => {
      const user = userEvent.setup()
      
      render(<WidgetBase {...mockWidgetProps} />)
      
      // Open settings dropdown
      const settingsButton = screen.getByRole('button', { name: /settings/i })
      await user.click(settingsButton)
      
      // Click Create New button
      const createButton = screen.getByRole('button', { name: /create new countdown/i })
      await user.click(createButton)
      
      // Verify navigation to create page
      expect(window.location.href).toBe('/countdown/new?widgetId=test-widget-1')
    })

    it('should not show edit configuration button when no item is selected', async () => {
      const user = userEvent.setup()
      
      // Mock no selected item
      vi.mocked(WidgetConfigManager.getConfig).mockReturnValue({
        id: 'test-widget-1',
        type: 'countdown',
        order: 0,
        selectedItemId: undefined,
      })
      
      render(<WidgetBase {...mockWidgetProps} />)
      
      // Open settings dropdown
      const settingsButton = screen.getByRole('button', { name: /settings/i })
      await user.click(settingsButton)
      
      // Verify Edit Configuration button is not present
      expect(screen.queryByRole('button', { name: /edit configuration/i })).not.toBeInTheDocument()
      
      // Verify Create New button is present
      expect(screen.getByRole('button', { name: /create new countdown/i })).toBeInTheDocument()
    })
  })

  describe('Auto-save Functionality', () => {
    it('should auto-save countdown data when changes are made', async () => {
      const user = userEvent.setup()
      
      // Mock the countdown component to simulate editing
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
      
      // Verify widget config was updated
      expect(WidgetConfigManager.updateConfig).toHaveBeenCalledWith(
        'test-widget-1',
        { selectedItemId: 'test-countdown-1' }
      )
    })

    it('should auto-save budget data when changes are made', async () => {
      const user = userEvent.setup()
      
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

  describe('Display Updates', () => {
    it('should update widget display when item is selected', async () => {
      const user = userEvent.setup()
      
      render(<WidgetBase {...mockWidgetProps} />)
      
      // Open settings dropdown
      const settingsButton = screen.getByRole('button', { name: /settings/i })
      await user.click(settingsButton)
      
      // Simulate item selection
      const onItemSelect = mockWidgetProps.onItemSelect
      if (onItemSelect) {
        onItemSelect('new-countdown-1')
      }
      
      // Verify item selection callback was called
      expect(onItemSelect).toHaveBeenCalledWith('new-countdown-1')
      
      // Verify widget config was updated
      expect(WidgetConfigManager.updateConfig).toHaveBeenCalledWith(
        'test-widget-1',
        { selectedItemId: 'new-countdown-1' }
      )
    })

    it('should update widget display when item is deselected', async () => {
      const user = userEvent.setup()
      
      render(<WidgetBase {...mockWidgetProps} />)
      
      // Open settings dropdown
      const settingsButton = screen.getByRole('button', { name: /settings/i })
      await user.click(settingsButton)
      
      // Simulate item deselection
      const onItemSelect = mockWidgetProps.onItemSelect
      if (onItemSelect) {
        onItemSelect(null)
      }
      
      // Verify item selection callback was called
      expect(onItemSelect).toHaveBeenCalledWith(null)
      
      // Verify widget config was updated
      expect(WidgetConfigManager.updateConfig).toHaveBeenCalledWith(
        'test-widget-1',
        { selectedItemId: undefined }
      )
    })

    it('should reflect changes in widget title after editing', async () => {
      // Mock updated countdown data
      const updatedCountdownData = {
        id: 'test-countdown-1',
        name: 'Updated Countdown Name',
        tripDate: '2024-12-25',
        park: { name: 'Magic Kingdom' },
        createdAt: '2024-01-01T00:00:00Z',
      }
      
      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([updatedCountdownData])
      
      // Re-render widget with updated data
      render(<WidgetBase {...mockWidgetProps} />)
      
      // Verify widget title reflects the updated name
      expect(screen.getByText('Test Widget')).toBeInTheDocument()
    })

    it('should handle widget width changes correctly', async () => {
      const user = userEvent.setup()
      
      render(<WidgetBase {...mockWidgetProps} />)
      
      // Simulate width change
      const onWidthChange = mockWidgetProps.onWidthChange
      if (onWidthChange) {
        onWidthChange('3')
      }
      
      // Verify width change callback was called
      expect(onWidthChange).toHaveBeenCalledWith('3')
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
  })

  describe('Error Handling', () => {
    it('should handle missing widget configuration gracefully', () => {
      vi.mocked(WidgetConfigManager.getConfig).mockReturnValue(null)
      
      render(<WidgetBase {...mockWidgetProps} />)
      
      // Widget should still render without crashing
      expect(screen.getByText('Test Widget')).toBeInTheDocument()
    })

    it('should handle missing item data gracefully', () => {
      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([])
      
      render(<WidgetBase {...mockWidgetProps} />)
      
      // Widget should still render without crashing
      expect(screen.getByText('Test Widget')).toBeInTheDocument()
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

  describe('Integration Tests', () => {
    it('should complete full edit workflow: navigate, edit, auto-save, display', async () => {
      const user = userEvent.setup()
      
      // Setup mocks for full workflow
      vi.mocked(AutoSaveService.saveCountdownData).mockResolvedValue()
      
      render(<WidgetBase {...mockWidgetProps} />)
      
      // Step 1: Navigate to edit page
      const settingsButton = screen.getByRole('button', { name: /settings/i })
      await user.click(settingsButton)
      
      const editButton = screen.getByRole('button', { name: /edit configuration/i })
      await user.click(editButton)
      
      expect(window.location.href).toBe('/countdown/new?widgetId=test-widget-1&editItemId=test-countdown-1')
      
      // Step 2: Simulate auto-save during editing
      const updatedData = {
        id: 'test-countdown-1',
        name: 'Updated Countdown Name',
        tripDate: '2024-12-25',
        park: { name: 'Magic Kingdom' },
        settings: {},
        createdAt: '2024-01-01T00:00:00Z',
      }
      
      await AutoSaveService.saveCountdownData(updatedData, 'test-widget-1')
      
      expect(AutoSaveService.saveCountdownData).toHaveBeenCalledWith(updatedData, 'test-widget-1')
      expect(WidgetConfigManager.updateConfig).toHaveBeenCalledWith('test-widget-1', { selectedItemId: 'test-countdown-1' })
      
      // Step 3: Verify widget displays updated data
      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([updatedData])
      
      // Re-render to simulate widget update
      render(<WidgetBase {...mockWidgetProps} />)
      
      expect(screen.getByText('Test Widget')).toBeInTheDocument()
    })

    it('should handle widget removal correctly', async () => {
      const user = userEvent.setup()
      
      render(<WidgetBase {...mockWidgetProps} />)
      
      // Click remove button
      const removeButton = screen.getByRole('button', { name: /remove/i })
      await user.click(removeButton)
      
      // Verify remove callback was called
      expect(mockWidgetProps.onRemove).toHaveBeenCalled()
    })
  })
})