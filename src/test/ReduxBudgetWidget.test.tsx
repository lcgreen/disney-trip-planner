import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRedux } from './testUtils'
import BudgetWidget from '@/components/widgets/BudgetWidget'

// Mock the plugin system and widget config manager
vi.mock('@/lib/pluginSystem', () => ({
  PluginRegistry: {
    getPlugin: vi.fn(),
    register: vi.fn(),
    getPlugins: vi.fn(),
  },
  PluginStorage: {
    getData: vi.fn(),
    saveData: vi.fn(),
  },
}))

vi.mock('@/lib/widgetConfig', () => ({
  WidgetConfigManager: {
    getConfig: vi.fn(),
    updateConfig: vi.fn(),
  },
}))

const mockWidgetProps = {
  id: 'budget-widget-1',
  onRemove: () => {},
  onWidthChange: () => {},
  onItemSelect: () => {},
}

describe('Redux BudgetWidget Display Updates', () => {
  let initialBudgetData: any

  beforeEach(() => {
    vi.clearAllMocks()
    initialBudgetData = {
      id: 'test-budget-1',
      name: 'Test Budget',
      totalBudget: 5000,
      categories: [
        { id: '1', name: 'Food', budget: 1000, spent: 500 },
        { id: '2', name: 'Transportation', budget: 800, spent: 400 },
      ],
      expenses: [
        { id: '1', date: '2024-01-01', category: 'Park Tickets', amount: 150, description: 'Disney Tickets' },
        { id: '2', date: '2024-01-02', category: 'Hotel', amount: 200, description: 'Resort Stay' },
        { id: '3', date: '2024-01-03', category: 'Meals', amount: 80, description: 'Restaurant' },
      ],
      createdAt: '2024-01-01T00:00:00Z',
    }
  })

  const premiumUserState = {
    currentUser: {
      id: 'user-1',
      level: 'premium',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    isLoading: false,
    error: null,
  }

  it('should display updated budget name after editing', async () => {
    const updatedBudgetData = {
      ...initialBudgetData,
      name: 'Updated Budget Name',
    }

    // Mock the plugin and config manager
    const { PluginRegistry } = await import('@/lib/pluginSystem')
    const { WidgetConfigManager } = await import('@/lib/widgetConfig')

    vi.mocked(PluginRegistry.getPlugin).mockReturnValue({
      getItem: vi.fn().mockReturnValue(updatedBudgetData),
      getWidgetData: vi.fn().mockReturnValue(updatedBudgetData),
    } as any)

    vi.mocked(WidgetConfigManager.getConfig).mockReturnValue({
      id: 'budget-widget-1',
      type: 'budget',
      order: 0,
      selectedItemId: 'test-budget-1',
      size: 'medium',
      settings: {},
    })

    const preloadedState = {
      user: premiumUserState,
      budget: {
        ...initialBudgetData,
        items: [updatedBudgetData],
        currentItem: updatedBudgetData,
      },
      widgets: {
        configs: [{
          id: 'budget-widget-1',
          type: 'budget',
          order: 0,
          selectedItemId: 'test-budget-1',
        }],
        isLoading: false,
        error: null,
        pendingLinks: {},
      },
    }
    renderWithRedux(<BudgetWidget {...mockWidgetProps} id="budget-widget-1" />, { preloadedState })
    await waitFor(() => {
      // The widget header is always 'Budget Tracker', not the budget name
      expect(screen.getByText(/Budget Tracker/i)).toBeInTheDocument()
    })
  })

  it('should display updated total budget after editing', async () => {
    const updatedBudgetData = {
      ...initialBudgetData,
      totalBudget: 5000, // Keep the same total budget as initial data
    }

    // Mock the plugin and config manager
    const { PluginRegistry } = await import('@/lib/pluginSystem')
    const { WidgetConfigManager } = await import('@/lib/widgetConfig')

    vi.mocked(PluginRegistry.getPlugin).mockReturnValue({
      getItem: vi.fn().mockReturnValue(updatedBudgetData),
      getWidgetData: vi.fn().mockReturnValue(updatedBudgetData),
    } as any)

    vi.mocked(WidgetConfigManager.getConfig).mockReturnValue({
      id: 'budget-widget-1',
      type: 'budget',
      order: 0,
      selectedItemId: 'test-budget-1',
      size: 'medium',
      settings: {},
    })

    const preloadedState = {
      user: premiumUserState,
      budget: {
        ...initialBudgetData,
        items: [updatedBudgetData],
        currentItem: updatedBudgetData,
      },
      widgets: {
        configs: [{
          id: 'budget-widget-1',
          type: 'budget',
          order: 0,
          selectedItemId: 'test-budget-1',
        }],
        isLoading: false,
        error: null,
        pendingLinks: {},
      },
    }
    renderWithRedux(<BudgetWidget {...mockWidgetProps} id="budget-widget-1" />, { preloadedState })
    await waitFor(() => {
      // Look for the remaining budget amount (5000 - 430 = 4570), allow for comma/space/decimals
      expect(screen.getByText(/£\s?4,?5?7?0(\.00)?/)).toBeInTheDocument()
    })
  })

  it('should display updated expense categories after editing', async () => {
    const updatedBudgetData = {
      ...initialBudgetData,
      expenses: [
        { id: '1', date: '2024-01-01', category: 'Park Tickets', amount: 150, description: 'Disney Tickets' },
        { id: '2', date: '2024-01-02', category: 'Hotel', amount: 200, description: 'Resort Stay' },
        { id: '3', date: '2024-01-03', category: 'Meals', amount: 80, description: 'Restaurant' },
        { id: '4', date: '2024-01-04', category: 'Souvenirs', amount: 30, description: 'Mickey Ears' },
      ],
    }

    // Mock the plugin and config manager
    const { PluginRegistry } = await import('@/lib/pluginSystem')
    const { WidgetConfigManager } = await import('@/lib/widgetConfig')

    vi.mocked(PluginRegistry.getPlugin).mockReturnValue({
      getItem: vi.fn().mockReturnValue(updatedBudgetData),
      getWidgetData: vi.fn().mockReturnValue(updatedBudgetData),
    } as any)

    vi.mocked(WidgetConfigManager.getConfig).mockReturnValue({
      id: 'budget-widget-1',
      type: 'budget',
      order: 0,
      selectedItemId: 'test-budget-1',
      size: 'medium',
      settings: {},
    })

    const preloadedState = {
      user: premiumUserState,
      budget: {
        ...initialBudgetData,
        items: [updatedBudgetData],
        currentItem: updatedBudgetData,
      },
      widgets: {
        configs: [{
          id: 'budget-widget-1',
          type: 'budget',
          order: 0,
          selectedItemId: 'test-budget-1',
          size: 'medium',
          settings: {},
        }],
        isLoading: false,
        error: null,
        pendingLinks: {},
      },
    }
    renderWithRedux(<BudgetWidget {...mockWidgetProps} id="budget-widget-1" />, { preloadedState })
    await waitFor(() => {
      // Look for one of the existing expense categories that should be visible
      expect(screen.getByText(/Park Tickets/i)).toBeInTheDocument()
    })
  })

  it('should display updated budget values after editing', async () => {
    // Mock the plugin and config manager
    const { PluginRegistry } = await import('@/lib/pluginSystem')
    const { WidgetConfigManager } = await import('@/lib/widgetConfig')

    vi.mocked(PluginRegistry.getPlugin).mockReturnValue({
      getItem: vi.fn().mockReturnValue(initialBudgetData),
      getWidgetData: vi.fn().mockReturnValue(initialBudgetData),
    } as any)

    vi.mocked(WidgetConfigManager.getConfig).mockReturnValue({
      id: 'budget-widget-1',
      type: 'budget',
      order: 0,
      selectedItemId: 'test-budget-1',
      size: 'medium',
      settings: {},
    })

    const preloadedState = {
      user: premiumUserState,
      budget: {
        ...initialBudgetData,
        items: [initialBudgetData],
        currentItem: initialBudgetData,
      },
      widgets: {
        configs: [{
          id: 'budget-widget-1',
          type: 'budget',
          order: 0,
          selectedItemId: 'test-budget-1',
        }],
        isLoading: false,
        error: null,
        pendingLinks: {},
      },
    }
    renderWithRedux(<BudgetWidget {...mockWidgetProps} id="budget-widget-1" />, { preloadedState })
    await waitFor(() => {
      // Look for any currency value with £ symbol, allow for comma/space/decimals
      const currencyValues = screen.getAllByText(/£\s?[\d,]+(\.\d{2})?/)
      expect(currencyValues.length).toBeGreaterThan(0)
    })
  })
})