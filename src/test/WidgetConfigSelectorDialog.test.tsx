import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import WidgetConfigSelectorDialog from '@/components/widgets/WidgetConfigSelectorDialog'
import { PluginRegistry } from '@/lib/pluginSystem'

// Mock the plugin system
vi.mock('@/lib/pluginSystem', () => ({
  PluginRegistry: {
    getPlugin: vi.fn(),
    register: vi.fn()
  }
}))

describe('WidgetConfigSelectorDialog', () => {
  const mockOnClose = vi.fn()
  const mockOnSelect = vi.fn()
  const mockOnEdit = vi.fn()
  const mockOnCreateNew = vi.fn()

  const mockItems = [
    {
      id: 'countdown-1',
      name: 'Summer Trip',
      tripDate: '2024-07-15',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'countdown-2',
      name: 'Winter Trip',
      tripDate: '2024-12-25',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    }
  ]

  const mockPlugin = {
    getItems: vi.fn().mockReturnValue(mockItems),
    config: {
      id: 'countdown',
      name: 'Countdown',
      description: 'Countdown to your Disney trip',
      route: '/countdown',
      widgetType: 'countdown',
      icon: '📅',
      color: 'from-blue-500 to-purple-600'
    },
    createWidget: vi.fn(),
    getWidgetComponent: vi.fn(),
    createItem: vi.fn(),
    getItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
    getItemFormComponent: vi.fn(),
    getItemDisplayComponent: vi.fn(),
    validateItem: vi.fn(),
    getWidgetData: vi.fn(),
    updateWidgetData: vi.fn(),
    getStorageKeys: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockPlugin)
  })

  it('should render dialog with correct title and items', async () => {
    render(
      <WidgetConfigSelectorDialog
        isOpen={true}
        onClose={mockOnClose}
        widgetType="countdown"
        selectedItemId="countdown-1"
        onSelect={mockOnSelect}
        onEdit={mockOnEdit}
        onCreateNew={mockOnCreateNew}
      />
    )

    // Check dialog title
    expect(screen.getByText('Select Countdown')).toBeInTheDocument()
    expect(screen.getByText('Choose from your saved countdowns or create a new one')).toBeInTheDocument()

    // Check items are displayed
    expect(screen.getByText('Summer Trip')).toBeInTheDocument()
    expect(screen.getByText('Winter Trip')).toBeInTheDocument()
    expect(screen.getByText('Trip: 7/15/2024')).toBeInTheDocument()
    expect(screen.getByText('Trip: 12/25/2024')).toBeInTheDocument()
  })

  it('should handle item selection', async () => {
    render(
      <WidgetConfigSelectorDialog
        isOpen={true}
        onClose={mockOnClose}
        widgetType="countdown"
        selectedItemId="countdown-1"
        onSelect={mockOnSelect}
        onEdit={mockOnEdit}
        onCreateNew={mockOnCreateNew}
      />
    )

    // Click on an item
    const itemButton = screen.getByText('Winter Trip').closest('button')
    expect(itemButton).toBeInTheDocument()

    if (itemButton) {
      fireEvent.click(itemButton)
      expect(mockOnSelect).toHaveBeenCalledWith('countdown-2')
    }
  })

  it('should handle search functionality', async () => {
    render(
      <WidgetConfigSelectorDialog
        isOpen={true}
        onClose={mockOnClose}
        widgetType="countdown"
        selectedItemId="countdown-1"
        onSelect={mockOnSelect}
        onEdit={mockOnEdit}
        onCreateNew={mockOnCreateNew}
      />
    )

    // Find search input
    const searchInput = screen.getByPlaceholderText('Search countdowns...')
    expect(searchInput).toBeInTheDocument()

    // Type in search
    fireEvent.change(searchInput, { target: { value: 'Summer' } })

    // Check that only Summer Trip is visible
    expect(screen.getByText('Summer Trip')).toBeInTheDocument()
    expect(screen.queryByText('Winter Trip')).not.toBeInTheDocument()
  })

  it('should handle create new action', async () => {
    render(
      <WidgetConfigSelectorDialog
        isOpen={true}
        onClose={mockOnClose}
        widgetType="countdown"
        selectedItemId="countdown-1"
        onSelect={mockOnSelect}
        onEdit={mockOnEdit}
        onCreateNew={mockOnCreateNew}
      />
    )

    // Click create new button
    const createButton = screen.getByRole('button', { name: /new countdown/i })
    fireEvent.click(createButton)

    expect(mockOnCreateNew).toHaveBeenCalled()
  })

  it('should handle edit action when item is selected', async () => {
    render(
      <WidgetConfigSelectorDialog
        isOpen={true}
        onClose={mockOnClose}
        widgetType="countdown"
        selectedItemId="countdown-1"
        onSelect={mockOnSelect}
        onEdit={mockOnEdit}
        onCreateNew={mockOnCreateNew}
      />
    )

    // Click edit button
    const editButton = screen.getByRole('button', { name: /edit selected/i })
    fireEvent.click(editButton)

    expect(mockOnEdit).toHaveBeenCalledWith('countdown-1')
  })

  it('should not show edit button when no item is selected', async () => {
    render(
      <WidgetConfigSelectorDialog
        isOpen={true}
        onClose={mockOnClose}
        widgetType="countdown"
        selectedItemId={undefined}
        onSelect={mockOnSelect}
        onEdit={mockOnEdit}
        onCreateNew={mockOnCreateNew}
      />
    )

    // Edit button should not be present
    expect(screen.queryByRole('button', { name: /edit selected/i })).not.toBeInTheDocument()
  })

  it('should show empty state when no items exist', async () => {
    vi.mocked(mockPlugin.getItems).mockReturnValue([])

    render(
      <WidgetConfigSelectorDialog
        isOpen={true}
        onClose={mockOnClose}
        widgetType="countdown"
        selectedItemId={undefined}
        onSelect={mockOnSelect}
        onEdit={mockOnEdit}
        onCreateNew={mockOnCreateNew}
      />
    )

    expect(screen.getByText('No countdowns found')).toBeInTheDocument()
    expect(screen.getByText('Create your first countdown to get started')).toBeInTheDocument()
  })

  it('should show different widget types correctly', async () => {
    render(
      <WidgetConfigSelectorDialog
        isOpen={true}
        onClose={mockOnClose}
        widgetType="budget"
        selectedItemId={undefined}
        onSelect={mockOnSelect}
        onEdit={mockOnEdit}
        onCreateNew={mockOnCreateNew}
      />
    )

    expect(screen.getByText('Select Budget')).toBeInTheDocument()
    expect(screen.getByText('Choose from your saved budgets or create a new one')).toBeInTheDocument()
  })
})