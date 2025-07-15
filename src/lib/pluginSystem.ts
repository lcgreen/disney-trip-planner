// Plugin System - Common interface for all apps/plugins

export interface PluginConfig {
  id: string
  name: string
  description: string
  icon: string
  color: string
  route: string
  widgetType: string
  isPremium?: boolean
}

export interface PluginData {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  [key: string]: any // Allow plugins to store their own data
}

export interface PluginWidget {
  id: string
  type: string
  order: number
  width?: string
  selectedItemId?: string
  settings: Record<string, any>
}

export interface PluginInterface {
  // Plugin metadata
  config: PluginConfig

  // Widget management
  createWidget: (id: string) => PluginWidget
  getWidgetComponent: () => React.ComponentType<any>

  // Data management
  createItem: (name?: string) => string
  getItems: () => PluginData[]
  getItem: (id: string) => PluginData | null
  updateItem: (id: string, data: Partial<PluginData>) => void
  deleteItem: (id: string) => void

  // Widget data
  getWidgetData: (widgetId: string, itemId?: string) => any
  updateWidgetData: (widgetId: string, data: any) => void

  // Storage keys
  getStorageKeys: () => {
    items: string
    widgets: string
    current: string
  }
}

// Plugin registry
export class PluginRegistry {
  private static plugins: Map<string, PluginInterface> = new Map()

  static register(plugin: PluginInterface): void {
    this.plugins.set(plugin.config.id, plugin)
  }

  static getPlugin(id: string): PluginInterface | undefined {
    return this.plugins.get(id)
  }

  static getAllPlugins(): PluginInterface[] {
    return Array.from(this.plugins.values())
  }

  static getWidgetTypes(): string[] {
    return this.getAllPlugins().map(plugin => plugin.config.widgetType)
  }
}

// Common storage utilities for plugins
export class PluginStorage {
  static getData<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : defaultValue
  }

  static saveData<T>(key: string, data: T): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(key, JSON.stringify(data))
  }

  static updateData<T>(key: string, updates: Partial<T>): void {
    const currentData = this.getData(key, {} as T)
    const newData = { ...currentData, ...updates }
    this.saveData(key, newData)
  }
}