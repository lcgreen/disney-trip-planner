import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRedux } from './testUtils'
import PackingChecklist from '@/components/PackingChecklist'

// Mock the widget config manager
vi.mock('@/lib/widgetConfig', () => ({
  WidgetConfigManager: {
    getSelectedItemData: vi.fn(),
  },
}))

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

// Mock window events
Object.defineProperty(window, 'addEventListener', {
  value: vi.fn(),
  writable: true,
})

Object.defineProperty(window, 'removeEventListener', {
  value: vi.fn(),
  writable: true,
})

describe('Redux PackingChecklist', () => {
  let initialPackingData: any

  beforeEach(() => {
    vi.clearAllMocks()
    initialPackingData = {
      id: 'test-packing-1',
      name: 'Test Packing List',
      items: [
        { id: '1', name: 'Passport', checked: true, category: 'Documents' },
        { id: '2', name: 'Phone Charger', checked: false, category: 'Electronics' },
        { id: '3', name: 'Sunscreen', checked: false, category: 'Toiletries' },
      ],
      selectedWeather: ['sunny', 'warm'],
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

    it('should render packing checklist with Redux state', async () => {
    const { WidgetConfigManager } = await import('@/lib/widgetConfig')

    vi.mocked(WidgetConfigManager.getSelectedItemData).mockReturnValue(initialPackingData)

    const preloadedState = {
      user: premiumUserState,
      packing: {
        items: [initialPackingData], // List of packing lists
        packingItems: initialPackingData.items, // Current packing items
        selectedWeather: initialPackingData.selectedWeather,
        filterCategory: 'all',
        showAddItem: false,
        newItem: { name: '', category: 'Documents', isEssential: false },
        completionStats: {
          total: initialPackingData.items.length,
          completed: initialPackingData.items.filter((item: any) => item.checked).length,
          essential: 0,
          completedEssential: 0
        },
        currentItem: initialPackingData,
        isLoading: false,
        error: null,
        lastSaved: null,
        isSaving: false,
      },
      widgets: {
        configs: [{
          id: 'packing-widget-1',
          type: 'packing',
          order: 0,
          selectedItemId: 'test-packing-1',
          size: 'medium',
          settings: {},
        }],
        isLoading: false,
        error: null,
        pendingLinks: {},
      },
    }

    renderWithRedux(
      <PackingChecklist
        createdItemId="test-packing-1"
        widgetId="packing-widget-1"
        isEditMode={false}
      />,
      { preloadedState }
    )

    await waitFor(() => {
      expect(screen.getByText('Disney Packing Checklist')).toBeInTheDocument()
    })
  })

    it('should display packing items from Redux state', async () => {
    const { WidgetConfigManager } = await import('@/lib/widgetConfig')

    vi.mocked(WidgetConfigManager.getSelectedItemData).mockReturnValue(initialPackingData)

    const preloadedState = {
      user: premiumUserState,
      packing: {
        items: [initialPackingData], // List of packing lists
        packingItems: initialPackingData.items, // Current packing items
        selectedWeather: initialPackingData.selectedWeather,
        filterCategory: 'all',
        showAddItem: false,
        newItem: { name: '', category: 'Documents', isEssential: false },
        completionStats: {
          total: initialPackingData.items.length,
          completed: initialPackingData.items.filter((item: any) => item.checked).length,
          essential: 0,
          completedEssential: 0
        },
        currentItem: initialPackingData,
        isLoading: false,
        error: null,
        lastSaved: null,
        isSaving: false,
      },
      widgets: {
        configs: [{
          id: 'packing-widget-1',
          type: 'packing',
          order: 0,
          selectedItemId: 'test-packing-1',
          size: 'medium',
          settings: {},
        }],
        isLoading: false,
        error: null,
        pendingLinks: {},
      },
    }

    renderWithRedux(
      <PackingChecklist
        createdItemId="test-packing-1"
        widgetId="packing-widget-1"
        isEditMode={false}
      />,
      { preloadedState }
    )

    await waitFor(() => {
      expect(screen.getByText('Passport')).toBeInTheDocument()
      expect(screen.getByText('Phone Charger')).toBeInTheDocument()
      expect(screen.getByText('Sunscreen')).toBeInTheDocument()
    })
  })

    it('should display weather conditions from Redux state', async () => {
    const { WidgetConfigManager } = await import('@/lib/widgetConfig')

    vi.mocked(WidgetConfigManager.getSelectedItemData).mockReturnValue(initialPackingData)

    const preloadedState = {
      user: premiumUserState,
      packing: {
        items: [initialPackingData], // List of packing lists
        packingItems: initialPackingData.items, // Current packing items
        selectedWeather: initialPackingData.selectedWeather,
        filterCategory: 'all',
        showAddItem: false,
        newItem: { name: '', category: 'Documents', isEssential: false },
        completionStats: {
          total: initialPackingData.items.length,
          completed: initialPackingData.items.filter((item: any) => item.checked).length,
          essential: 0,
          completedEssential: 0
        },
        currentItem: initialPackingData,
        isLoading: false,
        error: null,
        lastSaved: null,
        isSaving: false,
      },
      widgets: {
        configs: [{
          id: 'packing-widget-1',
          type: 'packing',
          order: 0,
          selectedItemId: 'test-packing-1',
          size: 'medium',
          settings: {},
        }],
        isLoading: false,
        error: null,
        pendingLinks: {},
      },
    }

    renderWithRedux(
      <PackingChecklist
        createdItemId="test-packing-1"
        widgetId="packing-widget-1"
        isEditMode={false}
      />,
      { preloadedState }
    )

    await waitFor(() => {
      expect(screen.getByText('Expected Weather Conditions')).toBeInTheDocument()
      expect(screen.getByText(/Sunny/)).toBeInTheDocument()
      expect(screen.getByText(/Warm/)).toBeInTheDocument()
      expect(screen.getByText(/Rainy/)).toBeInTheDocument()
    })
  })

    it('should load existing packing data in edit mode', async () => {
    const { WidgetConfigManager } = await import('@/lib/widgetConfig')

    vi.mocked(WidgetConfigManager.getSelectedItemData).mockReturnValue(initialPackingData)

    const preloadedState = {
      user: premiumUserState,
      packing: {
        items: [], // Empty list initially
        packingItems: [], // Empty packing items initially
        selectedWeather: [],
        filterCategory: 'all',
        showAddItem: false,
        newItem: { name: '', category: 'Documents', isEssential: false },
        completionStats: {
          total: 0,
          completed: 0,
          essential: 0,
          completedEssential: 0
        },
        currentItem: null,
        isLoading: false,
        error: null,
        lastSaved: null,
        isSaving: false,
      },
      widgets: {
        configs: [{
          id: 'packing-widget-1',
          type: 'packing',
          order: 0,
          selectedItemId: 'test-packing-1',
          size: 'medium',
          settings: {},
        }],
        isLoading: false,
        error: null,
        pendingLinks: {},
      },
    }

    renderWithRedux(
      <PackingChecklist
        createdItemId="test-packing-1"
        widgetId="packing-widget-1"
        isEditMode={true}
        name="Test Packing List"
      />,
      { preloadedState }
    )

    await waitFor(() => {
      expect(screen.getByText('Disney Packing Checklist')).toBeInTheDocument()
    })

    // Verify that the widget config manager was called to get the selected item data
    expect(WidgetConfigManager.getSelectedItemData).toHaveBeenCalledWith('packing', 'test-packing-1')
  })
})