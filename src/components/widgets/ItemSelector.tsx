import React, { useState, useEffect } from 'react'
import { ChevronDown, Package, Calendar, DollarSign, Clock } from 'lucide-react'
import {
  WidgetConfigManager,
  type SavedCountdown,
  type SavedPackingList,
  type SavedTripPlan,
  type SavedBudget
} from '@/lib/widgetConfig'

interface ItemSelectorProps {
  widgetId: string
  widgetType: 'countdown' | 'planner' | 'budget' | 'packing'
  selectedItemId?: string
  onItemSelect: (itemId: string | null) => void
}

type SavedItem = SavedCountdown | SavedPackingList | SavedTripPlan | SavedBudget

export default function ItemSelector({ widgetId, widgetType, selectedItemId, onItemSelect }: ItemSelectorProps) {
  const [availableItems, setAvailableItems] = useState<SavedItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Load available items based on widget type
    let items: SavedItem[] = []
    switch (widgetType) {
      case 'countdown':
        items = WidgetConfigManager.getAvailableCountdowns()
        break
      case 'packing':
        items = WidgetConfigManager.getAvailablePackingLists()
        break
      case 'planner':
        items = WidgetConfigManager.getAvailableTripPlans()
        break
      case 'budget':
        items = WidgetConfigManager.getAvailableBudgets()
        break
    }
    setAvailableItems(items)
  }, [widgetType])

  const getWidgetIcon = () => {
    switch (widgetType) {
      case 'countdown': return Clock
      case 'packing': return Package
      case 'planner': return Calendar
      case 'budget': return DollarSign
    }
  }

  const getWidgetLabel = () => {
    switch (widgetType) {
      case 'countdown': return 'Countdown'
      case 'packing': return 'Packing List'
      case 'planner': return 'Trip Plan'
      case 'budget': return 'Budget'
    }
  }

  const handleItemSelect = (itemId: string | null) => {
    onItemSelect(itemId)
    setIsOpen(false)
  }

  const selectedItem = availableItems.find(item => item.id === selectedItemId)
  const Icon = getWidgetIcon()

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-200 rounded-lg hover:border-gray-300 focus:outline-none focus:border-blue-500 bg-white"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">
            {selectedItem ? selectedItem.name : `Default ${getWidgetLabel()}`}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          {/* Default option */}
          <button
            onClick={() => handleItemSelect(null)}
            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
              !selectedItemId ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            <div className="flex-1 min-w-0">
              <div className="font-medium">Default {getWidgetLabel()}</div>
              <div className="text-xs text-gray-500">
                {availableItems.length === 0
                  ? 'From main app'
                  : 'Use app default data'}
              </div>
            </div>
          </button>

          {/* Divider */}
          {availableItems.length > 0 && (
            <div className="border-t border-gray-100 my-1" />
          )}

          {/* Available saved items */}
          {availableItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemSelect(item.id)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                selectedItemId === item.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{item.name}</div>
                <div className="text-xs text-gray-500 truncate">
                  {widgetType === 'countdown' && 'date' in item && (
                    new Date(item.date).toLocaleDateString()
                  )}
                  {widgetType === 'packing' && 'items' in item && (
                    `${item.items.length} items`
                  )}
                  {widgetType === 'planner' && 'days' in item && (
                    `${item.days.length} days`
                  )}
                  {widgetType === 'budget' && 'totalBudget' in item && (
                    `$${item.totalBudget}`
                  )}
                </div>
              </div>
            </button>
          ))}

          {/* No saved items message */}
          {availableItems.length === 0 && (
            <div className="px-3 py-2 text-center text-xs text-gray-500 border-t border-gray-100">
              No saved {getWidgetLabel().toLowerCase()}s found
            </div>
          )}
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}