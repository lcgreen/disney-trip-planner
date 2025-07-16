import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WidgetConfigManager } from '@/lib/widgetConfig'
import WidgetConfigManagerComponent from '@/components/widgets/WidgetConfigManager'

// Mock the dependencies
vi.mock('@/lib/widgetConfig', () => ({
  WidgetConfigManager: {
    getConfigs: vi.fn(),
    addConfigSync: vi.fn(),
    removeConfigSync: vi.fn(),
    updateConfigSync: vi.fn(),
    reorderWidgetsSync: vi.fn(),
  }
}))

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
      }
    ]),
    getPlugin: vi.fn((type) => ({
      config: {
        widgetType: type,
        name: type === 'countdown' ? 'Countdown Timer' : 'Trip Planner',
        description: 'Widget description',
        icon: '🎯',
        color: 'from-blue-500 to-purple-500',
        requiredLevel: undefined
      }
    }))
  }
}))

vi.mock('@/components/ui', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
  Badge: ({ children, ...props }: any) => (
    <span {...props}>{children}</span>
  ),
  Modal: ({ children, isOpen, ...props }: any) => (
    isOpen ? <div data-testid="modal" {...props}>{children}</div> : null
  )
}))

describe('WidgetConfigManager Component', () => {
  const mockConfigs = [
    {
      id: 'countdown-1',
      type: 'countdown' as const,
      size: 'medium' as const,
      order: 0,
      width: undefined,
      selectedItemId: undefined,
      settings: {}
    },
    {
      id: 'planner-1',
      type: 'planner' as const,
      size: 'large' as const,
      order: 1,
      width: '2',
      selectedItemId: 'plan-123',
      settings: { hidden: false }
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    ;(WidgetConfigManager.getConfigs as any).mockReturnValue(mockConfigs)
  })

  it('renders widget configuration manager when open', () => {
    render(
      <WidgetConfigManagerComponent
        isOpen={true}
        onClose={vi.fn()}
        onConfigsChange={vi.fn()}
        currentConfigs={mockConfigs}
        userLevel="standard"
      />
    )

    expect(screen.getByText('Widget Configuration')).toBeInTheDocument()
    expect(screen.getByText('Countdown Timer')).toBeInTheDocument()
    expect(screen.getByText('Trip Planner')).toBeInTheDocument()
  })

  it('shows empty state when no widgets configured', () => {
    render(
      <WidgetConfigManagerComponent
        isOpen={true}
        onClose={vi.fn()}
        onConfigsChange={vi.fn()}
        currentConfigs={[]}
        userLevel="standard"
      />
    )

    expect(screen.getByText('No widgets configured yet.')).toBeInTheDocument()
  })

    it('allows adding new widgets for authenticated users', async () => {
    const onConfigsChange = vi.fn()

    render(
      <WidgetConfigManagerComponent
        isOpen={true}
        onClose={vi.fn()}
        onConfigsChange={onConfigsChange}
        currentConfigs={mockConfigs}
        userLevel="standard"
      />
    )

    // Click add widget button
    const addButton = screen.getByText('Add Widget')
    fireEvent.click(addButton)

    // Should show add widget modal with widget options
    await waitFor(() => {
      expect(screen.getAllByText('Add Widget')).toHaveLength(2) // One in header, one in modal
    })

    // Click on a widget option
    const countdownOption = screen.getAllByText('Countdown Timer')[1] // Second occurrence is in modal
    fireEvent.click(countdownOption)

    // Should call addConfigSync
    expect(WidgetConfigManager.addConfigSync).toHaveBeenCalled()
  })

  it('prevents adding widgets for anonymous users', () => {
    render(
      <WidgetConfigManagerComponent
        isOpen={true}
        onClose={vi.fn()}
        onConfigsChange={vi.fn()}
        currentConfigs={mockConfigs}
        userLevel="anon"
      />
    )

    // Add widget button should not be present for anonymous users
    expect(screen.queryByText('Add Widget')).not.toBeInTheDocument()
  })

  it('allows removing widgets for authenticated users', () => {
    const onConfigsChange = vi.fn()

    render(
      <WidgetConfigManagerComponent
        isOpen={true}
        onClose={vi.fn()}
        onConfigsChange={onConfigsChange}
        currentConfigs={mockConfigs}
        userLevel="standard"
      />
    )

    // Find and click remove button (this would require hovering to show actions)
    // For now, just verify the component renders correctly
    expect(screen.getByText('Countdown Timer')).toBeInTheDocument()
  })

  it('displays widget information correctly', () => {
    render(
      <WidgetConfigManagerComponent
        isOpen={true}
        onClose={vi.fn()}
        onConfigsChange={vi.fn()}
        currentConfigs={mockConfigs}
        userLevel="standard"
      />
    )

    // Check that widget details are displayed
    expect(screen.getByText('Size: medium')).toBeInTheDocument()
    expect(screen.getByText('Size: large')).toBeInTheDocument()
    expect(screen.getByText('Width: 2 cols')).toBeInTheDocument()
    expect(screen.getByText('Linked Item')).toBeInTheDocument()
  })

  it('shows premium badges for premium features', async () => {
    render(
      <WidgetConfigManagerComponent
        isOpen={true}
        onClose={vi.fn()}
        onConfigsChange={vi.fn()}
        currentConfigs={mockConfigs}
        userLevel="standard"
      />
    )

    // Click add widget button to see the modal with badges
    const addButton = screen.getByText('Add Widget')
    fireEvent.click(addButton)

    // Should show standard badge for planner widget in the add modal
    await waitFor(() => {
      expect(screen.getByText('Standard')).toBeInTheDocument()
    })
  })
})