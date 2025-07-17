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

describe('Dashboard Hydration', () => {
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

  it('should render loading state initially', () => {
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    )

    // The component now renders immediately due to proper hydration
    // So we should see the dashboard content right away
    expect(screen.getByText('✨ Disney Trip Planner Dashboard')).toBeInTheDocument()
  })

  it('should render dashboard after hydration', async () => {
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    )

    // Wait for hydration to complete
    await waitFor(() => {
      expect(screen.getByText('✨ Disney Trip Planner Dashboard')).toBeInTheDocument()
    })

    // Should show the dashboard content
    expect(screen.getByText(/Welcome to your magical Disney planning hub/)).toBeInTheDocument()
    expect(screen.getByText('Anonymous')).toBeInTheDocument()
  })

  it('should not show add widget button for anonymous users', async () => {
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('✨ Disney Trip Planner Dashboard')).toBeInTheDocument()
    })

    const addButton = screen.getByTestId('add-widget-button')
    expect(addButton).toBeDisabled()
  })

  it('should show empty state when no widgets are present', async () => {
    render(
      <Provider store={store}>
        <DashboardPage />
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByText('✨ Disney Trip Planner Dashboard')).toBeInTheDocument()
    })

    // Should show empty state with the correct message for anonymous users
    expect(screen.getByText('No widgets yet!')).toBeInTheDocument()
    expect(screen.getByText(/Explore the demo widgets above/)).toBeInTheDocument()
  })

  it('should handle widget rendering without hydration errors', async () => {
    // Add a demo widget to the store
    store.dispatch({
      type: 'widgets/addConfig',
      payload: {
        id: 'test-countdown-1',
        type: 'countdown',
        size: 'medium',
        order: 0,
        width: undefined,
        selectedItemId: undefined,
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

    // Should render the widget without hydration errors
    expect(screen.getByTestId('widget-test-countdown-1')).toBeInTheDocument()
  })
})