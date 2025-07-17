import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRedux } from './testUtils'
import DashboardPage from '@/app/dashboard/page'

// Mock the plugin system
vi.mock('@/lib/pluginSystem', () => ({
  PluginRegistry: {
    getAllPlugins: vi.fn(() => [
      {
        config: {
          widgetType: 'countdown',
          name: 'Countdown Timer',
          description: 'Track time until your Disney trip',
          icon: '⏰',
          color: 'from-blue-500 to-purple-500',
          requiredLevel: undefined
        }
      },
      {
        config: {
          widgetType: 'planner',
          name: 'Trip Planner',
          description: 'Plan your Disney adventure',
          icon: '🗺️',
          color: 'from-green-500 to-teal-500',
          requiredLevel: 'standard'
        }
      },
      {
        config: {
          widgetType: 'budget',
          name: 'Budget Tracker',
          description: 'Track your Disney expenses',
          icon: '💰',
          color: 'from-yellow-500 to-orange-500',
          requiredLevel: 'standard'
        }
      },
      {
        config: {
          widgetType: 'packing',
          name: 'Packing List',
          description: 'Pack for your Disney trip',
          icon: '🧳',
          color: 'from-purple-500 to-pink-500',
          requiredLevel: 'premium'
        }
      }
    ]),
    register: vi.fn(),
    getPlugin: vi.fn()
  }
}))

// Mock the widget migration
vi.mock('@/lib/widgetMigration', () => ({
  migrateWidgetData: vi.fn(),
  ensureDemoDashboard: vi.fn()
}))

describe('Redux DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render DashboardPage with Redux Provider', () => {
    renderWithRedux(<DashboardPage />)

    // Check for dashboard header
    expect(screen.getByTestId('dashboard-header')).toBeInTheDocument()
    expect(screen.getByTestId('dashboard-title')).toHaveTextContent('Disney Countdown Dashboard')
    expect(screen.getByTestId('dashboard-description')).toBeInTheDocument()

    // Check for user badges and action buttons
    expect(screen.getByTestId('user-badges')).toBeInTheDocument()
    expect(screen.getByTestId('add-widget-button')).toBeInTheDocument()
    expect(screen.getByTestId('manage-widgets-button')).toBeInTheDocument()
  })

  it('should display anonymous user badge and disable actions for anonymous users', () => {
    renderWithRedux(<DashboardPage />)

    // Check for anonymous user badge
    expect(screen.getByText('Anonymous')).toBeInTheDocument()

    // Check that action buttons are disabled for anonymous users
    const addWidgetButton = screen.getByTestId('add-widget-button')
    const manageWidgetsButton = screen.getByTestId('manage-widgets-button')

    expect(addWidgetButton).toBeDisabled()
    expect(manageWidgetsButton).toBeDisabled()
  })

  it('should display standard user badge and enable actions for standard users', () => {
    const preloadedState = {
      user: {
        currentUser: { id: '1', level: 'standard' },
        isLoading: false,
        error: null
      }
    }

    renderWithRedux(<DashboardPage />, { preloadedState })

    // Check for standard user badge
    expect(screen.getByText('Standard')).toBeInTheDocument()

    // Check that action buttons are enabled for standard users
    const addWidgetButton = screen.getByTestId('add-widget-button')
    const manageWidgetsButton = screen.getByTestId('manage-widgets-button')

    expect(addWidgetButton).not.toBeDisabled()
    expect(manageWidgetsButton).not.toBeDisabled()
  })

  it('should display premium user badge for premium users', () => {
    const preloadedState = {
      user: {
        currentUser: { id: '1', level: 'premium' },
        isLoading: false,
        error: null
      }
    }

    renderWithRedux(<DashboardPage />, { preloadedState })

    // Check for premium user badge
    expect(screen.getByText('Premium')).toBeInTheDocument()
  })

  it('should show loading state when widgets are loading', () => {
    const preloadedState = {
      widgets: {
        configs: [],
        isLoading: true,
        error: null,
        pendingLinks: {}
      }
    }

    renderWithRedux(<DashboardPage />, { preloadedState })

    // Check for loading indicator
    expect(screen.getByText('Loading widgets...')).toBeInTheDocument()
  })

  it('should display widgets when they exist in state', () => {
    const preloadedState = {
      widgets: {
        configs: [
          {
            id: 'countdown-1',
            type: 'countdown',
            size: 'medium',
            order: 0,
            width: undefined,
            selectedItemId: undefined,
            settings: {}
          }
        ],
        isLoading: false,
        error: null,
        pendingLinks: {}
      }
    }

    renderWithRedux(<DashboardPage />, { preloadedState })

    // Check that widget is rendered (widget components should be present)
    // Note: We can't test specific widget content without mocking the widget components
    // But we can verify the dashboard structure is intact
    expect(screen.getByTestId('dashboard-header')).toBeInTheDocument()
  })

  it('should handle widget removal for authenticated users', async () => {
    const user = userEvent.setup()
    const preloadedState = {
      user: {
        currentUser: { id: '1', level: 'standard' },
        isLoading: false,
        error: null
      },
      widgets: {
        configs: [
          {
            id: 'countdown-1',
            type: 'countdown',
            size: 'medium',
            order: 0,
            width: undefined,
            selectedItemId: undefined,
            settings: {}
          }
        ],
        isLoading: false,
        error: null,
        pendingLinks: {}
      }
    }

    renderWithRedux(<DashboardPage />, { preloadedState })

    // Open manage widgets dialog
    const manageWidgetsButton = screen.getByTestId('manage-widgets-button')
    await user.click(manageWidgetsButton)

    // Note: The actual widget removal would require more complex setup
    // This test verifies the button is clickable for authenticated users
    expect(manageWidgetsButton).not.toBeDisabled()
  })

  it('should handle widget addition for authenticated users', async () => {
    const user = userEvent.setup()
    const preloadedState = {
      user: {
        currentUser: { id: '1', level: 'standard' },
        isLoading: false,
        error: null
      }
    }

    renderWithRedux(<DashboardPage />, { preloadedState })

    // Click add widget button
    const addWidgetButton = screen.getByTestId('add-widget-button')
    await user.click(addWidgetButton)

    // Note: The actual widget addition would require more complex setup
    // This test verifies the button is clickable for authenticated users
    expect(addWidgetButton).not.toBeDisabled()
  })

  it('should display error state when widgets fail to load', () => {
    const preloadedState = {
      widgets: {
        configs: [],
        isLoading: false,
        error: 'Failed to load widgets',
        pendingLinks: {}
      }
    }

    renderWithRedux(<DashboardPage />, { preloadedState })

    // Check for error message (prefix included)
    expect(screen.getByText((content) => content.includes('Failed to load widgets'))).toBeInTheDocument()
  })

  it('should maintain dashboard structure across different user levels', () => {
    const userLevels = ['anon', 'standard', 'premium']

    userLevels.forEach(level => {
      const preloadedState = {
        user: {
          currentUser: level === 'anon' ? null : { id: '1', level },
          isLoading: false,
          error: null
        }
      }

      const { unmount } = renderWithRedux(<DashboardPage />, { preloadedState })

      // Verify core dashboard structure is always present
      expect(screen.getByTestId('dashboard-header')).toBeInTheDocument()
      expect(screen.getByTestId('dashboard-title')).toBeInTheDocument()
      expect(screen.getByTestId('dashboard-description')).toBeInTheDocument()
      expect(screen.getByTestId('user-badges')).toBeInTheDocument()
      expect(screen.getByTestId('add-widget-button')).toBeInTheDocument()
      expect(screen.getByTestId('manage-widgets-button')).toBeInTheDocument()

      unmount()
    })
  })
})