import { Luggage } from 'lucide-react'
import {
  PluginInterface,
  PluginConfig,
  PluginData,
  PluginWidget,
  PluginRegistry,
  PluginStorage
} from '@/lib/pluginSystem'
import PackingWidget from '@/components/widgets/PackingWidget'

// Debug import
console.log('PackingWidget import:', !!PackingWidget)

export interface PackingItem {
  id: string
  name: string
  category: string
  isPacked: boolean
  isEssential: boolean
}

export interface PackingData extends PluginData {
  items: PackingItem[]
  selectedWeather: string[]
}

export class PackingPlugin implements PluginInterface {
  config: PluginConfig = {
    id: 'packing',
    name: 'Packing List',
    description: 'Create and manage your packing checklist',
    icon: 'Luggage',
    color: 'from-orange-500 to-amber-500',
    route: '/packing',
    widgetType: 'packing',
    requiredLevel: 'premium'
  }

  getStorageKeys() {
    return {
      items: 'disney-packing-lists',
      widgets: 'disney-widget-configs',
      current: 'disney-current-packing'
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
    console.log('PackingPlugin.getWidgetComponent called, returning:', !!PackingWidget)
    return PackingWidget
  }

  async createItem(name?: string): Promise<string> {
    const id = `packing-${Date.now()}`
    const newItem: PackingData = {
      id,
      name: name || 'My Packing List',
      items: [],
      selectedWeather: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const items = this.getItems()
    items.push(newItem)
    await PluginStorage.saveData(this.getStorageKeys().items, { lists: items })

    return id
  }

  getItems(): PackingData[] {
    const data = PluginStorage.getData(this.getStorageKeys().items, { lists: [] })
    return data.lists || []
  }

  getItem(id: string): PackingData | null {
    const items = this.getItems()
    return items.find(item => item.id === id) || null
  }

  updateItem(id: string, data: Partial<PackingData>): void {
    const items = this.getItems()
    const index = items.findIndex(item => item.id === id)
    if (index >= 0) {
      items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() }
      PluginStorage.saveData(this.getStorageKeys().items, { lists: items })
    }
  }

  deleteItem(id: string): void {
    const items = this.getItems()
    const filtered = items.filter(item => item.id !== id)
    PluginStorage.saveData(this.getStorageKeys().items, { lists: filtered })
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
      items: data.items || [],
      selectedWeather: data.selectedWeather || [],
      updatedAt: new Date().toISOString()
    })
  }
}

// Register the plugin
const packingPlugin = new PackingPlugin()
PluginRegistry.register(packingPlugin)

export default packingPlugin