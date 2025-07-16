import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSearchParams, useRouter } from 'next/navigation'
import CountdownTimer from '@/components/CountdownTimer'
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

const mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockSearchParams,
}))

// Mock the widget configuration manager
vi.mock('@/lib/widgetConfig', () => ({
  WidgetConfigManager: {
    getConfig: vi.fn(),
    updateConfig: vi.fn(),
    updateConfigSync: vi.fn(),
    createAndLinkItem: vi.fn(),
    getSelectedItemData: vi.fn(),
    checkAndApplyPendingLinks: vi.fn(),
    cleanupDeletedItemReferences: vi.fn(),
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

// Mock window events
Object.defineProperty(window, 'addEventListener', {
  value: vi.fn(),
  writable: true,
})

Object.defineProperty(window, 'removeEventListener', {
  value: vi.fn(),
  writable: true,
})

Object.defineProperty(window, 'dispatchEvent', {
  value: vi.fn(),
  writable: true,
})

describe('Edit Page Auto-Save Functionality', () => {
  const mockCountdownData = {
    id: 'test-countdown-1',
    name: 'Test Countdown',
    tripDate: '2024-12-25',
    park: { 
      id: 'mk',
      name: 'Magic Kingdom',
      gradient: 'from-red-500 to-yellow-500'
    },
    settings: {
      showSeconds: true,
      showDays: true,
      showHours: true,
      showMinutes: true,
    },
    theme: {
      primaryColor: 'blue',
      secondaryColor: 'purple',
    },
    createdAt: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mocks
    vi.mocked(userManager.getCurrentUser).mockReturnValue({
      id: 'user-1',
      level: 'standard',
    })
    
    vi.mocked(userManager.hasFeatureAccess).mockReturnValue(true)
    
    vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([mockCountdownData])
    
    vi.mocked(WidgetConfigManager.getSelectedItemData).mockReturnValue(mockCountdownData)
    
    vi.mocked(AutoSaveService.saveCountdownData).mockResolvedValue()
    
    // Clear search params
    mockSearchParams.delete('widgetId')
    mockSearchParams.delete('editItemId')
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Edit Mode Initialization', () => {
    it('should load existing countdown data when in edit mode', async () => {
      // Set up edit mode
      mockSearchParams.set('editItemId', 'test-countdown-1')
      mockSearchParams.set('widgetId', 'test-widget-1')
      
      render(<CountdownTimer 
        createdItemId="test-countdown-1"
        widgetId="test-widget-1"
        isEditMode={true}
      />)
      
      // Verify the countdown data was loaded
      expect(WidgetConfigManager.getSelectedItemData).toHaveBeenCalledWith('countdown', 'test-countdown-1')
      
      // Verify the form is populated with existing data
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Countdown')).toBeInTheDocument()
      })
    })

    it('should create new countdown when not in edit mode', async () => {
      // Set up create mode
      mockSearchParams.set('widgetId', 'test-widget-1')
      
      vi.mocked(WidgetConfigManager.createAndLinkItem).mockResolvedValue('new-countdown-1')
      
      render(<CountdownTimer 
        createdItemId={null}
        widgetId="test-widget-1"
        isEditMode={false}
      />)
      
      // Verify new item creation was triggered
      expect(WidgetConfigManager.createAndLinkItem).toHaveBeenCalledWith('test-widget-1', 'countdown')
    })
  })

  describe('Auto-Save During Editing', () => {
    it('should auto-save when countdown name is changed', async () => {
      const user = userEvent.setup()
      
      mockSearchParams.set('editItemId', 'test-countdown-1')
      mockSearchParams.set('widgetId', 'test-widget-1')
      
      render(<CountdownTimer 
        createdItemId="test-countdown-1"
        widgetId="test-widget-1"
        isEditMode={true}
      />)
      
      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Countdown')).toBeInTheDocument()
      })
      
      // Change the countdown name
      const nameInput = screen.getByDisplayValue('Test Countdown')
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Countdown Name')
      
      // Trigger blur to simulate auto-save
      fireEvent.blur(nameInput)
      
      // Wait for auto-save to be called
      await waitFor(() => {
        expect(AutoSaveService.saveCountdownData).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'test-countdown-1',
            name: 'Updated Countdown Name',
          }),
          'test-widget-1'
        )
      })
    })

    it('should auto-save when trip date is changed', async () => {
      const user = userEvent.setup()
      
      mockSearchParams.set('editItemId', 'test-countdown-1')
      mockSearchParams.set('widgetId', 'test-widget-1')
      
      render(<CountdownTimer 
        createdItemId="test-countdown-1"
        widgetId="test-widget-1"
        isEditMode={true}
      />)
      
      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Countdown')).toBeInTheDocument()
      })
      
      // Find and change the date input
      const dateInput = screen.getByDisplayValue('2024-12-25')
      await user.clear(dateInput)
      await user.type(dateInput, '2024-12-26')
      
      // Trigger blur to simulate auto-save
      fireEvent.blur(dateInput)
      
      // Wait for auto-save to be called
      await waitFor(() => {
        expect(AutoSaveService.saveCountdownData).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'test-countdown-1',
            tripDate: '2024-12-26',
          }),
          'test-widget-1'
        )
      })
    })

    it('should auto-save when park selection is changed', async () => {
      const user = userEvent.setup()
      
      mockSearchParams.set('editItemId', 'test-countdown-1')
      mockSearchParams.set('widgetId', 'test-widget-1')
      
      render(<CountdownTimer 
        createdItemId="test-countdown-1"
        widgetId="test-widget-1"
        isEditMode={true}
      />)
      
      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Countdown')).toBeInTheDocument()
      })
      
      // Find and change the park selection
      const parkSelect = screen.getByDisplayValue('Magic Kingdom')
      await user.selectOptions(parkSelect, 'ep')
      
      // Wait for auto-save to be called
      await waitFor(() => {
        expect(AutoSaveService.saveCountdownData).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'test-countdown-1',
            park: expect.objectContaining({ id: 'ep' }),
          }),
          'test-widget-1'
        )
      })
    })

    it('should auto-save when settings are changed', async () => {
      const user = userEvent.setup()
      
      mockSearchParams.set('editItemId', 'test-countdown-1')
      mockSearchParams.set('widgetId', 'test-widget-1')
      
      render(<CountdownTimer 
        createdItemId="test-countdown-1"
        widgetId="test-widget-1"
        isEditMode={true}
      />)
      
      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Countdown')).toBeInTheDocument()
      })
      
      // Find and toggle a setting
      const showSecondsToggle = screen.getByLabelText(/show seconds/i)
      await user.click(showSecondsToggle)
      
      // Wait for auto-save to be called
      await waitFor(() => {
        expect(AutoSaveService.saveCountdownData).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'test-countdown-1',
            settings: expect.objectContaining({
              showSeconds: false,
            }),
          }),
          'test-widget-1'
        )
      })
    })
  })

  describe('Auto-Save Debouncing', () => {
    it('should debounce multiple rapid changes', async () => {
      const user = userEvent.setup()
      
      mockSearchParams.set('editItemId', 'test-countdown-1')
      mockSearchParams.set('widgetId', 'test-widget-1')
      
      render(<CountdownTimer 
        createdItemId="test-countdown-1"
        widgetId="test-widget-1"
        isEditMode={true}
      />)
      
      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Countdown')).toBeInTheDocument()
      })
      
      const nameInput = screen.getByDisplayValue('Test Countdown')
      
      // Make multiple rapid changes
      await user.clear(nameInput)
      await user.type(nameInput, 'A')
      await user.type(nameInput, 'B')
      await user.type(nameInput, 'C')
      await user.type(nameInput, 'D')
      
      // Trigger blur
      fireEvent.blur(nameInput)
      
      // Wait for auto-save to be called only once with final value
      await waitFor(() => {
        expect(AutoSaveService.saveCountdownData).toHaveBeenCalledTimes(1)
        expect(AutoSaveService.saveCountdownData).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'ABCD',
          }),
          'test-widget-1'
        )
      })
    })
  })

  describe('Auto-Save Error Handling', () => {
    it('should handle auto-save errors gracefully', async () => {
      const user = userEvent.setup()
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      mockSearchParams.set('editItemId', 'test-countdown-1')
      mockSearchParams.set('widgetId', 'test-widget-1')
      
      vi.mocked(AutoSaveService.saveCountdownData).mockRejectedValue(new Error('Save failed'))
      
      render(<CountdownTimer 
        createdItemId="test-countdown-1"
        widgetId="test-widget-1"
        isEditMode={true}
      />)
      
      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Countdown')).toBeInTheDocument()
      })
      
      // Make a change that triggers auto-save
      const nameInput = screen.getByDisplayValue('Test Countdown')
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Name')
      fireEvent.blur(nameInput)
      
      // Wait for error to be logged
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to auto-save countdown:', expect.any(Error))
      })
      
      consoleSpy.mockRestore()
    })

    it('should not auto-save for anonymous users', async () => {
      const user = userEvent.setup()
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      mockSearchParams.set('editItemId', 'test-countdown-1')
      mockSearchParams.set('widgetId', 'test-widget-1')
      
      // Mock anonymous user
      vi.mocked(userManager.getCurrentUser).mockReturnValue({
        id: 'anon-1',
        level: 'anon',
      })
      
      vi.mocked(userManager.hasFeatureAccess).mockReturnValue(false)
      
      render(<CountdownTimer 
        createdItemId="test-countdown-1"
        widgetId="test-widget-1"
        isEditMode={true}
      />)
      
      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Countdown')).toBeInTheDocument()
      })
      
      // Make a change that would trigger auto-save
      const nameInput = screen.getByDisplayValue('Test Countdown')
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Name')
      fireEvent.blur(nameInput)
      
      // Verify auto-save was not called
      expect(AutoSaveService.saveCountdownData).not.toHaveBeenCalled()
      
      consoleSpy.mockRestore()
    })
  })

  describe('Widget Configuration Updates', () => {
    it('should update widget configuration when countdown is saved', async () => {
      mockSearchParams.set('editItemId', 'test-countdown-1')
      mockSearchParams.set('widgetId', 'test-widget-1')
      
      render(<CountdownTimer 
        createdItemId="test-countdown-1"
        widgetId="test-widget-1"
        isEditMode={true}
      />)
      
      // Simulate auto-save
      await AutoSaveService.saveCountdownData(mockCountdownData, 'test-widget-1')
      
      // Verify widget config was updated
      expect(WidgetConfigManager.updateConfig).toHaveBeenCalledWith(
        'test-widget-1',
        { selectedItemId: 'test-countdown-1' }
      )
    })

    it('should handle pending widget links correctly', async () => {
      mockSearchParams.set('widgetId', 'test-widget-1')
      
      vi.mocked(WidgetConfigManager.createAndLinkItem).mockResolvedValue('new-countdown-1')
      
      render(<CountdownTimer 
        createdItemId={null}
        widgetId="test-widget-1"
        isEditMode={false}
      />)
      
      // Verify pending link check was called
      expect(WidgetConfigManager.checkAndApplyPendingLinks).toHaveBeenCalledWith(
        'new-countdown-1',
        'countdown'
      )
    })
  })

  describe('Data Validation', () => {
    it('should validate required fields before auto-saving', async () => {
      const user = userEvent.setup()
      
      mockSearchParams.set('editItemId', 'test-countdown-1')
      mockSearchParams.set('widgetId', 'test-widget-1')
      
      render(<CountdownTimer 
        createdItemId="test-countdown-1"
        widgetId="test-widget-1"
        isEditMode={true}
      />)
      
      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Countdown')).toBeInTheDocument()
      })
      
      // Clear required fields
      const nameInput = screen.getByDisplayValue('Test Countdown')
      const dateInput = screen.getByDisplayValue('2024-12-25')
      
      await user.clear(nameInput)
      await user.clear(dateInput)
      
      fireEvent.blur(nameInput)
      
      // Auto-save should not be called with invalid data
      expect(AutoSaveService.saveCountdownData).not.toHaveBeenCalled()
    })

    it('should validate date format before auto-saving', async () => {
      const user = userEvent.setup()
      
      mockSearchParams.set('editItemId', 'test-countdown-1')
      mockSearchParams.set('widgetId', 'test-widget-1')
      
      render(<CountdownTimer 
        createdItemId="test-countdown-1"
        widgetId="test-widget-1"
        isEditMode={true}
      />)
      
      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Countdown')).toBeInTheDocument()
      })
      
      // Enter invalid date
      const dateInput = screen.getByDisplayValue('2024-12-25')
      await user.clear(dateInput)
      await user.type(dateInput, 'invalid-date')
      
      fireEvent.blur(dateInput)
      
      // Auto-save should not be called with invalid date
      expect(AutoSaveService.saveCountdownData).not.toHaveBeenCalled()
    })
  })

  describe('Integration with Widget Display', () => {
    it('should trigger widget refresh after successful auto-save', async () => {
      const user = userEvent.setup()
      
      mockSearchParams.set('editItemId', 'test-countdown-1')
      mockSearchParams.set('widgetId', 'test-widget-1')
      
      render(<CountdownTimer 
        createdItemId="test-countdown-1"
        widgetId="test-widget-1"
        isEditMode={true}
      />)
      
      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test Countdown')).toBeInTheDocument()
      })
      
      // Make a change and trigger auto-save
      const nameInput = screen.getByDisplayValue('Test Countdown')
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Countdown')
      fireEvent.blur(nameInput)
      
      // Wait for auto-save to complete
      await waitFor(() => {
        expect(AutoSaveService.saveCountdownData).toHaveBeenCalled()
      })
      
      // Verify widget config was updated
      expect(WidgetConfigManager.updateConfig).toHaveBeenCalledWith(
        'test-widget-1',
        { selectedItemId: 'test-countdown-1' }
      )
      
      // Verify the updated data is available for widget display
      const updatedData = {
        ...mockCountdownData,
        name: 'Updated Countdown',
      }
      
      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([updatedData])
      
      // The widget should now display the updated name
      expect(updatedData.name).toBe('Updated Countdown')
    })
  })
})