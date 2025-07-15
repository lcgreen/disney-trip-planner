'use client'

import { useState, useEffect } from 'react'
import { Package, CheckCircle, Circle } from 'lucide-react'
import Link from 'next/link'
import WidgetBase, { WidgetSize } from './WidgetBase'

interface PackingWidgetProps {
  size?: WidgetSize
  onRemove?: () => void
  onSettings?: () => void
  onSizeChange?: (size: WidgetSize) => void
}

interface PackingItem {
  id: string
  name: string
  checked: boolean
  category: string
}

export default function PackingWidget({ size = 'medium', onRemove, onSettings, onSizeChange }: PackingWidgetProps) {
  const [packingItems, setPackingItems] = useState<PackingItem[]>([])
  const [completionStats, setCompletionStats] = useState({ completed: 0, total: 0 })

  useEffect(() => {
    // Mock data - in real app this would come from storage
    const items = [
      { id: '1', name: 'Disney Tickets', checked: true, category: 'Essentials' },
      { id: '2', name: 'Phone Charger', checked: true, category: 'Electronics' },
      { id: '3', name: 'Comfortable Shoes', checked: false, category: 'Clothing' },
      { id: '4', name: 'Sunscreen', checked: false, category: 'Personal Care' },
      { id: '5', name: 'Mickey Ears', checked: true, category: 'Accessories' },
      { id: '6', name: 'Camera', checked: false, category: 'Electronics' },
    ]

    setPackingItems(items)

    const completed = items.filter(item => item.checked).length
    setCompletionStats({ completed, total: items.length })
  }, [])

  const toggleItem = (id: string) => {
    setPackingItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    )

    // Update stats
    const updatedItems = packingItems.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    )
    const completed = updatedItems.filter(item => item.checked).length
    setCompletionStats({ completed, total: updatedItems.length })
  }

  const completionPercentage = (completionStats.completed / completionStats.total) * 100

    return (
    <WidgetBase
      id="packing"
      title="Packing List"
      icon={Package}
      iconColor="bg-gradient-to-br from-disney-green to-disney-teal"
      size={size}
      onRemove={onRemove}
      onSettings={onSettings}
      onSizeChange={onSizeChange}
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
        <div className={`space-y-2 mb-4 overflow-y-auto ${size === 'small' ? 'max-h-24' : size === 'large' ? 'max-h-48' : 'max-h-32'}`}>
          {packingItems.slice(0, size === 'large' ? 8 : size === 'small' ? 3 : 4).map((item) => (
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