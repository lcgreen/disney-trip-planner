'use client'

import { useState, useEffect } from 'react'
import { Package, CheckCircle, Circle, Plus } from 'lucide-react'
import Link from 'next/link'
import WidgetBase, { WidgetSize } from './WidgetBase'
import { WidgetConfigManager } from '@/lib/widgetConfig'

interface PackingWidgetProps {
  id: string
  onRemove?: () => void
  onSettings?: () => void
}

interface PackingItem {
  id: string
  name: string
  checked: boolean
  category: string
}

export default function PackingWidget({ id, onRemove, onSettings }: PackingWidgetProps) {
  const [config, setConfig] = useState<{ size: WidgetSize } | null>(null)
  const [packingItems, setPackingItems] = useState<PackingItem[]>([])
  const [completionStats, setCompletionStats] = useState({ completed: 0, total: 0 })

  useEffect(() => {
    // Load widget config
    const widgetConfig = WidgetConfigManager.getConfig(id)
    if (widgetConfig) {
      setConfig({ size: widgetConfig.size })
    } else {
      // Default config
      const defaultConfig = { size: 'medium' as WidgetSize }
      setConfig(defaultConfig)
      WidgetConfigManager.addConfig({
        id,
        type: 'packing',
        size: 'medium',
        settings: {}
      })
    }

    // Load saved packing items
    const items = WidgetConfigManager.getPackingData()
    setPackingItems(items)

    const completed = items.filter(item => item.checked).length
    setCompletionStats({ completed, total: items.length })
  }, [id])

    const toggleItem = (itemId: string) => {
    const updatedItems = packingItems.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    )

    setPackingItems(updatedItems)
    WidgetConfigManager.updatePackingData(updatedItems)

    const completed = updatedItems.filter(item => item.checked).length
    setCompletionStats({ completed, total: updatedItems.length })
  }

  const handleSizeChange = (newSize: WidgetSize) => {
    WidgetConfigManager.updateConfig(id, { size: newSize })
    setConfig(prev => prev ? { ...prev, size: newSize } : { size: newSize })
  }

  if (!config) {
    return <div>Loading...</div>
  }

  const completionPercentage = completionStats.total > 0 ? (completionStats.completed / completionStats.total) * 100 : 0

  if (packingItems.length === 0) {
    return (
      <WidgetBase
        id={id}
        title="Packing List"
        icon={Package}
        iconColor="bg-gradient-to-br from-disney-green to-disney-teal"
        size={config.size}
        onRemove={onRemove}
        onSettings={onSettings}
        onSizeChange={handleSizeChange}
      >
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Plus className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            No Packing Items
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm">
            Start building your Disney packing checklist to stay organized for your trip!
          </p>
          <Link
            href="/packing"
            className="bg-gradient-to-r from-disney-green to-disney-teal text-white px-4 py-2 rounded-lg hover:shadow-md transition-all duration-200"
          >
            Add Items
          </Link>
        </div>
      </WidgetBase>
    )
  }

  return (
    <WidgetBase
      id={id}
      title="Packing List"
      icon={Package}
      iconColor="bg-gradient-to-br from-disney-green to-disney-teal"
      size={config.size}
      onRemove={onRemove}
      onSettings={onSettings}
      onSizeChange={handleSizeChange}
    >
      <div className="flex flex-col h-full">
        {/* Progress Overview */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm font-medium">
              {completionStats.completed} / {completionStats.total} items
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-gradient-to-r from-disney-green to-disney-teal h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <div className="text-xs text-gray-500 text-center">
            {completionPercentage.toFixed(0)}% complete
          </div>
        </div>

        {/* Recent Items */}
        <div className={`space-y-2 mb-4 overflow-y-auto ${config.size === 'small' ? 'max-h-24' : config.size === 'large' ? 'max-h-48' : 'max-h-32'}`}>
          {packingItems.slice(0, config.size === 'large' ? 8 : config.size === 'small' ? 3 : 4).map((item) => (
            <div
              key={item.id}
              className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
              onClick={() => toggleItem(item.id)}
            >
              {item.checked ? (
                <CheckCircle className="w-4 h-4 text-disney-green" />
              ) : (
                <Circle className="w-4 h-4 text-gray-400" />
              )}
              <span className={`text-sm flex-1 ${item.checked ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                {item.name}
              </span>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-auto">
          <Link
            href="/packing"
            className="w-full bg-gradient-to-r from-disney-green to-disney-teal text-white text-sm py-2 px-3 rounded-lg hover:shadow-md transition-all duration-200 text-center block"
          >
            View Full List
          </Link>
        </div>
      </div>
    </WidgetBase>
  )
}