'use client'

import { useState, useEffect } from 'react'
import { PluginRegistry } from '@/lib/pluginSystem'
import '@/plugins' // Import all plugins to register them

interface ItemSelectorProps {
  widgetId: string
  widgetType: 'countdown' | 'planner' | 'budget' | 'packing'
  selectedItemId?: string
  onItemSelect: (itemId: string | null) => void
}

export default function ItemSelector({
  widgetId,
  widgetType,
  selectedItemId,
  onItemSelect
}: ItemSelectorProps) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get items from the appropriate plugin
    const plugin = PluginRegistry.getPlugin(widgetType)
    if (plugin) {
      const pluginItems = plugin.getItems()
      setItems(pluginItems)

      // If no item is selected and items are available, default to the first item
      if (!selectedItemId && pluginItems.length > 0) {
        onItemSelect(pluginItems[0].id)
      }
    }
    setLoading(false)
  }, [widgetType, selectedItemId, onItemSelect])

  if (loading) {
    return <div className="text-sm text-gray-500">Loading...</div>
  }

  if (items.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No {widgetType === 'countdown' ? 'countdowns' :
            widgetType === 'planner' ? 'trip plans' :
            widgetType === 'budget' ? 'budgets' :
            'packing lists'} available
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500 mb-2">
        {widgetType === 'countdown' ? 'Countdown' :
         widgetType === 'planner' ? 'Trip plan' :
         widgetType === 'budget' ? 'Budget' :
         'Packing list'} to display:
      </div>

      <div className="space-y-1 max-h-32 overflow-y-auto">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemSelect(item.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedItemId === item.id
                ? 'bg-disney-blue text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="font-medium truncate">{item.name}</div>
            <div className="text-xs opacity-75">
              Created {new Date(item.createdAt).toLocaleDateString()}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}