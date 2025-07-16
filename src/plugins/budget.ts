import { DollarSign } from 'lucide-react'
import {
  PluginInterface,
  PluginConfig,
  PluginWidget,
  PluginRegistry
} from '@/lib/pluginSystem'
import { UnifiedStorage } from '@/lib/unifiedStorage'
import { BudgetData } from '@/types'
import BudgetWidget from '@/components/widgets/BudgetWidget'

// Debug import
console.log('BudgetWidget import:', !!BudgetWidget)



export class BudgetPlugin implements PluginInterface {
  config: PluginConfig = {
    id: 'budget',
    name: 'Budget Tracker',
    description: 'Track your Disney trip expenses',
    icon: 'DollarSign',
    color: 'from-green-500 to-emerald-500',
    route: '/budget',
    widgetType: 'budget',
    requiredLevel: 'premium'
  }

  getStorageKeys() {
    return {
      items: 'disney-budget-data',
      widgets: 'disney-widget-configs',
      current: 'disney-current-budget'
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
    console.log('BudgetPlugin.getWidgetComponent called, returning:', !!BudgetWidget)
    return BudgetWidget
  }

  async createItem(name?: string): Promise<string> {
    const id = `budget-${Date.now()}`
    const newItem: BudgetData = {
      id,
      name: name || 'My Disney Budget',
      totalBudget: 0,
      categories: [],
      expenses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await UnifiedStorage.addPluginItem('budget', newItem)
    return id
  }

  getItems(): BudgetData[] {
    return UnifiedStorage.getPluginItems<BudgetData>('budget')
  }

  getItem(id: string): BudgetData | null {
    const items = this.getItems()
    return items.find(item => item.id === id) || null
  }

  updateItem(id: string, data: Partial<BudgetData>): void {
    UnifiedStorage.updatePluginItem('budget', id, data)
  }

  deleteItem(id: string): void {
    UnifiedStorage.deletePluginItem('budget', id)
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
      totalBudget: data.totalBudget || 0,
      categories: data.categories || [],
      expenses: data.expenses || [],
      updatedAt: new Date().toISOString()
    })
  }
}

// Register the plugin
const budgetPlugin = new BudgetPlugin()
PluginRegistry.register(budgetPlugin)

export default budgetPlugin