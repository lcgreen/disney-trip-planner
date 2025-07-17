import { Clock } from 'lucide-react'
import {
  PluginInterface,
  PluginConfig,
  PluginWidget,
  PluginRegistry
} from '@/lib/pluginSystem'
import { UnifiedStorage } from '@/lib/unifiedStorage'
import { CountdownData } from '@/types'
import CountdownWidget from '@/components/widgets/CountdownWidget'

// Debug import
console.log('CountdownWidget import:', !!CountdownWidget)

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
      settings: {
        showMilliseconds: false,
        showTimezone: true,
        showTips: true,
        showAttractions: true,
        playSound: true,
        autoRefresh: true,
        digitStyle: 'modern' as const,
        layout: 'horizontal' as const,
        fontSize: 'medium' as const,
        backgroundEffect: 'gradient' as const
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await UnifiedStorage.addPluginItem('countdown', newItem)
    return id
  }

  getItems(): CountdownData[] {
    return UnifiedStorage.getPluginItems<CountdownData>('countdown')
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
    UnifiedStorage.updatePluginItem('countdown', id, data)
  }

  deleteItem(id: string): void {
    UnifiedStorage.deletePluginItem('countdown', id)
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
    UnifiedStorage.saveData(this.getStorageKeys().current, {
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