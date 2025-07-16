import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import PackingWidget from './PackingWidget'
import { PluginRegistry } from '@/lib/pluginSystem'
import { WidgetConfigManager } from '@/lib/widgetConfig'

// Mock the plugins import to prevent plugin registration
vi.mock('@/plugins', () => ({}))

// Mock the hooks and dependencies
vi.mock('@/hooks/useUser', () => ({
  useUser: () => ({
    isPremium: true,
    userLevel: 'premium'
  })
}))

vi.mock('@/lib/pluginSystem', () => ({
  PluginRegistry: {
    getPlugin: vi.fn()
  }
}))

vi.mock('@/lib/widgetConfig', () => ({
  WidgetConfigManager: {
    getConfig: vi.fn(),
    updateConfig: vi.fn()
  }
}))

// Mock demo dashboard data
vi.mock('@/config/demo-dashboard.json', () => ({
  default: {
    widgets: [
      {
        id: 'test-packing-widget',
        type: 'packing',
        selectedItemId: 'demo-packing-item-1'
      }
    ],
    data: {
      packingLists: [
        {
          id: 'demo-packing-item-1',
          name: 'Family Disney Trip Packing',
          items: [
            { id: 'item-1', name: 'Mickey Ears', category: 'accessories', checked: false },
            { id: 'item-2', name: 'Comfortable Shoes', category: 'clothing', checked: true },
            { id: 'item-3', name: 'Sunscreen', category: 'toiletries', checked: false }
          ]
        }
      ]
    }
  }
}))

describe('PackingWidget Data Structure', () => {
  const mockProps = {
    id: 'test-packing-widget',
    onRemove: vi.fn(),
    onSettings: vi.fn(),
    onWidthChange: vi.fn(),
    onItemSelect: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle demo data with checked property correctly', async () => {
    render(<PackingWidget {...mockProps} isDemoMode={true} />)

    // Should display the demo packing list name
    await waitFor(() => {
      expect(screen.getByText('Family Disney Trip Packing')).toBeInTheDocument()
    })

    // Should show correct progress (1 out of 3 items packed = 33%)
    await waitFor(() => {
      expect(screen.getByText('33%')).toBeInTheDocument()
    })

    // Should show packed count as 1
    expect(screen.getByText('1', { selector: '.text-lg.font-bold.text-orange-800' })).toBeInTheDocument()

    // Should show remaining count as 2
    expect(screen.getByText('2', { selector: '.text-lg.font-bold.text-gray-800' })).toBeInTheDocument()
  })

  it('should handle plugin data with different property names', async () => {
    const mockPackingPlugin = {
      getItem: vi.fn().mockReturnValue({
        id: 'test-packing-list',
        name: 'Test Packing List',
        items: [
          { id: 'item-1', name: 'Item 1', category: 'test', isPacked: true },
          { id: 'item-2', name: 'Item 2', category: 'test', checked: false },
          { id: 'item-3', name: 'Item 3', category: 'test', packed: true }
        ]
      }),
      updateWidgetData: vi.fn()
    } as any

    vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockPackingPlugin)
    vi.mocked(WidgetConfigManager.getConfig).mockReturnValue({
      id: 'test-packing-widget',
      type: 'packing',
      size: 'medium',
      order: 0,
      selectedItemId: 'test-packing-list',
      settings: {}
    } as any)

    render(<PackingWidget {...mockProps} isDemoMode={false} />)

    // Should display the packing list name
    await waitFor(() => {
      expect(screen.getByText('Test Packing List')).toBeInTheDocument()
    })

    // Should show correct progress (2 out of 3 items packed = 67%)
    await waitFor(() => {
      expect(screen.getByText('67%')).toBeInTheDocument()
    })

    // Should show packed count as 2 (look for the specific element in the packed stats section)
    const packedCountElement = screen.getByText('2', { selector: '.text-lg.font-bold.text-orange-800' })
    expect(packedCountElement).toBeInTheDocument()

    // Should show remaining count as 1 (look for the specific element in the remaining stats section)
    const remainingCountElement = screen.getByText('1', { selector: '.text-lg.font-bold.text-gray-800' })
    expect(remainingCountElement).toBeInTheDocument()
  })

  it('should toggle items correctly regardless of property name', async () => {
    const mockPackingPlugin = {
      getItem: vi.fn().mockReturnValue({
        id: 'test-packing-list',
        name: 'Test Packing List',
        items: [
          { id: 'item-1', name: 'Item 1', category: 'test', checked: false }
        ]
      }),
      updateWidgetData: vi.fn()
    } as any

    vi.mocked(PluginRegistry.getPlugin).mockReturnValue(mockPackingPlugin)
    vi.mocked(WidgetConfigManager.getConfig).mockReturnValue({
      id: 'test-packing-widget',
      type: 'packing',
      size: 'medium',
      order: 0,
      selectedItemId: 'test-packing-list',
      settings: {}
    } as any)

    render(<PackingWidget {...mockProps} isDemoMode={false} />)

    // Wait for the widget to load
    await waitFor(() => {
      expect(screen.getByText('Test Packing List')).toBeInTheDocument()
    })

    // Click on the item to toggle it
    const itemElement = screen.getByText('Item 1')
    fireEvent.click(itemElement)

    // Should call updateWidgetData with the toggled item
    await waitFor(() => {
      expect(mockPackingPlugin.updateWidgetData).toHaveBeenCalledWith(
        'test-packing-widget',
        expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              id: 'item-1',
              checked: true
            })
          ])
        })
      )
    })
  })
})