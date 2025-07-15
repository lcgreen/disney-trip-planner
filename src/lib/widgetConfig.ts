import { WidgetSize } from '@/components/widgets/WidgetBase'

export interface WidgetConfig {
  id: string
  type: 'countdown' | 'planner' | 'budget' | 'packing'
  size: WidgetSize
  settings: Record<string, any>
}

export interface WidgetData {
  countdown?: {
    tripDate: string
    title?: string
  }
  planner?: {
    plans: Array<{
      id: string
      date: string
      time: string
      activity: string
      park: string
    }>
  }
  budget?: {
    total: number
    categories: Record<string, number>
    expenses: Array<{
      id: string
      date: string
      category: string
      amount: number
      description: string
    }>
  }
  packing?: {
    items: Array<{
      id: string
      name: string
      checked: boolean
      category: string
    }>
  }
}

const WIDGET_CONFIG_KEY = 'disney-widget-configs'
const WIDGET_DATA_KEY = 'disney-widget-data'

export class WidgetConfigManager {
  static getConfigs(): WidgetConfig[] {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem(WIDGET_CONFIG_KEY)
    return saved ? JSON.parse(saved) : []
  }

  static saveConfigs(configs: WidgetConfig[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(WIDGET_CONFIG_KEY, JSON.stringify(configs))
  }

  static getConfig(id: string): WidgetConfig | null {
    const configs = this.getConfigs()
    return configs.find(c => c.id === id) || null
  }

  static updateConfig(id: string, updates: Partial<WidgetConfig>): void {
    const configs = this.getConfigs()
    const index = configs.findIndex(c => c.id === id)
    if (index >= 0) {
      configs[index] = { ...configs[index], ...updates }
      this.saveConfigs(configs)
    }
  }

  static addConfig(config: WidgetConfig): void {
    const configs = this.getConfigs()
    configs.push(config)
    this.saveConfigs(configs)
  }

  static removeConfig(id: string): void {
    const configs = this.getConfigs()
    const filtered = configs.filter(c => c.id !== id)
    this.saveConfigs(filtered)
  }

  static getData(): WidgetData {
    if (typeof window === 'undefined') return {}
    const saved = localStorage.getItem(WIDGET_DATA_KEY)
    return saved ? JSON.parse(saved) : {}
  }

  static saveData(data: WidgetData): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(data))
  }

  static updateData(updates: Partial<WidgetData>): void {
    const currentData = this.getData()
    const newData = { ...currentData, ...updates }
    this.saveData(newData)
  }

  // Helper methods for specific widget data
  static getCountdownData() {
    return this.getData().countdown || null
  }

  static getPlannerData() {
    return this.getData().planner?.plans || []
  }

  static getBudgetData() {
    const data = this.getData().budget
    return data ? {
      total: data.total,
      categories: data.categories,
      expenses: data.expenses || []
    } : null
  }

  static getPackingData() {
    return this.getData().packing?.items || []
  }

  static updateCountdownData(data: { tripDate: string; title?: string }) {
    this.updateData({ countdown: data })
  }

  static updatePlannerData(plans: any[]) {
    this.updateData({ planner: { plans } })
  }

  static updateBudgetData(budget: { total: number; categories: Record<string, number>; expenses: any[] }) {
    this.updateData({ budget })
  }

  static updatePackingData(items: any[]) {
    this.updateData({ packing: { items } })
  }
}