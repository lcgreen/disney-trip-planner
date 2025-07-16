import { Luggage } from 'lucide-react'
import {
  PluginInterface,
  PluginConfig,
  PluginWidget,
  PluginRegistry
} from '@/lib/pluginSystem'
import { UnifiedStorage } from '@/lib/unifiedStorage'
import { PackingData, PackingItem } from '@/types'
import PackingWidget from '@/components/widgets/PackingWidget'

// Debug import
console.log('PackingWidget import:', !!PackingWidget)

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

    await UnifiedStorage.addPluginItem('packing', newItem)
    return id
  }

  getItems(): PackingData[] {
    return UnifiedStorage.getPluginItems<PackingData>('packing')
  }

  getItem(id: string): PackingData | null {
    const items = this.getItems()
    return items.find(item => item.id === id) || null
  }

  updateItem(id: string, data: Partial<PackingData>): void {
    UnifiedStorage.updatePluginItem('packing', id, data)
  }

  deleteItem(id: string): void {
    UnifiedStorage.deletePluginItem('packing', id)
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