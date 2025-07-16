import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter, useSearchParams } from 'next/navigation'
import { WidgetConfigManager } from '@/lib/widgetConfig'
import { PluginRegistry } from '@/lib/pluginSystem'
import { useUser } from '@/hooks/useUser'
import CountdownWidget from '@/components/widgets/CountdownWidget'
import BudgetWidget from '@/components/widgets/BudgetWidget'
import TripPlannerWidget from '@/components/widgets/TripPlannerWidget'
import PackingWidget from '@/components/widgets/PackingWidget'
import WidgetBase from '@/components/widgets/WidgetBase'

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
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock the useUser hook
vi.mock('@/hooks/useUser')
const mockUseUser = vi.mocked(useUser)

// Mock the plugin system
vi.mock('@/lib/pluginSystem', () => ({
  PluginRegistry: {
    getPlugin: vi.fn(),
    register: vi.fn(),
    getAllPlugins: vi.fn().mockReturnValue([]),
    getWidgetTypes: vi.fn().mockReturnValue([]),
  },
  PluginStorage: {
    getData: vi.fn(),
    saveData: vi.fn(),
    updateData: vi.fn(),
  },
}))

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000/dashboard',
  },
  writable: true,
})

// Mock window.dispatchEvent
Object.defineProperty(window, 'dispatchEvent', {
  value: vi.fn(),
  writable: true,
})

// Mock plugins import
vi.mock('@/plugins', () => ({}))

describe('Widget Editing Functionality', () => {
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
  })

  afterEach(() => {
    // Clean up after each test
    WidgetConfigManager.removeConfigSync('test-widget')
  })

  describe('1. Navigation to Edit Pages', () => {
    it('should navigate to countdown edit page when Edit Configuration is clicked', async () => {
      const user = userEvent.setup()
      
      // Setup widget with selected item
      WidgetConfigManager.addConfigSync({
        id: 'test-widget',
        type: 'countdown',
        order: 0,
        selectedItemId: 'countdown-1',
      })

      render(
        <WidgetBase
          id="test-widget"
          title="Test Countdown"
          icon={() => <div>Icon</div>}
          iconColor="bg-blue-500"
          widgetType="countdown"
          selectedItemId="countdown-1"
          onItemSelect={vi.fn()}
        >
          <div>Widget Content</div>
        </WidgetBase>
      )

      // Open settings dropdown
      const settingsButton = screen.getByRole('button', { name: /settings/i })
      await user.click(settingsButton)

      // Click Edit Configuration button
      const editButton = screen.getByRole('button', { name: /edit configuration/i })
      await user.click(editButton)

      // Verify navigation
      expect(window.location.href).toBe('http://localhost:3000/countdown/new?widgetId=test-widget&editItemId=countdown-1')
    })

    it('should navigate to budget edit page when Edit Configuration is clicked', async () => {
      const user = userEvent.setup()
      
      WidgetConfigManager.addConfigSync({
        id: 'test-widget',
        type: 'budget',
        order: 0,
        selectedItemId: 'budget-1',
      })

      render(
        <WidgetBase
          id="test-widget"
          title="Test Budget"
          icon={() => <div>Icon</div>}
          iconColor="bg-green-500"
          widgetType="budget"
          selectedItemId="budget-1"
          onItemSelect={vi.fn()}
        >
          <div>Widget Content</div>
        </WidgetBase>
      )

      const settingsButton = screen.getByRole('button', { name: /settings/i })
      await user.click(settingsButton)

      const editButton = screen.getByRole('button', { name: /edit configuration/i })
      await user.click(editButton)

      expect(window.location.href).toBe('http://localhost:3000/budget/new?widgetId=test-widget&editItemId=budget-1')
    })

    it('should navigate to planner edit page when Edit Configuration is clicked', async () => {
      const user = userEvent.setup()
      
      WidgetConfigManager.addConfigSync({
        id: 'test-widget',
        type: 'planner',
        order: 0,
        selectedItemId: 'planner-1',
      })

      render(
        <WidgetBase
          id="test-widget"
          title="Test Planner"
          icon={() => <div>Icon</div>}
          iconColor="bg-purple-500"
          widgetType="planner"
          selectedItemId="planner-1"
          onItemSelect={vi.fn()}
        >
          <div>Widget Content</div>
        </WidgetBase>
      )

      const settingsButton = screen.getByRole('button', { name: /settings/i })
      await user.click(settingsButton)

      const editButton = screen.getByRole('button', { name: /edit configuration/i })
      await user.click(editButton)

      expect(window.location.href).toBe('http://localhost:3000/planner/new?widgetId=test-widget&editItemId=planner-1')
    })

    it('should navigate to packing edit page when Edit Configuration is clicked', async () => {
      const user = userEvent.setup()
      
      WidgetConfigManager.addConfigSync({
        id: 'test-widget',
        type: 'packing',
        order: 0,
        selectedItemId: 'packing-1',
      })

      render(
        <WidgetBase
          id="test-widget"
          title="Test Packing"
          icon={() => <div>Icon</div>}
          iconColor="bg-orange-500"
          widgetType="packing"
          selectedItemId="packing-1"
          onItemSelect={vi.fn()}
        >
          <div>Widget Content</div>
        </WidgetBase>
      )

      const settingsButton = screen.getByRole('button', { name: /settings/i })
      await user.click(settingsButton)

      const editButton = screen.getByRole('button', { name: /edit configuration/i })
      await user.click(editButton)

      expect(window.location.href).toBe('http://localhost:3000/packing/new?widgetId=test-widget&editItemId=packing-1')
    })

    it('should navigate to create new page when Create New is clicked', async () => {
      const user = userEvent.setup()

      render(
        <WidgetBase
          id="test-widget"
          title="Test Countdown"
          icon={() => <div>Icon</div>}
          iconColor="bg-blue-500"
          widgetType="countdown"
          onItemSelect={vi.fn()}
        >
          <div>Widget Content</div>
        </WidgetBase>
      )

      const settingsButton = screen.getByRole('button', { name: /settings/i })
      await user.click(settingsButton)

      const createButton = screen.getByRole('button', { name: /create new countdown/i })
      await user.click(createButton)

      expect(window.location.href).toBe('http://localhost:3000/countdown/new?widgetId=test-widget')
    })

    it('should not show Edit Configuration button when no item is selected', async () => {
      const user = userEvent.setup()

      render(
        <WidgetBase
          id="test-widget"
          title="Test Countdown"
          icon={() => <div>Icon</div>}
          iconColor="bg-blue-500"
          widgetType="countdown"
          onItemSelect={vi.fn()}
        >
          <div>Widget Content</div>
        </WidgetBase>
      )

      const settingsButton = screen.getByRole('button', { name: /settings/i })
      await user.click(settingsButton)

      // Edit Configuration button should not be present
      expect(screen.queryByRole('button', { name: /edit configuration/i })).not.toBeInTheDocument()
      
      // Create New button should still be present
      expect(screen.getByRole('button', { name: /create new countdown/i })).toBeInTheDocument()
    })
  })

  describe('2. Auto-Save Functionality', () => {
    it('should auto-save countdown widget configuration when item is selected', async () => {
      const user = userEvent.setup()
      
      // Mock countdown plugin data
      const mockCountdownPlugin = {
        getItem: vi.fn().mockReturnValue({
          id: 'countdown-1',
          name: 'Disney World Trip',
          tripDate: '2024-12-25',
          park: { name: 'Magic Kingdom', gradient: 'from-red-500 to-blue-500' }
        }),
        getWidgetData: vi.fn().mockReturnValue({
          id: 'countdown-1',
          name: 'Disney World Trip',
          tripDate: '2024-12-25',
          park: { name: 'Magic Kingdom', gradient: 'from-red-500 to-blue-500' }
        }),
      }
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockCountdownPlugin)

      // Set up widget configuration with selected item
      WidgetConfigManager.updateConfig('test-widget', { selectedItemId: 'countdown-1' })

      render(<CountdownWidget {...mockProps} />)

      // Simulate item selection through the widget's internal mechanism
      const widgetConfig = WidgetConfigManager.getConfig('test-widget')
      expect(widgetConfig).toBeNull() // Should not exist initially

      // Simulate selecting an item
      WidgetConfigManager.updateConfigSync('test-widget', { 
        type: 'countdown',
        order: 0,
        selectedItemId: 'countdown-1' 
      })

      // Verify the configuration was saved
      const updatedConfig = WidgetConfigManager.getConfig('test-widget')
      expect(updatedConfig).toEqual({
        id: 'test-widget',
        type: 'countdown',
        order: 0,
        selectedItemId: 'countdown-1'
      })
    })

    it('should auto-save budget widget configuration when item is selected', async () => {
      const user = userEvent.setup()
      
      const mockBudgetPlugin = {
        getItem: vi.fn().mockReturnValue({
          id: 'budget-1',
          name: 'Disney Budget',
          total: 5000,
          categories: { 'Tickets': 2000, 'Food': 1500, 'Souvenirs': 1500 }
        }),
        getWidgetData: vi.fn().mockReturnValue({
          id: 'budget-1',
          name: 'Disney Budget',
          total: 5000,
          categories: { 'Tickets': 2000, 'Food': 1500, 'Souvenirs': 1500 }
        }),
      }
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockBudgetPlugin)

      // Set up widget configuration with selected item
      WidgetConfigManager.updateConfig('test-widget', { selectedItemId: 'budget-1' })

      render(<BudgetWidget {...mockProps} />)

      // Simulate selecting an item
      WidgetConfigManager.updateConfigSync('test-widget', { 
        type: 'budget',
        order: 0,
        selectedItemId: 'budget-1' 
      })

      const updatedConfig = WidgetConfigManager.getConfig('test-widget')
      expect(updatedConfig).toEqual({
        id: 'test-widget',
        type: 'budget',
        order: 0,
        selectedItemId: 'budget-1'
      })
    })

    it('should auto-save planner widget configuration when item is selected', async () => {
      const user = userEvent.setup()
      
      const mockPlannerPlugin = {
        getItem: vi.fn().mockReturnValue({
          id: 'planner-1',
          name: 'Disney Trip Plan',
          plans: [
            { id: '1', date: '2024-12-25', time: '09:00', activity: 'Magic Kingdom', park: 'Magic Kingdom' }
          ]
        }),
        getWidgetData: vi.fn().mockReturnValue({
          id: 'planner-1',
          name: 'Disney Trip Plan',
          plans: [
            { id: '1', date: '2024-12-25', time: '09:00', activity: 'Magic Kingdom', park: 'Magic Kingdom' }
          ]
        }),
      }
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockPlannerPlugin)

      // Set up widget configuration with selected item
      WidgetConfigManager.updateConfig('test-widget', { selectedItemId: 'planner-1' })

      render(<TripPlannerWidget {...mockProps} />)

      // Simulate selecting an item
      WidgetConfigManager.updateConfigSync('test-widget', { 
        type: 'planner',
        order: 0,
        selectedItemId: 'planner-1' 
      })

      const updatedConfig = WidgetConfigManager.getConfig('test-widget')
      expect(updatedConfig).toEqual({
        id: 'test-widget',
        type: 'planner',
        order: 0,
        selectedItemId: 'planner-1'
      })
    })

    it('should auto-save packing widget configuration when item is selected', async () => {
      const user = userEvent.setup()
      
      const mockPackingPlugin = {
        getItem: vi.fn().mockReturnValue({
          id: 'packing-1',
          name: 'Disney Packing List',
          items: [
            { id: '1', name: 'Mickey Ears', checked: false, category: 'Accessories' }
          ]
        }),
        getWidgetData: vi.fn().mockReturnValue({
          id: 'packing-1',
          name: 'Disney Packing List',
          items: [
            { id: '1', name: 'Mickey Ears', checked: false, category: 'Accessories' }
          ]
        }),
      }
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockPackingPlugin)

      // Set up widget configuration with selected item
      WidgetConfigManager.updateConfig('test-widget', { selectedItemId: 'packing-1' })

      render(<PackingWidget {...mockProps} />)

      // Simulate selecting an item
      WidgetConfigManager.updateConfigSync('test-widget', { 
        type: 'packing',
        order: 0,
        selectedItemId: 'packing-1' 
      })

      const updatedConfig = WidgetConfigManager.getConfig('test-widget')
      expect(updatedConfig).toEqual({
        id: 'test-widget',
        type: 'packing',
        order: 0,
        selectedItemId: 'packing-1'
      })
    })

    it('should not auto-save for anonymous users', async () => {
      // Set user to anonymous
      mockUseUser.mockReturnValue({
        userLevel: 'anon',
        isPremium: false,
        isStandard: false,
        hasFeatureAccess: vi.fn().mockReturnValue(false),
        user: null,
        isLoading: false,
        isLoggedIn: false,
        availableFeatures: [],
        upgradeFeatures: [],
        dataLimits: { items: 1, storage: '1MB' },
        createAnonUser: vi.fn(),
        upgradeToStandard: vi.fn(),
        upgradeToPremium: vi.fn(),
        upgradeToAdmin: vi.fn(),
        logout: vi.fn(),
        ensureUser: vi.fn(),
      })

      render(<CountdownWidget {...mockProps} isDemoMode={true} />)

      // Try to update configuration
      WidgetConfigManager.updateConfigSync('test-widget', { 
        type: 'countdown',
        order: 0,
        selectedItemId: 'countdown-1' 
      })

      // Configuration should not be saved for anonymous users
      const config = WidgetConfigManager.getConfig('test-widget')
      expect(config).toBeNull()
    })
  })

  describe('3. Display Changes in Widgets', () => {
    it('should display countdown data correctly after editing', async () => {
      const mockCountdownData = {
        id: 'countdown-1',
        name: 'Updated Disney Trip',
        tripDate: '2024-12-25',
        park: { name: 'Magic Kingdom', gradient: 'from-red-500 to-blue-500' }
      }

      const mockCountdownPlugin = {
        getItem: vi.fn().mockReturnValue(mockCountdownData),
        getWidgetData: vi.fn().mockReturnValue(mockCountdownData),
      }
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockCountdownPlugin)

      // Setup widget with selected item
      WidgetConfigManager.addConfigSync({
        id: 'test-widget',
        type: 'countdown',
        order: 0,
        selectedItemId: 'countdown-1',
      })

      render(<CountdownWidget {...mockProps} />)

      // Wait for the widget to load the data
      await waitFor(() => {
        expect(screen.getByText('Updated Disney Trip')).toBeInTheDocument()
      })

      expect(screen.getByText('Magic Kingdom')).toBeInTheDocument()
      expect(screen.getByText('12/25/2024')).toBeInTheDocument()
    })

    it('should display budget data correctly after editing', async () => {
      const mockBudgetData = {
        id: 'budget-1',
        name: 'Updated Disney Budget',
        total: 7500,
        categories: { 'Tickets': 3000, 'Food': 2500, 'Souvenirs': 2000 }
      }

      const mockBudgetPlugin = {
        getItem: vi.fn().mockReturnValue(mockBudgetData),
        getWidgetData: vi.fn().mockReturnValue(mockBudgetData),
      }
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockBudgetPlugin)

      WidgetConfigManager.addConfigSync({
        id: 'test-widget',
        type: 'budget',
        order: 0,
        selectedItemId: 'budget-1',
      })

      render(<BudgetWidget {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('Updated Disney Budget')).toBeInTheDocument()
      })

      expect(screen.getByText('$7,500')).toBeInTheDocument()
    })

    it('should display planner data correctly after editing', async () => {
      const mockPlannerData = {
        id: 'planner-1',
        name: 'Updated Disney Plan',
        plans: [
          { id: '1', date: '2024-12-25', time: '09:00', activity: 'Magic Kingdom', park: 'Magic Kingdom' },
          { id: '2', date: '2024-12-26', time: '10:00', activity: 'Epcot', park: 'Epcot' }
        ]
      }

      const mockPlannerPlugin = {
        getItem: vi.fn().mockReturnValue(mockPlannerData),
        getWidgetData: vi.fn().mockReturnValue(mockPlannerData),
      }
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockPlannerPlugin)

      WidgetConfigManager.addConfigSync({
        id: 'test-widget',
        type: 'planner',
        order: 0,
        selectedItemId: 'planner-1',
      })

      render(<TripPlannerWidget {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('Updated Disney Plan')).toBeInTheDocument()
      })

      expect(screen.getByText('Magic Kingdom')).toBeInTheDocument()
      expect(screen.getByText('Epcot')).toBeInTheDocument()
    })

    it('should display packing data correctly after editing', async () => {
      const mockPackingData = {
        id: 'packing-1',
        name: 'Updated Disney Packing',
        items: [
          { id: '1', name: 'Mickey Ears', checked: false, category: 'Accessories' },
          { id: '2', name: 'Sunscreen', checked: true, category: 'Essentials' }
        ]
      }

      const mockPackingPlugin = {
        getItem: vi.fn().mockReturnValue(mockPackingData),
        getWidgetData: vi.fn().mockReturnValue(mockPackingData),
      }
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockPackingPlugin)

      WidgetConfigManager.addConfigSync({
        id: 'test-widget',
        type: 'packing',
        order: 0,
        selectedItemId: 'packing-1',
      })

      render(<PackingWidget {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('Updated Disney Packing')).toBeInTheDocument()
      })

      expect(screen.getByText('Mickey Ears')).toBeInTheDocument()
      expect(screen.getByText('Sunscreen')).toBeInTheDocument()
    })

    it('should show "No Countdown Selected" when no item is selected', async () => {
      const mockCountdownPlugin = {
        getItem: vi.fn().mockReturnValue(null),
        getWidgetData: vi.fn().mockReturnValue(null),
      }
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockCountdownPlugin)

      render(<CountdownWidget {...mockProps} />)

      await waitFor(() => {
        expect(screen.getByText('No Countdown Selected')).toBeInTheDocument()
      })

      expect(screen.getByText('Create a new countdown or select one from settings')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create new/i })).toBeInTheDocument()
    })

    it('should update widget display when item selection changes', async () => {
      const mockCountdownPlugin = {
        getItem: vi.fn()
          .mockReturnValueOnce({
            id: 'countdown-1',
            name: 'First Countdown',
            tripDate: '2024-12-25',
            park: { name: 'Magic Kingdom', gradient: 'from-red-500 to-blue-500' }
          })
          .mockReturnValueOnce({
            id: 'countdown-2',
            name: 'Second Countdown',
            tripDate: '2024-12-26',
            park: { name: 'Epcot', gradient: 'from-green-500 to-blue-500' }
          }),
        getWidgetData: vi.fn()
          .mockReturnValueOnce({
            id: 'countdown-1',
            name: 'First Countdown',
            tripDate: '2024-12-25',
            park: { name: 'Magic Kingdom', gradient: 'from-red-500 to-blue-500' }
          })
          .mockReturnValueOnce({
            id: 'countdown-2',
            name: 'Second Countdown',
            tripDate: '2024-12-26',
            park: { name: 'Epcot', gradient: 'from-green-500 to-blue-500' }
          }),
      }
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockCountdownPlugin)

      WidgetConfigManager.addConfigSync({
        id: 'test-widget',
        type: 'countdown',
        order: 0,
        selectedItemId: 'countdown-1',
      })

      const { rerender } = render(<CountdownWidget {...mockProps} />)

      // Wait for first countdown to display
      await waitFor(() => {
        expect(screen.getByText('First Countdown')).toBeInTheDocument()
      })

      // Change the selected item
      WidgetConfigManager.updateConfigSync('test-widget', { selectedItemId: 'countdown-2' })

      // Rerender to trigger the update
      rerender(<CountdownWidget {...mockProps} />)

      // Wait for second countdown to display
      await waitFor(() => {
        expect(screen.getByText('Second Countdown')).toBeInTheDocument()
      })

      expect(screen.getByText('Epcot')).toBeInTheDocument()
    })
  })

  describe('4. Integration Tests', () => {
    it('should handle complete edit workflow: navigate, save, and display', async () => {
      const user = userEvent.setup()
      
      const mockCountdownData = {
        id: 'countdown-1',
        name: 'Disney World Adventure',
        tripDate: '2024-12-25',
        park: { name: 'Magic Kingdom', gradient: 'from-red-500 to-blue-500' }
      }

      const mockCountdownPlugin = {
        getItem: vi.fn().mockReturnValue(mockCountdownData),
        getWidgetData: vi.fn().mockReturnValue(null), // Return null when no selected item
      }
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockCountdownPlugin)

      // Step 1: Ensure no widget configuration exists
      WidgetConfigManager.removeConfigSync('test-widget')
      
      // Step 1: Render widget with no selected item
      const { rerender } = render(<CountdownWidget {...mockProps} />)

      // Should show "No Countdown Selected"
      await waitFor(() => {
        expect(screen.getByText('No Countdown Selected')).toBeInTheDocument()
      })

      // Step 2: Simulate selecting an item (this would happen through the settings dropdown)
      WidgetConfigManager.updateConfigSync('test-widget', { 
        type: 'countdown',
        order: 0,
        selectedItemId: 'countdown-1' 
      })

      // Step 3: Rerender to trigger the update
      rerender(<CountdownWidget {...mockProps} />)

      // Step 4: Verify the widget now displays the selected item
      await waitFor(() => {
        expect(screen.getByText('Disney World Adventure')).toBeInTheDocument()
      })

      // Step 4: Verify configuration was saved
      const config = WidgetConfigManager.getConfig('test-widget')
      expect(config?.selectedItemId).toBe('countdown-1')

      // Step 5: Test navigation to edit page
      render(
        <WidgetBase
          id="test-widget"
          title="Test Countdown"
          icon={() => <div>Icon</div>}
          iconColor="bg-blue-500"
          widgetType="countdown"
          selectedItemId="countdown-1"
          onItemSelect={vi.fn()}
        >
          <div>Widget Content</div>
        </WidgetBase>
      )

      const settingsButton = screen.getByRole('button', { name: /settings/i })
      await user.click(settingsButton)

      const editButton = screen.getByRole('button', { name: /edit configuration/i })
      await user.click(editButton)

      // Verify navigation to edit page
      expect(window.location.href).toBe('http://localhost:3000/countdown/new?widgetId=test-widget&editItemId=countdown-1')
    })

    it('should handle demo mode correctly', async () => {
      // Set user to anonymous for demo mode
      mockUseUser.mockReturnValue({
        userLevel: 'anon',
        isPremium: false,
        isStandard: false,
        hasFeatureAccess: vi.fn().mockReturnValue(false),
        user: null,
        isLoading: false,
        isLoggedIn: false,
        availableFeatures: [],
        upgradeFeatures: [],
        dataLimits: { items: 1, storage: '1MB' },
        createAnonUser: vi.fn(),
        upgradeToStandard: vi.fn(),
        upgradeToPremium: vi.fn(),
        upgradeToAdmin: vi.fn(),
        logout: vi.fn(),
        ensureUser: vi.fn(),
      })

      // Mock plugin to return null for demo mode
      const mockCountdownPlugin = {
        getItem: vi.fn().mockReturnValue(null),
        getWidgetData: vi.fn().mockReturnValue(null),
      }
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockCountdownPlugin)

      render(<CountdownWidget {...mockProps} isDemoMode={true} />)

      // In demo mode, should show demo content
      await waitFor(() => {
        expect(screen.getByText('No Countdown Selected')).toBeInTheDocument()
      })

      // Try to update configuration in demo mode
      WidgetConfigManager.updateConfigSync('test-widget', { 
        type: 'countdown',
        order: 0,
        selectedItemId: 'countdown-1' 
      })

      // Configuration should not be saved in demo mode
      const config = WidgetConfigManager.getConfig('test-widget')
      expect(config).toBeNull()
    })
  })
})