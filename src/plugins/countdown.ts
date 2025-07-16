import { Clock } from 'lucide-react'
import {
  PluginInterface,
  PluginConfig,
  PluginData,
  PluginWidget,
  PluginRegistry,
  PluginStorage
} from '@/lib/pluginSystem'
import CountdownWidget from '@/components/widgets/CountdownWidget'

// Debug import
console.log('CountdownWidget import:', !!CountdownWidget)

export interface CountdownData extends PluginData {
  tripDate: string
  park?: any
  settings?: any
  theme?: any
}

export class CountdownPlugin implements PluginInterface {
  config: PluginConfig = {
    id: 'countdown',
    name: 'Disney Countdown',
    description: 'Track days until your Disney trip',
    icon: 'Clock',
    color: 'from-disney-blue to-disney-purple',
    route: '/countdown',
    widgetType: 'countdown',
    requiredLevel: 'anon'
  }

  getStorageKeys() {
    return {
      items: 'disney-countdowns',
      widgets: 'disney-widget-configs',
      current: 'disney-current-countdown'
    }
  }

  createWidget(id: string): PluginWidget {
    return {
      id,
      type: this.config.widgetType,
      order: 0,
      width: undefined,
      selectedItemId: undefined,
      settings: {}
    }
  }

  getWidgetComponent() {
    console.log('CountdownPlugin.getWidgetComponent called, returning:', !!CountdownWidget)
    return CountdownWidget
  }

  async createItem(name?: string): Promise<string> {
    const id = `countdown-${Date.now()}`
    const newItem: CountdownData = {
      id,
      name: name || 'My Disney Trip',
      tripDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      park: { name: 'Disney World' },
      settings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const items = this.getItems()
    items.push(newItem)
    await PluginStorage.saveData(this.getStorageKeys().items, { countdowns: items })

    // Also save to the main localStorage key for compatibility (with permission check)
    if (typeof window !== 'undefined') {
      try {
        const { userManager } = await import('@/lib/userManagement')
        if (userManager.hasFeatureAccess('saveData')) {
          localStorage.setItem('disney-countdowns', JSON.stringify({ countdowns: items }))
        }
      } catch (error) {
        console.warn('Could not check user permissions for localStorage save')
      }
    }

    return id
  }

  getItems(): CountdownData[] {
    const data = PluginStorage.getData(this.getStorageKeys().items, { countdowns: [] })
    const items = data.countdowns || []



    return items
  }

  getItem(id: string): CountdownData | null {
    const items = this.getItems()
    const item = items.find(item => item.id === id)

    if (item) {
      // Ensure the item has the correct structure for the widget
      const normalizedItem = {
        ...item,
        tripDate: item.tripDate || item.date, // Use tripDate if available, fallback to date
        park: item.park || { name: 'Disney World' }
      }



      return normalizedItem
    }

    return null
  }

  updateItem(id: string, data: Partial<CountdownData>): void {
    const items = this.getItems()
    const index = items.findIndex(item => item.id === id)
    if (index >= 0) {
      items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() }
      PluginStorage.saveData(this.getStorageKeys().items, { countdowns: items })

      // Also save to the main localStorage key for compatibility
      if (typeof window !== 'undefined') {
        localStorage.setItem('disney-countdowns', JSON.stringify({ countdowns: items }))
      }
    }
  }

  deleteItem(id: string): void {
    const items = this.getItems()
    const filtered = items.filter(item => item.id !== id)
    PluginStorage.saveData(this.getStorageKeys().items, { countdowns: filtered })

    // Also save to the main localStorage key for compatibility
    if (typeof window !== 'undefined') {
      localStorage.setItem('disney-countdowns', JSON.stringify({ countdowns: filtered }))
    }
  }

  getWidgetData(widgetId: string, itemId?: string): any {
    if (itemId) {
      return this.getItem(itemId)
    }

    // For new widgets without a selected item, return null to show empty state
    // This prevents new widgets from displaying existing data
    return null
  }

  updateWidgetData(widgetId: string, data: any): void {
    // Update current state
    PluginStorage.saveData(this.getStorageKeys().current, {
      tripDate: data.tripDate,
      title: data.name,
      park: data.park,
      updatedAt: new Date().toISOString()
    })
  }
}

// Register the plugin
const countdownPlugin = new CountdownPlugin()
PluginRegistry.register(countdownPlugin)

export default countdownPlugin