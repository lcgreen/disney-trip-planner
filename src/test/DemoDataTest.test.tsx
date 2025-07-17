import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import userReducer from '@/store/slices/userSlice'
import widgetsReducer from '@/store/slices/widgetsSlice'
import countdownReducer from '@/store/slices/countdownSlice'
import budgetReducer from '@/store/slices/budgetSlice'
import packingReducer from '@/store/slices/packingSlice'
import plannerReducer from '@/store/slices/plannerSlice'
import uiReducer from '@/store/slices/uiSlice'
import DashboardPage from '@/app/dashboard/page'
import { UserLevel } from '@/lib/userManagement'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock the plugin system
vi.mock('@/lib/pluginSystem', () => ({
  PluginRegistry: {
    getAllPlugins: vi.fn(() => []),
    getPlugin: vi.fn(() => null),
    register: vi.fn()
  }
}))

// Mock the widget migration
vi.mock('@/lib/widgetMigration', () => ({
  migrateWidgetData: vi.fn(),
  ensureDemoDashboard: vi.fn()
}))

// Mock the unified storage
vi.mock('@/lib/unifiedStorage', () => ({
  UnifiedStorage: {
    getPluginItems: vi.fn(() => []),
    savePluginItems: vi.fn()
  }
}))

describe('Demo Data Loading', () => {
  let store: ReturnType<typeof configureStore>

  beforeEach(() => {
    // Create a fresh store for each test
    store = configureStore({
      reducer: {
        user: userReducer,
        widgets: widgetsReducer,
        countdown: countdownReducer,
        budget: budgetReducer,
        packing: packingReducer,
        planner: plannerReducer,
        ui: uiReducer,
      },
      preloadedState: {
        user: {
          currentUser: {
            id: 'anon-1',
            level: UserLevel.ANON,
            email: undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          isLoading: false,
          error: null
        },
        widgets: {
          configs: [],
          isLoading: false,
          error: null,
          pendingLinks: {}
        }
      }
    })

    // Clear all mocks
    vi.clearAllMocks()
  })

  it('should show demo call to action for anonymous users', async () => {
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('✨ Experience the Full Magic!')).toBeInTheDocument()
    })

    // Should show the call to action features
    expect(screen.getByText('Save Your Plans')).toBeInTheDocument()
    expect(screen.getByText('Unlimited Items')).toBeInTheDocument()
    expect(screen.getByText('Premium Features')).toBeInTheDocument()
  })

  it('should show sign up button for anonymous users', async () => {
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('Sign Up Free')).toBeInTheDocument()
    })
  })

  it('should show demo widgets when loaded', async () => {
    // Add demo widgets to the store
    store.dispatch({
      type: 'widgets/addConfig',
      payload: {
        id: 'demo-countdown-1',
        type: 'countdown',
        size: 'medium',
        order: 0,
        width: '2',
        selectedItemId: 'demo-countdown-item-1',
        settings: {}
      }
    })

    store.dispatch({
      type: 'widgets/addConfig',
      payload: {
        id: 'demo-budget-1',
        type: 'budget',
        size: 'medium',
        order: 1,
        width: '2',
        selectedItemId: 'demo-budget-item-1',
        settings: {}
      }
    })

    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('✨ Disney Trip Planner Dashboard')).toBeInTheDocument()
    })

    // Should show demo widgets
    expect(screen.getByTestId('widget-demo-countdown-1')).toBeInTheDocument()
    expect(screen.getByTestId('widget-demo-budget-1')).toBeInTheDocument()
  })

  it('should not show empty state when demo widgets are present', async () => {
    // Add a demo widget to the store
    store.dispatch({
      type: 'widgets/addConfig',
      payload: {
        id: 'demo-countdown-1',
        type: 'countdown',
        size: 'medium',
        order: 0,
        width: '2',
        selectedItemId: 'demo-countdown-item-1',
        settings: {}
      }
    })

    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('✨ Disney Trip Planner Dashboard')).toBeInTheDocument()
    })

    // Should not show empty state
    expect(screen.queryByText('No widgets yet!')).not.toBeInTheDocument()
  })

  it('should show encouraging message for anonymous users in empty state', async () => {
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('✨ Disney Trip Planner Dashboard')).toBeInTheDocument()
    })

    // Should show encouraging message for anonymous users
    expect(screen.getByText(/Explore the demo widgets above/)).toBeInTheDocument()
    expect(screen.getByText('Sign Up to Create Widgets')).toBeInTheDocument()
  })
})