import { DollarSign } from 'lucide-react'
import {
  PluginInterface,
  PluginConfig,
  PluginData,
  PluginWidget,
  PluginRegistry,
  PluginStorage
} from '@/lib/pluginSystem'
import BudgetWidget from '@/components/widgets/BudgetWidget'

export interface BudgetData extends PluginData {
  totalBudget: number
  categories: any[]
  expenses: any[]
}

export class BudgetPlugin implements PluginInterface {
  config: PluginConfig = {
    id: 'budget',
    name: 'Budget Tracker',
    description: 'Track your Disney trip expenses',
    icon: 'DollarSign',
    color: 'from-green-500 to-emerald-500',
    route: '/budget',
    widgetType: 'budget',
    isPremium: false
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
    return BudgetWidget
  }

  createItem(name?: string): string {
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

    const items = this.getItems()
    items.push(newItem)
    PluginStorage.saveData(this.getStorageKeys().items, { budgets: items })

    return id
  }

  getItems(): BudgetData[] {
    const data = PluginStorage.getData(this.getStorageKeys().items, { budgets: [] })
    return data.budgets || []
  }

  getItem(id: string): BudgetData | null {
    const items = this.getItems()
    return items.find(item => item.id === id) || null
  }

  updateItem(id: string, data: Partial<BudgetData>): void {
    const items = this.getItems()
    const index = items.findIndex(item => item.id === id)
    if (index >= 0) {
      items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() }
      PluginStorage.saveData(this.getStorageKeys().items, { budgets: items })
    }
  }

  deleteItem(id: string): void {
    const items = this.getItems()
    const filtered = items.filter(item => item.id !== id)
    PluginStorage.saveData(this.getStorageKeys().items, { budgets: filtered })
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