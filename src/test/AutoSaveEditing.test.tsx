import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter, useSearchParams } from 'next/navigation'
import { WidgetConfigManager } from '@/lib/widgetConfig'
import { PluginRegistry } from '@/lib/pluginSystem'
import { useUser } from '@/hooks/useUser'
import CountdownTimer from '@/components/CountdownTimer'
import BudgetTracker from '@/components/BudgetTracker'
import TripPlanner from '@/components/TripPlanner'
import PackingChecklist from '@/components/PackingChecklist'
import CountdownWidget from '@/components/widgets/CountdownWidget'
import BudgetWidget from '@/components/widgets/BudgetWidget'
import TripPlannerWidget from '@/components/widgets/TripPlannerWidget'
import PackingWidget from '@/components/widgets/PackingWidget'

// Mock Next.js navigation
const mockPush = vi.fn()
const mockReplace = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/countdown/new',
  useSearchParams: () => new URLSearchParams('?widgetId=test-widget&editItemId=countdown-1'),
}))

// Mock the useUser hook
vi.mock('@/hooks/useUser')
const mockUseUser = vi.mocked(useUser)

// Mock the plugin system
vi.mock('@/lib/pluginSystem', () => ({
  PluginRegistry: {
    getPlugin: vi.fn(),
  },
}))

// Mock window.dispatchEvent
Object.defineProperty(window, 'dispatchEvent', {
  value: vi.fn(),
  writable: true,
})

// Mock the auto-save service
vi.mock('@/lib/autoSaveService', () => ({
  autoSaveService: {
    saveCountdown: vi.fn(),
    saveBudget: vi.fn(),
    savePlanner: vi.fn(),
    savePacking: vi.fn(),
  },
}))

describe('Auto-Save Editing Functionality', () => {
  const mockProps = {
    id: 'test-widget',
    onRemove: vi.fn(),
    onSettings: vi.fn(),
    onWidthChange: vi.fn(),
    onItemSelect: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default user mock (premium user)
    mockUseUser.mockReturnValue({
      userLevel: 'premium',
      isPremium: true,
      isStandard: true,
      hasFeatureAccess: vi.fn().mockReturnValue(true),
      user: { id: '1', level: 'premium' } as any,
      isLoading: false,
      isLoggedIn: true,
      availableFeatures: [],
      upgradeFeatures: [],
      dataLimits: { items: -1, storage: 'unlimited' },
      createAnonUser: vi.fn(),
      upgradeToStandard: vi.fn(),
      upgradeToPremium: vi.fn(),
      upgradeToAdmin: vi.fn(),
      logout: vi.fn(),
      ensureUser: vi.fn(),
    })

    // Clear widget configs before each test
    WidgetConfigManager.removeConfigSync('test-widget')
    
    // Mock plugin data
    const mockPlugin = {
      getItem: vi.fn(),
      getWidgetData: vi.fn(),
      saveItem: vi.fn(),
    }
    vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockPlugin)
  })

  afterEach(() => {
    // Clean up after each test
    WidgetConfigManager.removeConfigSync('test-widget')
  })

  describe('1. Countdown Auto-Save', () => {
    it('should auto-save countdown changes and update widget display', async () => {
      const user = userEvent.setup()
      
      const mockCountdownData = {
        id: 'countdown-1',
        name: 'Original Disney Trip',
        tripDate: '2024-12-25',
        park: { name: 'Magic Kingdom', gradient: 'from-red-500 to-blue-500' }
      }

      const mockCountdownPlugin = {
        getItem: vi.fn().mockReturnValue(mockCountdownData),
        getWidgetData: vi.fn(),
        saveItem: vi.fn().mockImplementation((id, data) => {
          // Simulate saving the updated data
          mockCountdownData.name = data.name
          mockCountdownData.tripDate = data.tripDate
          mockCountdownData.park = data.park
        }),
      }
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockCountdownPlugin)

      // Setup widget configuration
      WidgetConfigManager.addConfigSync({
        id: 'test-widget',
        type: 'countdown',
        order: 0,
        selectedItemId: 'countdown-1',
      })

      // Render the countdown edit component
      render(
        <CountdownTimer
          createdItemId="countdown-1"
          widgetId="test-widget"
          isEditMode={true}
        />
      )

      // Find and update the countdown name
      const nameInput = screen.getByLabelText(/countdown name/i) || screen.getByPlaceholderText(/enter countdown name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Disney Adventure')

      // Find and update the trip date
      const dateInput = screen.getByLabelText(/trip date/i) || screen.getByDisplayValue('2024-12-25')
      await user.clear(dateInput)
      await user.type(dateInput, '2024-12-26')

      // Trigger auto-save by blurring the input
      await user.tab()

      // Wait for auto-save to complete
      await waitFor(() => {
        expect(mockCountdownPlugin.saveItem).toHaveBeenCalledWith('countdown-1', expect.objectContaining({
          name: 'Updated Disney Adventure',
          tripDate: '2024-12-26',
        }))
      })

      // Now render the widget to verify it displays the updated data
      render(<CountdownWidget {...mockProps} />)

      // Wait for the widget to display the updated data
      await waitFor(() => {
        expect(screen.getByText('Updated Disney Adventure')).toBeInTheDocument()
      })

      expect(screen.getByText('12/26/2024')).toBeInTheDocument()
    })

    it('should auto-save park selection changes', async () => {
      const user = userEvent.setup()
      
      const mockCountdownData = {
        id: 'countdown-1',
        name: 'Disney Trip',
        tripDate: '2024-12-25',
        park: { name: 'Magic Kingdom', gradient: 'from-red-500 to-blue-500' }
      }

      const mockCountdownPlugin = {
        getItem: vi.fn().mockReturnValue(mockCountdownData),
        getWidgetData: vi.fn(),
        saveItem: vi.fn().mockImplementation((id, data) => {
          mockCountdownData.park = data.park
        }),
      }
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockCountdownPlugin)

      WidgetConfigManager.addConfigSync({
        id: 'test-widget',
        type: 'countdown',
        order: 0,
        selectedItemId: 'countdown-1',
      })

      render(
        <CountdownTimer
          createdItemId="countdown-1"
          widgetId="test-widget"
          isEditMode={true}
        />
      )

      // Find and select a different park
      const parkSelect = screen.getByLabelText(/select park/i) || screen.getByRole('combobox')
      await user.selectOptions(parkSelect, 'epcot')

      // Trigger auto-save
      await user.tab()

      await waitFor(() => {
        expect(mockCountdownPlugin.saveItem).toHaveBeenCalledWith('countdown-1', expect.objectContaining({
          park: expect.objectContaining({ name: 'Epcot' }),
        }))
      })

      // Verify widget displays updated park
      render(<CountdownWidget {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('Epcot')).toBeInTheDocument()
      })
    })
  })

  describe('2. Budget Auto-Save', () => {
    it('should auto-save budget changes and update widget display', async () => {
      const user = userEvent.setup()
      
      const mockBudgetData = {
        id: 'budget-1',
        name: 'Original Budget',
        total: 5000,
        categories: { 'Tickets': 2000, 'Food': 1500, 'Souvenirs': 1500 },
        expenses: []
      }

      const mockBudgetPlugin = {
        getItem: vi.fn().mockReturnValue(mockBudgetData),
        getWidgetData: vi.fn(),
        saveItem: vi.fn().mockImplementation((id, data) => {
          mockBudgetData.name = data.name
          mockBudgetData.total = data.total
          mockBudgetData.categories = data.categories
        }),
      }
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockBudgetPlugin)

      WidgetConfigManager.addConfigSync({
        id: 'test-widget',
        type: 'budget',
        order: 0,
        selectedItemId: 'budget-1',
      })

      render(
        <BudgetTracker
          createdItemId="budget-1"
          widgetId="test-widget"
          isEditMode={true}
        />
      )

      // Update budget name
      const nameInput = screen.getByLabelText(/budget name/i) || screen.getByPlaceholderText(/enter budget name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Disney Budget')

      // Update total budget
      const totalInput = screen.getByLabelText(/total budget/i) || screen.getByDisplayValue('5000')
      await user.clear(totalInput)
      await user.type(totalInput, '7500')

      // Trigger auto-save
      await user.tab()

      await waitFor(() => {
        expect(mockBudgetPlugin.saveItem).toHaveBeenCalledWith('budget-1', expect.objectContaining({
          name: 'Updated Disney Budget',
          total: 7500,
        }))
      })

      // Verify widget displays updated data
      render(<BudgetWidget {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('Updated Disney Budget')).toBeInTheDocument()
      })

      expect(screen.getByText('$7,500')).toBeInTheDocument()
    })

    it('should auto-save expense additions', async () => {
      const user = userEvent.setup()
      
      const mockBudgetData = {
        id: 'budget-1',
        name: 'Disney Budget',
        total: 5000,
        categories: { 'Tickets': 2000, 'Food': 1500, 'Souvenirs': 1500 },
        expenses: []
      }

      const mockBudgetPlugin = {
        getItem: vi.fn().mockReturnValue(mockBudgetData),
        getWidgetData: vi.fn(),
        saveItem: vi.fn().mockImplementation((id, data) => {
          mockBudgetData.expenses = data.expenses
        }),
      }
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockBudgetPlugin)

      WidgetConfigManager.addConfigSync({
        id: 'test-widget',
        type: 'budget',
        order: 0,
        selectedItemId: 'budget-1',
      })

      render(
        <BudgetTracker
          createdItemId="budget-1"
          widgetId="test-widget"
          isEditMode={true}
        />
      )

      // Add a new expense
      const addExpenseButton = screen.getByRole('button', { name: /add expense/i })
      await user.click(addExpenseButton)

      // Fill in expense details
      const descriptionInput = screen.getByLabelText(/description/i) || screen.getByPlaceholderText(/expense description/i)
      await user.type(descriptionInput, 'Mickey Ears')

      const amountInput = screen.getByLabelText(/amount/i) || screen.getByPlaceholderText(/amount/i)
      await user.type(amountInput, '25')

      const categorySelect = screen.getByLabelText(/category/i) || screen.getByRole('combobox')
      await user.selectOptions(categorySelect, 'Souvenirs')

      // Save the expense
      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockBudgetPlugin.saveItem).toHaveBeenCalledWith('budget-1', expect.objectContaining({
          expenses: expect.arrayContaining([
            expect.objectContaining({
              description: 'Mickey Ears',
              amount: 25,
              category: 'Souvenirs',
            })
          ])
        }))
      })
    })
  })

  describe('3. Trip Planner Auto-Save', () => {
    it('should auto-save trip plan changes and update widget display', async () => {
      const user = userEvent.setup()
      
      const mockPlannerData = {
        id: 'planner-1',
        name: 'Original Trip Plan',
        plans: [
          { id: '1', date: '2024-12-25', time: '09:00', activity: 'Magic Kingdom', park: 'Magic Kingdom' }
        ]
      }

      const mockPlannerPlugin = {
        getItem: vi.fn().mockReturnValue(mockPlannerData),
        getWidgetData: vi.fn(),
        saveItem: vi.fn().mockImplementation((id, data) => {
          mockPlannerData.name = data.name
          mockPlannerData.plans = data.plans
        }),
      }
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockPlannerPlugin)

      WidgetConfigManager.addConfigSync({
        id: 'test-widget',
        type: 'planner',
        order: 0,
        selectedItemId: 'planner-1',
      })

      render(
        <TripPlanner
          createdItemId="planner-1"
          widgetId="test-widget"
          isEditMode={true}
        />
      )

      // Update plan name
      const nameInput = screen.getByLabelText(/plan name/i) || screen.getByPlaceholderText(/enter plan name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Disney Plan')

      // Update an existing plan
      const activityInput = screen.getByDisplayValue('Magic Kingdom')
      await user.clear(activityInput)
      await user.type(activityInput, 'Epcot')

      // Trigger auto-save
      await user.tab()

      await waitFor(() => {
        expect(mockPlannerPlugin.saveItem).toHaveBeenCalledWith('planner-1', expect.objectContaining({
          name: 'Updated Disney Plan',
          plans: expect.arrayContaining([
            expect.objectContaining({
              activity: 'Epcot',
              park: 'Epcot',
            })
          ])
        }))
      })

      // Verify widget displays updated data
      render(<TripPlannerWidget {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('Updated Disney Plan')).toBeInTheDocument()
      })

      expect(screen.getByText('Epcot')).toBeInTheDocument()
    })

    it('should auto-save new plan additions', async () => {
      const user = userEvent.setup()
      
      const mockPlannerData = {
        id: 'planner-1',
        name: 'Disney Plan',
        plans: []
      }

      const mockPlannerPlugin = {
        getItem: vi.fn().mockReturnValue(mockPlannerData),
        getWidgetData: vi.fn(),
        saveItem: vi.fn().mockImplementation((id, data) => {
          mockPlannerData.plans = data.plans
        }),
      }
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockPlannerPlugin)

      WidgetConfigManager.addConfigSync({
        id: 'test-widget',
        type: 'planner',
        order: 0,
        selectedItemId: 'planner-1',
      })

      render(
        <TripPlanner
          createdItemId="planner-1"
          widgetId="test-widget"
          isEditMode={true}
        />
      )

      // Add a new plan
      const addPlanButton = screen.getByRole('button', { name: /add plan/i })
      await user.click(addPlanButton)

      // Fill in plan details
      const dateInput = screen.getByLabelText(/date/i) || screen.getByPlaceholderText(/date/i)
      await user.type(dateInput, '2024-12-25')

      const timeInput = screen.getByLabelText(/time/i) || screen.getByPlaceholderText(/time/i)
      await user.type(timeInput, '10:00')

      const activityInput = screen.getByLabelText(/activity/i) || screen.getByPlaceholderText(/activity/i)
      await user.type(activityInput, 'Hollywood Studios')

      const parkSelect = screen.getByLabelText(/park/i) || screen.getByRole('combobox')
      await user.selectOptions(parkSelect, 'Hollywood Studios')

      // Save the plan
      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockPlannerPlugin.saveItem).toHaveBeenCalledWith('planner-1', expect.objectContaining({
          plans: expect.arrayContaining([
            expect.objectContaining({
              date: '2024-12-25',
              time: '10:00',
              activity: 'Hollywood Studios',
              park: 'Hollywood Studios',
            })
          ])
        }))
      })
    })
  })

  describe('4. Packing List Auto-Save', () => {
    it('should auto-save packing list changes and update widget display', async () => {
      const user = userEvent.setup()
      
      const mockPackingData = {
        id: 'packing-1',
        name: 'Original Packing List',
        items: [
          { id: '1', name: 'Mickey Ears', checked: false, category: 'Accessories' }
        ]
      }

      const mockPackingPlugin = {
        getItem: vi.fn().mockReturnValue(mockPackingData),
        getWidgetData: vi.fn(),
        saveItem: vi.fn().mockImplementation((id, data) => {
          mockPackingData.name = data.name
          mockPackingData.items = data.items
        }),
      }
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockPackingPlugin)

      WidgetConfigManager.addConfigSync({
        id: 'test-widget',
        type: 'packing',
        order: 0,
        selectedItemId: 'packing-1',
      })

      render(
        <PackingChecklist
          createdItemId="packing-1"
          widgetId="test-widget"
          isEditMode={true}
        />
      )

      // Update list name
      const nameInput = screen.getByLabelText(/list name/i) || screen.getByPlaceholderText(/enter list name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Disney Packing')

      // Check off an item
      const checkbox = screen.getByRole('checkbox', { name: /mickey ears/i })
      await user.click(checkbox)

      // Trigger auto-save
      await user.tab()

      await waitFor(() => {
        expect(mockPackingPlugin.saveItem).toHaveBeenCalledWith('packing-1', expect.objectContaining({
          name: 'Updated Disney Packing',
          items: expect.arrayContaining([
            expect.objectContaining({
              name: 'Mickey Ears',
              checked: true,
            })
          ])
        }))
      })

      // Verify widget displays updated data
      render(<PackingWidget {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('Updated Disney Packing')).toBeInTheDocument()
      })

      // The checked item should be visually different in the widget
      const checkedItem = screen.getByText('Mickey Ears')
      expect(checkedItem).toBeInTheDocument()
    })

    it('should auto-save new item additions', async () => {
      const user = userEvent.setup()
      
      const mockPackingData = {
        id: 'packing-1',
        name: 'Disney Packing',
        items: []
      }

      const mockPackingPlugin = {
        getItem: vi.fn().mockReturnValue(mockPackingData),
        getWidgetData: vi.fn(),
        saveItem: vi.fn().mockImplementation((id, data) => {
          mockPackingData.items = data.items
        }),
      }
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockPackingPlugin)

      WidgetConfigManager.addConfigSync({
        id: 'test-widget',
        type: 'packing',
        order: 0,
        selectedItemId: 'packing-1',
      })

      render(
        <PackingChecklist
          createdItemId="packing-1"
          widgetId="test-widget"
          isEditMode={true}
        />
      )

      // Add a new item
      const addItemButton = screen.getByRole('button', { name: /add item/i })
      await user.click(addItemButton)

      // Fill in item details
      const itemInput = screen.getByLabelText(/item name/i) || screen.getByPlaceholderText(/item name/i)
      await user.type(itemInput, 'Sunscreen')

      const categorySelect = screen.getByLabelText(/category/i) || screen.getByRole('combobox')
      await user.selectOptions(categorySelect, 'Essentials')

      // Save the item
      const saveButton = screen.getByRole('button', { name: /save/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(mockPackingPlugin.saveItem).toHaveBeenCalledWith('packing-1', expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              name: 'Sunscreen',
              category: 'Essentials',
              checked: false,
            })
          ])
        }))
      })
    })
  })

  describe('5. Real-time Widget Updates', () => {
    it('should update widget display immediately after auto-save', async () => {
      const user = userEvent.setup()
      
      const mockCountdownData = {
        id: 'countdown-1',
        name: 'Disney Trip',
        tripDate: '2024-12-25',
        park: { name: 'Magic Kingdom', gradient: 'from-red-500 to-blue-500' }
      }

      const mockCountdownPlugin = {
        getItem: vi.fn().mockReturnValue(mockCountdownData),
        getWidgetData: vi.fn(),
        saveItem: vi.fn().mockImplementation((id, data) => {
          // Immediately update the data that the widget reads from
          mockCountdownData.name = data.name
          mockCountdownData.tripDate = data.tripDate
        }),
      }
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockCountdownPlugin)

      WidgetConfigManager.addConfigSync({
        id: 'test-widget',
        type: 'countdown',
        order: 0,
        selectedItemId: 'countdown-1',
      })

      // Render both the edit component and widget simultaneously
      render(
        <div>
          <CountdownTimer
            createdItemId="countdown-1"
            widgetId="test-widget"
            isEditMode={true}
          />
          <CountdownWidget {...mockProps} />
        </div>
      )

      // Verify initial state
      await waitFor(() => {
        expect(screen.getByText('Disney Trip')).toBeInTheDocument()
      })

      // Make a change in the edit component
      const nameInput = screen.getByLabelText(/countdown name/i) || screen.getByPlaceholderText(/enter countdown name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Disney Adventure')

      // Trigger auto-save
      await user.tab()

      // Wait for auto-save to complete
      await waitFor(() => {
        expect(mockCountdownPlugin.saveItem).toHaveBeenCalled()
      })

      // The widget should immediately show the updated name
      await waitFor(() => {
        expect(screen.getByText('Updated Disney Adventure')).toBeInTheDocument()
      })
    })

    it('should handle multiple rapid changes correctly', async () => {
      const user = userEvent.setup()
      
      const mockCountdownData = {
        id: 'countdown-1',
        name: 'Disney Trip',
        tripDate: '2024-12-25',
        park: { name: 'Magic Kingdom', gradient: 'from-red-500 to-blue-500' }
      }

      const mockCountdownPlugin = {
        getItem: vi.fn().mockReturnValue(mockCountdownData),
        getWidgetData: vi.fn(),
        saveItem: vi.fn().mockImplementation((id, data) => {
          mockCountdownData.name = data.name
          mockCountdownData.tripDate = data.tripDate
        }),
      }
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockCountdownPlugin)

      WidgetConfigManager.addConfigSync({
        id: 'test-widget',
        type: 'countdown',
        order: 0,
        selectedItemId: 'countdown-1',
      })

      render(
        <div>
          <CountdownTimer
            createdItemId="countdown-1"
            widgetId="test-widget"
            isEditMode={true}
          />
          <CountdownWidget {...mockProps} />
        </div>
      )

      // Make rapid changes
      const nameInput = screen.getByLabelText(/countdown name/i) || screen.getByPlaceholderText(/enter countdown name/i)
      const dateInput = screen.getByLabelText(/trip date/i) || screen.getByDisplayValue('2024-12-25')

      await user.clear(nameInput)
      await user.type(nameInput, 'First Change')
      await user.tab()

      await user.clear(nameInput)
      await user.type(nameInput, 'Second Change')
      await user.tab()

      await user.clear(dateInput)
      await user.type(dateInput, '2024-12-26')
      await user.tab()

      // Verify the final state is correct
      await waitFor(() => {
        expect(screen.getByText('Second Change')).toBeInTheDocument()
      })

      expect(screen.getByText('12/26/2024')).toBeInTheDocument()

      // Verify save was called multiple times
      expect(mockCountdownPlugin.saveItem).toHaveBeenCalledTimes(3)
    })
  })

  describe('6. Error Handling', () => {
    it('should handle auto-save failures gracefully', async () => {
      const user = userEvent.setup()
      
      const mockCountdownData = {
        id: 'countdown-1',
        name: 'Disney Trip',
        tripDate: '2024-12-25',
        park: { name: 'Magic Kingdom', gradient: 'from-red-500 to-blue-500' }
      }

      const mockCountdownPlugin = {
        getItem: vi.fn().mockReturnValue(mockCountdownData),
        getWidgetData: vi.fn(),
        saveItem: vi.fn().mockRejectedValue(new Error('Save failed')),
      }
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockCountdownPlugin)

      WidgetConfigManager.addConfigSync({
        id: 'test-widget',
        type: 'countdown',
        order: 0,
        selectedItemId: 'countdown-1',
      })

      render(
        <CountdownTimer
          createdItemId="countdown-1"
          widgetId="test-widget"
          isEditMode={true}
        />
      )

      // Make a change
      const nameInput = screen.getByLabelText(/countdown name/i) || screen.getByPlaceholderText(/enter countdown name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Name')

      // Trigger auto-save
      await user.tab()

      // The component should not crash, even if save fails
      await waitFor(() => {
        expect(mockCountdownPlugin.saveItem).toHaveBeenCalled()
      })

      // The input should still contain the user's changes
      expect(nameInput).toHaveValue('Updated Name')
    })

    it('should handle network connectivity issues', async () => {
      const user = userEvent.setup()
      
      const mockCountdownData = {
        id: 'countdown-1',
        name: 'Disney Trip',
        tripDate: '2024-12-25',
        park: { name: 'Magic Kingdom', gradient: 'from-red-500 to-blue-500' }
      }

      const mockCountdownPlugin = {
        getItem: vi.fn().mockReturnValue(mockCountdownData),
        getWidgetData: vi.fn(),
        saveItem: vi.fn().mockImplementation(() => {
          // Simulate network timeout
          return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Network timeout')), 100)
          })
        }),
      }
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockCountdownPlugin)

      WidgetConfigManager.addConfigSync({
        id: 'test-widget',
        type: 'countdown',
        order: 0,
        selectedItemId: 'countdown-1',
      })

      render(
        <CountdownTimer
          createdItemId="countdown-1"
          widgetId="test-widget"
          isEditMode={true}
        />
      )

      // Make a change
      const nameInput = screen.getByLabelText(/countdown name/i) || screen.getByPlaceholderText(/enter countdown name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'Network Test')

      // Trigger auto-save
      await user.tab()

      // The component should handle the timeout gracefully
      await waitFor(() => {
        expect(mockCountdownPlugin.saveItem).toHaveBeenCalled()
      }, { timeout: 200 })

      // The input should still contain the user's changes
      expect(nameInput).toHaveValue('Network Test')
    })
  })
})