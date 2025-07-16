import { Calendar } from 'lucide-react'
import {
  PluginInterface,
  PluginConfig,
  PluginWidget,
  PluginRegistry
} from '@/lib/pluginSystem'
import { UnifiedStorage } from '@/lib/unifiedStorage'
import { PlannerData } from '@/types'
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

    await UnifiedStorage.addPluginItem('planner', newItem)
    return id
  }

  getItems(): PlannerData[] {
    return UnifiedStorage.getPluginItems<PlannerData>('planner')
  }

  getItem(id: string): PlannerData | null {
    const items = this.getItems()
    return items.find(item => item.id === id) || null
  }

  updateItem(id: string, data: Partial<PlannerData>): void {
    UnifiedStorage.updatePluginItem('planner', id, data)
  }

  deleteItem(id: string): void {
    UnifiedStorage.deletePluginItem('planner', id)
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
      days: data.days || [],
      updatedAt: new Date().toISOString()
    })
  }
}

// Register the plugin
const plannerPlugin = new PlannerPlugin()
PluginRegistry.register(plannerPlugin)

export default plannerPlugin