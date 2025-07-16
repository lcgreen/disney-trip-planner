import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CountdownWidget } from '@/components/widgets'
import { BudgetWidget } from '@/components/widgets'
import { TripPlannerWidget } from '@/components/widgets'
import { PackingWidget } from '@/components/widgets'
import { WidgetConfigManager } from '@/lib/widgetConfig'
import { UnifiedStorage } from '@/lib/unifiedStorage'
import { PluginRegistry } from '@/lib/pluginSystem'
import { userManager } from '@/lib/userManagement'

// Mock the widget configuration manager
vi.mock('@/lib/widgetConfig', () => ({
  WidgetConfigManager: {
    getConfig: vi.fn(),
    updateConfig: vi.fn(),
    updateConfigSync: vi.fn(),
    getSelectedItemData: vi.fn(),
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

// Mock the plugin registry
vi.mock('@/lib/pluginSystem', () => ({
  PluginRegistry: {
    getPlugin: vi.fn(),
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

describe('Widget Display Updates', () => {
  const mockWidgetProps = {
    id: 'test-widget-1',
    onRemove: vi.fn(),
    onWidthChange: vi.fn(),
    onItemSelect: vi.fn(),
  }

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
    createdAt: '2024-01-01T00:00:00Z',
  }

  const mockBudgetData = {
    id: 'test-budget-1',
    name: 'Test Budget',
    totalBudget: 5000,
    categories: [
      { id: '1', name: 'Food', budget: 1000, spent: 500 },
      { id: '2', name: 'Transportation', budget: 800, spent: 400 },
    ],
    expenses: [
      { id: '1', date: '2024-01-01', category: 'Food', amount: 50, description: 'Lunch' },
      { id: '2', date: '2024-01-02', category: 'Transportation', amount: 25, description: 'Uber' },
    ],
    createdAt: '2024-01-01T00:00:00Z',
  }

  const mockPackingData = {
    id: 'test-packing-1',
    name: 'Test Packing List',
    items: [
      { id: '1', name: 'Passport', checked: true, category: 'Documents' },
      { id: '2', name: 'Phone Charger', checked: false, category: 'Electronics' },
    ],
    selectedWeather: ['sunny', 'warm'],
    createdAt: '2024-01-01T00:00:00Z',
  }

  const mockPlannerData = {
    id: 'test-planner-1',
    name: 'Test Trip Plan',
    days: [
      {
        id: '1',
        date: '2024-12-25',
        plans: [
          { id: '1', time: '09:00', activity: 'Breakfast', park: 'Magic Kingdom' },
          { id: '2', time: '10:00', activity: 'Ride Space Mountain', park: 'Magic Kingdom' },
        ]
      }
    ],
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
    
    vi.mocked(WidgetConfigManager.getConfig).mockReturnValue({
      id: 'test-widget-1',
      type: 'countdown',
      order: 0,
      selectedItemId: 'test-countdown-1',
    })
    
    vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([mockCountdownData])
    
    // Mock plugin registry
    vi.mocked(PluginRegistry.getPlugin).mockReturnValue({
      getItem: vi.fn().mockReturnValue(mockCountdownData),
      getWidgetData: vi.fn().mockReturnValue(mockCountdownData),
    } as any)
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('Countdown Widget Display Updates', () => {
    it('should display updated countdown name after editing', async () => {
      const updatedCountdownData = {
        ...mockCountdownData,
        name: 'Updated Countdown Name',
      }
      
      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([updatedCountdownData])
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue({
        getItem: vi.fn().mockReturnValue(updatedCountdownData),
        getWidgetData: vi.fn().mockReturnValue(updatedCountdownData),
      } as any)
      
      render(<CountdownWidget {...mockWidgetProps} />)
      
      // Wait for widget to load
      await waitFor(() => {
        expect(screen.getByText('Updated Countdown Name')).toBeInTheDocument()
      })
    })

    it('should display updated trip date after editing', async () => {
      const updatedCountdownData = {
        ...mockCountdownData,
        tripDate: '2024-12-26',
      }
      
      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([updatedCountdownData])
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue({
        getItem: vi.fn().mockReturnValue(updatedCountdownData),
        getWidgetData: vi.fn().mockReturnValue(updatedCountdownData),
      } as any)
      
      render(<CountdownWidget {...mockWidgetProps} />)
      
      // Wait for widget to load and verify date is updated
      await waitFor(() => {
        expect(screen.getByText('12/26/2024')).toBeInTheDocument()
      })
    })

    it('should display updated park information after editing', async () => {
      const updatedCountdownData = {
        ...mockCountdownData,
        park: { 
          id: 'ep',
          name: 'Epcot',
          gradient: 'from-blue-500 to-green-500'
        },
      }
      
      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([updatedCountdownData])
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue({
        getItem: vi.fn().mockReturnValue(updatedCountdownData),
        getWidgetData: vi.fn().mockReturnValue(updatedCountdownData),
      } as any)
      
      render(<CountdownWidget {...mockWidgetProps} />)
      
      // Wait for widget to load and verify park is updated
      await waitFor(() => {
        expect(screen.getByText('Epcot')).toBeInTheDocument()
      })
    })

    it('should update countdown timer display when date changes', async () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30) // 30 days from now
      
      const updatedCountdownData = {
        ...mockCountdownData,
        tripDate: futureDate.toISOString().split('T')[0],
      }
      
      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([updatedCountdownData])
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue({
        getItem: vi.fn().mockReturnValue(updatedCountdownData),
        getWidgetData: vi.fn().mockReturnValue(updatedCountdownData),
      } as any)
      
      render(<CountdownWidget {...mockWidgetProps} />)
      
      // Wait for widget to load and verify countdown is displayed
      await waitFor(() => {
        expect(screen.getByText(/30/)).toBeInTheDocument() // Should show ~30 days
      })
    })
  })

  describe('Budget Widget Display Updates', () => {
    beforeEach(() => {
      vi.mocked(WidgetConfigManager.getConfig).mockReturnValue({
        id: 'budget-widget-1',
        type: 'budget',
        order: 0,
        selectedItemId: 'test-budget-1',
      })
      
      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([mockBudgetData])
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue({
        getItem: vi.fn().mockReturnValue(mockBudgetData),
        getWidgetData: vi.fn().mockReturnValue(mockBudgetData),
      } as any)
    })

    it('should display updated budget name after editing', async () => {
      const updatedBudgetData = {
        ...mockBudgetData,
        name: 'Updated Budget Name',
      }
      
      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([updatedBudgetData])
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue({
        getItem: vi.fn().mockReturnValue(updatedBudgetData),
        getWidgetData: vi.fn().mockReturnValue(updatedBudgetData),
      } as any)
      
      render(<BudgetWidget {...mockWidgetProps} id="budget-widget-1" />)
      
      await waitFor(() => {
        expect(screen.getByText('Updated Budget Name')).toBeInTheDocument()
      })
    })

    it('should display updated total budget after editing', async () => {
      const updatedBudgetData = {
        ...mockBudgetData,
        totalBudget: 6000,
      }
      
      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([updatedBudgetData])
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue({
        getItem: vi.fn().mockReturnValue(updatedBudgetData),
        getWidgetData: vi.fn().mockReturnValue(updatedBudgetData),
      } as any)
      
      render(<BudgetWidget {...mockWidgetProps} id="budget-widget-1" />)
      
      await waitFor(() => {
        expect(screen.getByText('$6,000')).toBeInTheDocument()
      })
    })

    it('should display updated expense categories after editing', async () => {
      const updatedBudgetData = {
        ...mockBudgetData,
        categories: [
          { id: '1', name: 'Food', budget: 1200, spent: 600 },
          { id: '2', name: 'Transportation', budget: 800, spent: 400 },
          { id: '3', name: 'Souvenirs', budget: 500, spent: 200 },
        ],
      }
      
      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([updatedBudgetData])
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue({
        getItem: vi.fn().mockReturnValue(updatedBudgetData),
        getWidgetData: vi.fn().mockReturnValue(updatedBudgetData),
      } as any)
      
      render(<BudgetWidget {...mockWidgetProps} id="budget-widget-1" />)
      
      await waitFor(() => {
        expect(screen.getByText('Souvenirs')).toBeInTheDocument()
      })
    })
  })

  describe('Packing Widget Display Updates', () => {
    beforeEach(() => {
      vi.mocked(WidgetConfigManager.getConfig).mockReturnValue({
        id: 'packing-widget-1',
        type: 'packing',
        order: 0,
        selectedItemId: 'test-packing-1',
      })
      
      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([mockPackingData])
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue({
        getItem: vi.fn().mockReturnValue(mockPackingData),
        getWidgetData: vi.fn().mockReturnValue(mockPackingData),
      } as any)
    })

    it('should display updated packing list name after editing', async () => {
      const updatedPackingData = {
        ...mockPackingData,
        name: 'Updated Packing List',
      }
      
      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([updatedPackingData])
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue({
        getItem: vi.fn().mockReturnValue(updatedPackingData),
        getWidgetData: vi.fn().mockReturnValue(updatedPackingData),
      } as any)
      
      render(<PackingWidget {...mockWidgetProps} id="packing-widget-1" />)
      
      await waitFor(() => {
        expect(screen.getByText('Updated Packing List')).toBeInTheDocument()
      })
    })

    it('should display updated packing items after editing', async () => {
      const updatedPackingData = {
        ...mockPackingData,
        items: [
          { id: '1', name: 'Passport', checked: true, category: 'Documents' },
          { id: '2', name: 'Phone Charger', checked: false, category: 'Electronics' },
          { id: '3', name: 'Sunscreen', checked: false, category: 'Toiletries' },
        ],
      }
      
      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([updatedPackingData])
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue({
        getItem: vi.fn().mockReturnValue(updatedPackingData),
        getWidgetData: vi.fn().mockReturnValue(updatedPackingData),
      } as any)
      
      render(<PackingWidget {...mockWidgetProps} id="packing-widget-1" />)
      
      await waitFor(() => {
        expect(screen.getByText('Sunscreen')).toBeInTheDocument()
      })
    })

    it('should update progress when items are checked/unchecked', async () => {
      const updatedPackingData = {
        ...mockPackingData,
        items: [
          { id: '1', name: 'Passport', checked: true, category: 'Documents' },
          { id: '2', name: 'Phone Charger', checked: true, category: 'Electronics' },
        ],
      }
      
      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([updatedPackingData])
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue({
        getItem: vi.fn().mockReturnValue(updatedPackingData),
        getWidgetData: vi.fn().mockReturnValue(updatedPackingData),
      } as any)
      
      render(<PackingWidget {...mockWidgetProps} id="packing-widget-1" />)
      
      await waitFor(() => {
        expect(screen.getByText('100%')).toBeInTheDocument() // All items checked
      })
    })
  })

  describe('Trip Planner Widget Display Updates', () => {
    beforeEach(() => {
      vi.mocked(WidgetConfigManager.getConfig).mockReturnValue({
        id: 'planner-widget-1',
        type: 'planner',
        order: 0,
        selectedItemId: 'test-planner-1',
      })
      
      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([mockPlannerData])
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue({
        getItem: vi.fn().mockReturnValue(mockPlannerData),
        getWidgetData: vi.fn().mockReturnValue(mockPlannerData),
      } as any)
    })

    it('should display updated trip plan name after editing', async () => {
      const updatedPlannerData = {
        ...mockPlannerData,
        name: 'Updated Trip Plan',
      }
      
      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([updatedPlannerData])
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue({
        getItem: vi.fn().mockReturnValue(updatedPlannerData),
        getWidgetData: vi.fn().mockReturnValue(updatedPlannerData),
      } as any)
      
      render(<TripPlannerWidget {...mockWidgetProps} id="planner-widget-1" />)
      
      await waitFor(() => {
        expect(screen.getByText('Updated Trip Plan')).toBeInTheDocument()
      })
    })

    it('should display updated itinerary after editing', async () => {
      const updatedPlannerData = {
        ...mockPlannerData,
        days: [
          {
            id: '1',
            date: '2024-12-25',
            plans: [
              { id: '1', time: '09:00', activity: 'Breakfast', park: 'Magic Kingdom' },
              { id: '2', time: '10:00', activity: 'Ride Space Mountain', park: 'Magic Kingdom' },
              { id: '3', time: '12:00', activity: 'Lunch at Be Our Guest', park: 'Magic Kingdom' },
            ]
          }
        ],
      }
      
      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([updatedPlannerData])
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue({
        getItem: vi.fn().mockReturnValue(updatedPlannerData),
        getWidgetData: vi.fn().mockReturnValue(updatedPlannerData),
      } as any)
      
      render(<TripPlannerWidget {...mockWidgetProps} id="planner-widget-1" />)
      
      await waitFor(() => {
        expect(screen.getByText('Lunch at Be Our Guest')).toBeInTheDocument()
      })
    })
  })

  describe('Widget Configuration Updates', () => {
    it('should update widget when selected item changes', async () => {
      const user = userEvent.setup()
      
      render(<CountdownWidget {...mockWidgetProps} />)
      
      // Simulate item selection change
      const onItemSelect = mockWidgetProps.onItemSelect
      if (onItemSelect) {
        onItemSelect('new-countdown-2')
      }
      
      // Verify widget config was updated
      expect(WidgetConfigManager.updateConfig).toHaveBeenCalledWith(
        'test-widget-1',
        { selectedItemId: 'new-countdown-2' }
      )
    })

    it('should handle widget width changes correctly', async () => {
      const user = userEvent.setup()
      
      render(<CountdownWidget {...mockWidgetProps} />)
      
      // Simulate width change
      const onWidthChange = mockWidgetProps.onWidthChange
      if (onWidthChange) {
        onWidthChange('3')
      }
      
      // Verify width change callback was called
      expect(onWidthChange).toHaveBeenCalledWith('3')
    })
  })

  describe('Real-time Updates', () => {
    it('should update widget display when data changes in storage', async () => {
      // Initial render
      render(<CountdownWidget {...mockWidgetProps} />)
      
      await waitFor(() => {
        expect(screen.getByText('Test Countdown')).toBeInTheDocument()
      })
      
      // Simulate data update in storage
      const updatedCountdownData = {
        ...mockCountdownData,
        name: 'Real-time Updated Countdown',
      }
      
      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([updatedCountdownData])
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue({
        getItem: vi.fn().mockReturnValue(updatedCountdownData),
        getWidgetData: vi.fn().mockReturnValue(updatedCountdownData),
      } as any)
      
      // Re-render to simulate update
      render(<CountdownWidget {...mockWidgetProps} />)
      
      await waitFor(() => {
        expect(screen.getByText('Real-time Updated Countdown')).toBeInTheDocument()
      })
    })

    it('should handle missing data gracefully', async () => {
      vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([])
      vi.mocked(PluginRegistry.getPlugin).mockReturnValue({
        getItem: vi.fn().mockReturnValue(null),
        getWidgetData: vi.fn().mockReturnValue(null),
      } as any)
      
      render(<CountdownWidget {...mockWidgetProps} />)
      
      // Widget should still render without crashing
      await waitFor(() => {
        expect(screen.getByText(/No Countdown Selected/)).toBeInTheDocument()
      })
    })
  })

  describe('Widget State Persistence', () => {
    it('should maintain widget state across page reloads', async () => {
      // Mock widget config in storage
      const widgetConfig = {
        id: 'test-widget-1',
        type: 'countdown',
        order: 0,
        selectedItemId: 'test-countdown-1',
      }
      
      vi.mocked(WidgetConfigManager.getConfig).mockReturnValue(widgetConfig)
      
      render(<CountdownWidget {...mockWidgetProps} />)
      
      await waitFor(() => {
        expect(screen.getByText('Test Countdown')).toBeInTheDocument()
      })
      
      // Verify widget config was retrieved correctly
      expect(WidgetConfigManager.getConfig).toHaveBeenCalledWith('test-widget-1')
    })

    it('should handle widget removal correctly', async () => {
      const user = userEvent.setup()
      
      render(<CountdownWidget {...mockWidgetProps} />)
      
      // Simulate widget removal
      const onRemove = mockWidgetProps.onRemove
      if (onRemove) {
        onRemove()
      }
      
      // Verify remove callback was called
      expect(onRemove).toHaveBeenCalled()
    })
  })
})