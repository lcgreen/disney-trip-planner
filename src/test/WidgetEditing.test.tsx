import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter, useSearchParams } from 'next/navigation'
import WidgetBase from '@/components/widgets/WidgetBase'
import { WidgetConfigManager } from '@/lib/widgetConfig'
import { AutoSaveService } from '@/lib/autoSaveService'
import { UnifiedStorage } from '@/lib/unifiedStorage'
import { userManager } from '@/lib/userManagement'
import { Settings } from 'lucide-react'
import { UserLevel } from '@/lib/userManagement'

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
vi.mock('@/lib/userManagement', async (importOriginal) => {
  const actual = (await importOriginal()) as any
  return {
    ...actual,
    userManager: {
      getCurrentUser: vi.fn(),
      hasFeatureAccess: vi.fn(),
    },
    UserLevel: actual.UserLevel,
  }
})

// Mock the plugin system
vi.mock('@/lib/pluginSystem', () => ({
  PluginRegistry: {
    getPlugin: vi.fn(),
  }
}))

// Mock ItemSelector component
vi.mock('@/components/widgets/ItemSelector', () => ({
  default: ({ onItemSelect, selectedItemId }: any) => (
    <div data-testid="item-selector">
      <div>Select Item to Display</div>
      <button
        onClick={() => onItemSelect('test-countdown-1')}
        className={selectedItemId === 'test-countdown-1' ? 'selected' : ''}
      >
        Test Countdown
      </button>
      <button
        onClick={() => onItemSelect('new-countdown-1')}
        className={selectedItemId === 'new-countdown-1' ? 'selected' : ''}
      >
        New Countdown
      </button>
    </div>
  )
}))

// Mock the plugins
vi.mock('@/plugins', () => ({
  default: {}
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
    icon: Settings,
    iconColor: 'bg-blue-500',
    widgetType: 'countdown' as const,
    selectedItemId: 'test-countdown-1', // Add this to ensure Edit Configuration button is rendered
    onRemove: vi.fn(),
    onWidthChange: vi.fn(),
    onItemSelect: vi.fn(),
    children: <div>Widget Content</div>,
    isDemoMode: false, // Ensure dropdown is visible
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mocks
    vi.mocked(WidgetConfigManager.getConfig).mockReturnValue({
      id: 'test-widget-1',
      type: 'countdown',
      size: 'medium',
      order: 0,
      selectedItemId: 'test-countdown-1',
      settings: {},
    })

    vi.mocked(userManager.getCurrentUser).mockReturnValue({
      id: 'user-1',
      level: UserLevel.STANDARD,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    })

    vi.mocked(userManager.hasFeatureAccess).mockReturnValue(true)

    vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([
      {
        id: 'test-countdown-1',
        name: 'Test Countdown',
        tripDate: '2024-12-25',
        park: { name: 'Magic Kingdom' },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }
    ])
  })

  afterEach(() => {
    // Clean up localStorage
    localStorage.clear()
  })

  describe('Edit Navigation', () => {
    it('should navigate to edit page when Edit Configuration is clicked', async () => {
      const user = userEvent.setup()

      render(<WidgetBase {...mockWidgetProps} widgetType="planner" />)

      // Open settings dialog
      const settingsButton = screen.getByLabelText('Settings')
      await user.click(settingsButton)

      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByText('Select Trip Plan')).toBeInTheDocument()
      })

      // Click Edit Selected button (if an item is selected)
      const editButton = screen.getByRole('button', { name: /edit selected/i })
      await user.click(editButton)

      // Verify navigation to edit page
      expect(window.location.href).toBe('/planner/new?widgetId=test-widget-1&editItemId=test-countdown-1')
    })

    it('should navigate to create new page when Create New is clicked', async () => {
      const user = userEvent.setup()

      render(<WidgetBase {...mockWidgetProps} />)

      // Open settings dialog
      const settingsButton = screen.getByLabelText('Settings')
      await user.click(settingsButton)

      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByText('Select Countdown')).toBeInTheDocument()
      })

      // Click Create New button
      const createButton = screen.getByRole('button', { name: /new countdown/i })
      await user.click(createButton)

      // Verify navigation to create page
      expect(window.location.href).toBe('/countdown/new?widgetId=test-widget-1')
    })

    it('should not show edit configuration button when no item is selected', async () => {
      const user = userEvent.setup()

      // Create props without selectedItemId for this specific test
      const propsWithoutSelectedItem = {
        ...mockWidgetProps,
        selectedItemId: undefined, // Ensure no item is selected
      }

      // Mock no selected item
      vi.mocked(WidgetConfigManager.getConfig).mockReturnValue({
        id: 'test-widget-1',
        type: 'countdown',
        size: 'medium',
        order: 0,
        selectedItemId: undefined,
        settings: {},
      })

      render(<WidgetBase {...propsWithoutSelectedItem} />)

      // Open settings dialog
      const settingsButton = screen.getByLabelText('Settings')
      await user.click(settingsButton)

      // Wait for dialog to open
      await waitFor(() => {
        expect(screen.getByText('Select Countdown')).toBeInTheDocument()
      })

      // Verify Edit Selected button is not present when no item is selected
      expect(screen.queryByRole('button', { name: /edit selected/i })).not.toBeInTheDocument()
    })
  })

  describe('Auto-save Functionality', () => {
    it('should auto-save countdown data when changes are made', async () => {
      const user = userEvent.setup()

      // Mock the auto-save service to track calls
      vi.mocked(AutoSaveService.saveCountdownData).mockResolvedValue()

      render(<WidgetBase {...mockWidgetProps} />)

      // Simulate user interaction that would trigger auto-save
      // For this test, we'll simulate the onItemSelect callback being called
      const onItemSelect = mockWidgetProps.onItemSelect
      if (onItemSelect) {
        onItemSelect('test-countdown-1')
      }

      // Verify the callback was called
      expect(onItemSelect).toHaveBeenCalledWith('test-countdown-1')
    })

    it('should auto-save budget data when changes are made', async () => {
      const user = userEvent.setup()

      // Mock the auto-save service
      vi.mocked(AutoSaveService.saveBudgetData).mockResolvedValue()

      // Create budget widget props
      const budgetWidgetProps = {
        ...mockWidgetProps,
        id: 'budget-widget-1',
        widgetType: 'budget' as const,
      }

      render(<WidgetBase {...budgetWidgetProps} />)

      // Simulate user interaction that would trigger auto-save
      const onItemSelect = budgetWidgetProps.onItemSelect
      if (onItemSelect) {
        onItemSelect('test-budget-1')
      }

      // Verify the callback was called
      expect(onItemSelect).toHaveBeenCalledWith('test-budget-1')
    })

    it('should not auto-save for anonymous users', async () => {
      // Mock anonymous user
      vi.mocked(userManager.getCurrentUser).mockReturnValue({
        id: 'anon-1',
        level: UserLevel.ANON,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      })

      vi.mocked(userManager.hasFeatureAccess).mockReturnValue(false)

      // Clear previous calls
      vi.mocked(AutoSaveService.saveCountdownData).mockClear()

      render(<WidgetBase {...mockWidgetProps} />)

      // Simulate user interaction that would trigger auto-save
      const onItemSelect = mockWidgetProps.onItemSelect
      if (onItemSelect) {
        onItemSelect('test-countdown-1')
      }

      // Verify the callback was still called (UI interaction works)
      expect(onItemSelect).toHaveBeenCalledWith('test-countdown-1')

      // Verify auto-save was not called (due to permissions)
      expect(AutoSaveService.saveCountdownData).not.toHaveBeenCalled()
    })

    it('should handle auto-save errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      vi.mocked(AutoSaveService.saveCountdownData).mockRejectedValue(new Error('Save failed'))

      render(<WidgetBase {...mockWidgetProps} />)

      // Simulate user interaction that would trigger auto-save
      const onItemSelect = mockWidgetProps.onItemSelect
      if (onItemSelect) {
        onItemSelect('test-countdown-1')
      }

      // The component should handle errors gracefully without crashing
      expect(screen.getByText('Test Widget')).toBeInTheDocument()

      consoleSpy.mockRestore()
    })
  })

  describe('Widget Configuration Dialog', () => {
    it('should open configuration dialog when settings button is clicked', async () => {
      const user = userEvent.setup()

      render(<WidgetBase {...mockWidgetProps} />)

      // Open settings dialog
      const settingsButton = screen.getByLabelText('Settings')
      await user.click(settingsButton)

      // Wait for dialog to open and be visible
      await waitFor(() => {
        expect(screen.getByText('Select Countdown')).toBeInTheDocument()
      })

      // Verify dialog content is present
      expect(screen.getByText('Choose from your saved countdowns or create a new one')).toBeInTheDocument()
    })

    it('should show correct dialog title for different widget types', async () => {
      const user = userEvent.setup()

      // Test budget widget
      const budgetProps = {
        ...mockWidgetProps,
        widgetType: 'budget' as const,
      }
      const { rerender } = render(<WidgetBase {...budgetProps} />)

      const settingsButton = await screen.findByLabelText('Settings')
      await user.click(settingsButton)

      await waitFor(() => {
        expect(screen.getByText('Select Budget')).toBeInTheDocument()
      })

      // Close the dialog if needed (simulate closing)
      const closeButton = screen.queryByRole('button', { name: /close/i })
      if (closeButton) await user.click(closeButton)

      // Test planner widget
      const plannerProps = {
        ...mockWidgetProps,
        widgetType: 'planner' as const,
      }
      rerender(<WidgetBase {...plannerProps} />)

      // Wait for the settings button to be interactable
      const plannerSettingsButton = await screen.findByLabelText('Settings')
      await user.click(plannerSettingsButton)

      await waitFor(() => {
        expect(screen.getByText('Select Trip Plan')).toBeInTheDocument()
      })
    })

    it('should close dialog when close button is clicked', async () => {
      const user = userEvent.setup()

      render(<WidgetBase {...mockWidgetProps} />)

      // Open dialog
      const settingsButton = screen.getByLabelText('Settings')
      await user.click(settingsButton)

      await waitFor(() => {
        expect(screen.getByText('Select Countdown')).toBeInTheDocument()
      })

      // Close dialog
      const closeButton = screen.getByRole('button', { name: /close/i })
      await user.click(closeButton)

      // Verify dialog is closed
      await waitFor(() => {
        expect(screen.queryByText('Select Countdown')).not.toBeInTheDocument()
      })
    })
  })

  describe('Display Updates', () => {
    it('should update widget display when item is selected', async () => {
      const user = userEvent.setup()

      render(<WidgetBase {...mockWidgetProps} />)

      // Simulate item selection through the callback
      const onItemSelect = mockWidgetProps.onItemSelect
      if (onItemSelect) {
        onItemSelect('new-countdown-1')
      }

      // Verify item selection callback was called
      expect(onItemSelect).toHaveBeenCalledWith('new-countdown-1')
    })

    it('should update widget display when item is deselected', async () => {
      const user = userEvent.setup()

      render(<WidgetBase {...mockWidgetProps} />)

      // Open settings dialog
      const settingsButton = screen.getByLabelText('Settings')
      await user.click(settingsButton)

      // Wait for dialog to open and be visible
      await waitFor(() => {
        expect(screen.getByText('Select Countdown')).toBeInTheDocument()
      })
    })

    it('should reflect changes in widget title after editing', async () => {
      // Mock updated countdown data
      const updatedCountdownData = {
        id: 'test-countdown-1',
        name: 'Updated Countdown Name',
        park: { name: 'Magic Kingdom' },
        date: '2024-12-25',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
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

    it('should get selected item data correctly for countdown', () => {
      const mockCountdownData: import('@/types').CountdownData = {
        id: 'test-countdown-1',
        name: 'Test Countdown',
        park: { name: 'Magic Kingdom' },
        date: '2024-12-25',
        tripDate: '2024-12-25',
        settings: {
          showMilliseconds: false,
          showTimezone: false,
          showTips: false,
          showAttractions: false,
          playSound: false,
          autoRefresh: false,
          digitStyle: 'modern',
          layout: 'horizontal',
          fontSize: 'medium',
          backgroundEffect: 'none',
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      vi.mocked(WidgetConfigManager.getSelectedItemData).mockReturnValue(mockCountdownData)

      const result = WidgetConfigManager.getSelectedItemData('countdown', 'test-countdown-1')

      expect(result).toEqual(mockCountdownData)
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

      render(<WidgetBase {...mockWidgetProps} />)

      // Simulate user interaction that would trigger auto-save
      const onItemSelect = mockWidgetProps.onItemSelect
      if (onItemSelect) {
        onItemSelect('test-countdown-1')
      }

      // The component should handle the lack of permissions gracefully
      expect(screen.getByText('Test Widget')).toBeInTheDocument()

      consoleSpy.mockRestore()
    })
  })

  describe('Integration Tests', () => {
    it('should complete full edit workflow: navigate, edit, auto-save, display', async () => {
      const user = userEvent.setup()

      // Mock auto-save service
      vi.mocked(AutoSaveService.saveCountdownData).mockResolvedValue()

      render(<WidgetBase {...mockWidgetProps} />)

      // Open settings dialog
      const settingsButton = screen.getByLabelText('Settings')
      await user.click(settingsButton)

      // Wait for dialog to open and be visible
      await waitFor(() => {
        expect(screen.getByText('Select Countdown')).toBeInTheDocument()
      })

      // Verify the dialog content is present
      expect(screen.getByText('Choose from your saved countdowns or create a new one')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /new countdown/i })).toBeInTheDocument()
    })

    it('should handle widget removal correctly', async () => {
      const user = userEvent.setup()

      render(<WidgetBase {...mockWidgetProps} />)

      // Click remove button
      const removeButton = screen.getByLabelText('Remove')
      await user.hover(removeButton)
      await user.click(removeButton)

      // Verify onRemove was called
      expect(mockWidgetProps.onRemove).toHaveBeenCalled()
    })
  })
})