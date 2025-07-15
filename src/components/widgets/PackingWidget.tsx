'use client'

import { useState, useEffect } from 'react'
import { Package, Check } from 'lucide-react'
import WidgetBase, { type WidgetSize } from './WidgetBase'
import { WidgetConfigManager, type SavedPackingList } from '@/lib/widgetConfig'

interface PackingItem {
  id: string
  name: string
  checked: boolean
  category: string
}

interface PackingWidgetProps {
  id: string
  onRemove: () => void
  onSettings?: () => void
}

export default function PackingWidget({ id, onRemove, onSettings }: PackingWidgetProps) {
  const [config, setConfig] = useState<{ size: WidgetSize; selectedItemId?: string } | null>(null)
  const [selectedPackingList, setSelectedPackingList] = useState<SavedPackingList | null>(null)
  const [packingItems, setPackingItems] = useState<PackingItem[]>([])
  const [completionStats, setCompletionStats] = useState({ completed: 0, total: 0 })

  useEffect(() => {
    // Load widget config
    const widgetConfig = WidgetConfigManager.getConfig(id)
    if (widgetConfig) {
      setConfig({ size: widgetConfig.size, selectedItemId: widgetConfig.selectedItemId })
    } else {
      // Default config
      const defaultConfig = { size: 'medium' as WidgetSize, selectedItemId: undefined }
      setConfig(defaultConfig)
      WidgetConfigManager.addConfig({
        id,
        type: 'packing',
        size: 'medium',
        selectedItemId: undefined,
        settings: {}
      })
    }
  }, [id])

  useEffect(() => {
    // Load selected packing list data
    if (config?.selectedItemId) {
      const packingList = WidgetConfigManager.getSelectedItemData('packing', config.selectedItemId) as SavedPackingList
      if (packingList) {
        setSelectedPackingList(packingList)
        setPackingItems(packingList.items)
        const completed = packingList.items.filter(item => item.checked).length
        setCompletionStats({ completed, total: packingList.items.length })
      } else {
        // Selected item not found, fallback to live app state
        const currentState = WidgetConfigManager.getCurrentPackingState()
        if (currentState?.items) {
          setSelectedPackingList(null)
          setPackingItems(currentState.items)
          const completed = currentState.items.filter((item: any) => item.checked).length
          setCompletionStats({ completed, total: currentState.items.length })
        } else {
          setSelectedPackingList(null)
          setPackingItems([])
          setCompletionStats({ completed: 0, total: 0 })
        }
      }
    } else {
      // No item selected, use live app state as fallback
      const currentState = WidgetConfigManager.getCurrentPackingState()
      if (currentState?.items) {
        setPackingItems(currentState.items)
        setSelectedPackingList(null)
        const completed = currentState.items.filter((item: any) => item.checked).length
        setCompletionStats({ completed, total: currentState.items.length })
      } else {
        setPackingItems([])
        setSelectedPackingList(null)
        setCompletionStats({ completed: 0, total: 0 })
      }
    }
  }, [config])

  const toggleItem = (itemId: string) => {
    const updatedItems = packingItems.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    )

    setPackingItems(updatedItems)

    // Update storage - save to the selected list or default data
    if (config?.selectedItemId && selectedPackingList) {
      // Update the saved packing list directly in localStorage
      const savedLists = WidgetConfigManager.getAvailablePackingLists()
      const updatedLists = savedLists.map(list =>
        list.id === config.selectedItemId
          ? { ...list, items: updatedItems, updatedAt: new Date().toISOString() }
          : list
      )

      // Save back to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('disney-packing-lists', JSON.stringify({ lists: updatedLists }))
      }

      // Update local state
      const updatedList = updatedLists.find(list => list.id === config.selectedItemId)
      if (updatedList) {
        setSelectedPackingList(updatedList)
      }
    } else {
      // Update default widget data and save to live state
      WidgetConfigManager.updatePackingData(updatedItems)
      WidgetConfigManager.saveCurrentPackingState(updatedItems)
    }

    const completed = updatedItems.filter(item => item.checked).length
    setCompletionStats({ completed, total: updatedItems.length })
  }

  const handleSizeChange = (newSize: WidgetSize) => {
    WidgetConfigManager.updateConfig(id, { size: newSize })
    setConfig(prev => prev ? { ...prev, size: newSize } : { size: newSize })
  }

  const handleItemSelect = (itemId: string | null) => {
    WidgetConfigManager.updateConfig(id, { selectedItemId: itemId || undefined })
    setConfig(prev => prev ? { ...prev, selectedItemId: itemId || undefined } : { size: 'medium', selectedItemId: itemId || undefined })
  }

  if (!config) {
    return <div>Loading...</div>
  }

  const { size } = config
  const completionPercentage = completionStats.total > 0 ? (completionStats.completed / completionStats.total) * 100 : 0

  // Get items to display based on size
  const getItemsToShow = () => {
    const maxItems = size === 'small' ? 3 : size === 'medium' ? 4 : 8
    return packingItems.slice(0, maxItems)
  }

  const renderPackingList = () => {
    if (packingItems.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center">
          <Package className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Packing List Selected</h3>
          <p className="text-sm text-gray-500 mb-4">
            Create a new packing list or select an existing one from settings
          </p>
          <button
            onClick={() => window.location.href = `/packing/new?widgetId=${id}`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            Create New Packing List
          </button>
        </div>
      )
    }

    const itemsToShow = getItemsToShow()
    const remainingItems = packingItems.length - itemsToShow.length

    return (
      <div className="h-full flex flex-col">
        {/* Header with list name and progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800 text-sm truncate">
              {selectedPackingList?.name || 'My Packing List'}
            </h3>
            <span className="text-xs text-gray-500">
              {completionStats.completed}/{completionStats.total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Packing items */}
        <div className="flex-1 space-y-2 overflow-hidden">
          {itemsToShow.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`w-full p-2 rounded-lg border transition-all duration-200 text-left ${
                item.checked
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center ${
                  item.checked
                    ? 'bg-green-600 border-green-600'
                    : 'border-gray-300'
                }`}>
                  {item.checked && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-sm truncate ${item.checked ? 'line-through' : ''}`}>
                  {item.name}
                </span>
              </div>
            </button>
          ))}

          {remainingItems > 0 && (
            <div className="text-center py-2">
              <span className="text-xs text-gray-500">
                +{remainingItems} more item{remainingItems !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <WidgetBase
      id={id}
      title="Packing Checklist"
      icon={Package}
      iconColor="bg-gradient-to-r from-disney-green to-disney-teal"
      widgetType="packing"
      size={size}
      selectedItemId={config.selectedItemId}
      onRemove={onRemove}
      onSizeChange={handleSizeChange}
      onItemSelect={handleItemSelect}
    >
      {renderPackingList()}
    </WidgetBase>
  )
}