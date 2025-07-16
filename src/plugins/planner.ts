import { Calendar } from 'lucide-react'
import {
  PluginInterface,
  PluginConfig,
  PluginData,
  PluginWidget,
  PluginRegistry,
  PluginStorage
} from '@/lib/pluginSystem'
import TripPlannerWidget from '@/components/widgets/TripPlannerWidget'

// Debug import
console.log('TripPlannerWidget import:', !!TripPlannerWidget)

export interface Activity {
  id: string
  time: string
  title: string
  location: string
  type: string
  priority: string
}

export interface DayPlan {
  id: string
  date: string
  park: string
  activities: Activity[]
}

export interface PlannerData extends PluginData {
  days: DayPlan[]
}

export class PlannerPlugin implements PluginInterface {
  config: PluginConfig = {
    id: 'planner',
    name: 'Trip Planner',
    description: 'Plan your daily Disney itinerary',
    icon: 'Calendar',
    color: 'from-park-magic to-park-epcot',
    route: '/planner',
    widgetType: 'planner',
    requiredLevel: 'premium'
  }

  getStorageKeys() {
    return {
      items: 'disney-trip-plans',
      widgets: 'disney-widget-configs',
      current: 'disney-current-tripplan'
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
    console.log('PlannerPlugin.getWidgetComponent called, returning:', !!TripPlannerWidget)
    return TripPlannerWidget
  }

  async createItem(name?: string): Promise<string> {
    const id = `planner-${Date.now()}`
    const newItem: PlannerData = {
      id,
      name: name || 'My Trip Plan',
      days: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const items = this.getItems()
    items.push(newItem)
    await PluginStorage.saveData(this.getStorageKeys().items, { plans: items })

    return id
  }

  getItems(): PlannerData[] {
    const data = PluginStorage.getData(this.getStorageKeys().items, { plans: [] })
    return data.plans || []
  }

  getItem(id: string): PlannerData | null {
    const items = this.getItems()
    return items.find(item => item.id === id) || null
  }

  updateItem(id: string, data: Partial<PlannerData>): void {
    const items = this.getItems()
    const index = items.findIndex(item => item.id === id)
    if (index >= 0) {
      items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() }
      PluginStorage.saveData(this.getStorageKeys().items, { plans: items })
    }
  }

  deleteItem(id: string): void {
    const items = this.getItems()
    const filtered = items.filter(item => item.id !== id)
    PluginStorage.saveData(this.getStorageKeys().items, { plans: filtered })
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
      days: data.days || [],
      updatedAt: new Date().toISOString()
    })
  }
}

// Register the plugin
const plannerPlugin = new PlannerPlugin()
PluginRegistry.register(plannerPlugin)

export default plannerPlugin