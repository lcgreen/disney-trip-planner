'use client'

import { useState, useEffect } from 'react'
import { Luggage, CheckCircle, Circle, Package } from 'lucide-react'
import WidgetBase, { type WidgetSize } from './WidgetBase'
import { PluginRegistry, PluginStorage } from '@/lib/pluginSystem'
import { WidgetConfigManager } from '@/lib/widgetConfig'
import '@/plugins' // Import all plugins to register them

interface PackingWidgetProps {
  id: string
  width?: string
  onRemove: () => void
  onSettings?: () => void
  onWidthChange?: (width: string) => void
  onItemSelect?: (itemId: string | null) => void
}

interface PackingItem {
  id: string
  name: string
  category: string
  isPacked: boolean
  isEssential: boolean
}

export default function PackingWidget({
  id,
  width,
  onRemove,
  onSettings,
  onWidthChange,
  onItemSelect
}: PackingWidgetProps) {
  const [selectedPackingList, setSelectedPackingList] = useState<any>(null)
  const [packedItems, setPackedItems] = useState<PackingItem[]>([])
  const [unpackedItems, setUnpackedItems] = useState<PackingItem[]>([])

    useEffect(() => {
    // Load selected packing list data from plugin
    const packingPlugin = PluginRegistry.getPlugin('packing')
    if (packingPlugin) {
      // Get the widget configuration to see if a specific item is selected
      const widgetConfig = WidgetConfigManager.getConfig(id)
      const selectedItemId = widgetConfig?.selectedItemId

      let packingList
      if (selectedItemId) {
        // Load the specific selected packing list
        packingList = packingPlugin.getItem(selectedItemId)
      } else {
        // Load live/default data
        packingList = packingPlugin.getWidgetData(id)
      }

      setSelectedPackingList(packingList)

      // Update packed/unpacked items
      if (packingList?.items) {
        const packed = packingList.items.filter((item: any) => item.isPacked)
        const unpacked = packingList.items.filter((item: any) => !item.isPacked)
        setPackedItems(packed)
        setUnpackedItems(unpacked)
      } else {
        setPackedItems([])
        setUnpackedItems([])
      }
    }
  }, [id])

  // Watch for changes in widget configuration
  useEffect(() => {
    const checkForUpdates = () => {
      const packingPlugin = PluginRegistry.getPlugin('packing')
      if (packingPlugin) {
        const widgetConfig = WidgetConfigManager.getConfig(id)
        const selectedItemId = widgetConfig?.selectedItemId

        let packingList
        if (selectedItemId) {
          packingList = packingPlugin.getItem(selectedItemId)
        } else {
          packingList = packingPlugin.getWidgetData(id)
        }

        setSelectedPackingList(packingList)

        if (packingList?.items) {
          const packed = packingList.items.filter((item: any) => item.isPacked)
          const unpacked = packingList.items.filter((item: any) => !item.isPacked)
          setPackedItems(packed)
          setUnpackedItems(unpacked)
        } else {
          setPackedItems([])
          setUnpackedItems([])
        }
      }
    }

    // Check immediately
    checkForUpdates()

    // Set up an interval to check for updates
    const interval = setInterval(checkForUpdates, 1000)
    return () => clearInterval(interval)
  }, [id])

  const handleItemSelect = (itemId: string | null) => {
    // Update the widget configuration
    WidgetConfigManager.updateConfig(id, { selectedItemId: itemId || undefined })

    // Call the parent callback if provided
    if (onItemSelect) {
      onItemSelect(itemId)
    }
  }

  const toggleItemPacked = (itemId: string) => {
    if (!selectedPackingList) return

    const updatedItems = selectedPackingList.items.map((item: any) =>
      item.id === itemId ? { ...item, isPacked: !item.isPacked } : item
    )

    const updatedList = { ...selectedPackingList, items: updatedItems }
    setSelectedPackingList(updatedList)

    // Update in plugin storage
    const packingPlugin = PluginRegistry.getPlugin('packing')
    if (packingPlugin) {
      packingPlugin.updateWidgetData(id, updatedList)
    }

    // Update local state
    const packed = updatedItems.filter((item: any) => item.isPacked)
    const unpacked = updatedItems.filter((item: any) => !item.isPacked)
    setPackedItems(packed)
    setUnpackedItems(unpacked)
  }

  const getItemsToShow = () => {
    // Determine max items based on width
    const maxItems = width === '1' ? 3 : width === '2' ? 5 : 8
    return unpackedItems.slice(0, maxItems)
  }

  const renderPackingList = () => {
    if (!selectedPackingList) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center p-2">
          <Package className="w-10 h-10 text-gray-300 mb-3" />
          <h3 className="text-base font-medium text-gray-600 mb-1">No Packing List Selected</h3>
          <p className="text-xs text-gray-500 mb-3 max-w-[200px]">
            Create a new packing list or select one from settings
          </p>
          <button
            onClick={() => window.location.href = `/packing/new?widgetId=${id}`}
            className="px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-xs font-medium"
          >
            Create New
          </button>
        </div>
      )
    }

    const itemsToShow = getItemsToShow()
    const totalItems = selectedPackingList.items?.length || 0
    const packedCount = packedItems.length
    const progressPercentage = totalItems > 0 ? (packedCount / totalItems) * 100 : 0

    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 mb-1 truncate">{selectedPackingList.name}</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Packing Progress</span>
            <span className="text-xs font-medium text-gray-700">{progressPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300 bg-orange-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-3 border border-orange-100">
            <div className="flex items-center space-x-2 mb-1">
              <CheckCircle className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-orange-700">Packed</span>
            </div>
            <div className="text-lg font-bold text-orange-800">
              {packedCount}
            </div>
          </div>
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-3 border border-gray-100">
            <div className="flex items-center space-x-2 mb-1">
              <Circle className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-700">Remaining</span>
            </div>
            <div className="text-lg font-bold text-gray-800">
              {totalItems - packedCount}
            </div>
          </div>
        </div>

        {/* Items to Pack */}
        {itemsToShow.length > 0 && (
          <div className="flex-1">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Items to Pack</h4>
            <div className="space-y-2">
              {itemsToShow.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleItemPacked(item.id)}
                >
                  <button className="flex-shrink-0">
                    <Circle className="w-4 h-4 text-gray-400 hover:text-orange-500 transition-colors" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {item.name}
                      </span>
                      {item.isEssential && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                          Essential
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {item.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show more indicator */}
        {unpackedItems.length > itemsToShow.length && (
          <div className="text-center py-2">
            <span className="text-xs text-gray-500">
              +{unpackedItems.length - itemsToShow.length} more items
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <WidgetBase
      id={id}
      title="Packing List"
      icon={Luggage}
      iconColor="bg-gradient-to-r from-orange-500 to-amber-500"
      widgetType="packing"
      size="medium"
      width={width}
      selectedItemId={selectedPackingList?.id}
      onRemove={onRemove}
      onWidthChange={onWidthChange}
      onItemSelect={handleItemSelect}
    >
      {renderPackingList()}
    </WidgetBase>
  )
}