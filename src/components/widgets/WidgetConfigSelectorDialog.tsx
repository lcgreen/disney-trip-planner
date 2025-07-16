import { useState, useEffect, useMemo } from 'react'
import { Modal, Button, Badge } from '@/components/ui'
import { PluginRegistry } from '@/lib/pluginSystem'
import { Search, Edit, Plus, Calendar, MapPin, DollarSign, Package } from 'lucide-react'
import '@/plugins'

interface WidgetConfigSelectorDialogProps {
  isOpen: boolean
  onClose: () => void
  widgetType: 'countdown' | 'planner' | 'budget' | 'packing'
  selectedItemId?: string
  onSelect: (itemId: string) => void
  onEdit?: (itemId: string) => void
  onCreateNew?: () => void
}

function getItemSummary(widgetType: string, item: any): string {
  switch (widgetType) {
    case 'countdown':
      return item.tripDate ? `Trip: ${new Date(item.tripDate).toLocaleDateString()}` : ''
    case 'planner':
      return item.days ? `${item.days.length} day(s)` : ''
    case 'budget':
      return item.totalBudget ? `Total: $${item.totalBudget}` : ''
    case 'packing':
      return item.items ? `${item.items.length} item(s)` : ''
    default:
      return ''
  }
}

function getWidgetIcon(widgetType: string) {
  switch (widgetType) {
    case 'countdown':
      return Calendar
    case 'planner':
      return MapPin
    case 'budget':
      return DollarSign
    case 'packing':
      return Package
    default:
      return Package
  }
}

function getWidgetColor(widgetType: string): string {
  switch (widgetType) {
    case 'countdown':
      return 'from-blue-500 to-purple-600'
    case 'planner':
      return 'from-purple-500 to-pink-600'
    case 'budget':
      return 'from-green-500 to-teal-600'
    case 'packing':
      return 'from-orange-500 to-red-600'
    default:
      return 'from-gray-500 to-gray-600'
  }
}

export default function WidgetConfigSelectorDialog({
  isOpen,
  onClose,
  widgetType,
  selectedItemId,
  onSelect,
  onEdit,
  onCreateNew
}: WidgetConfigSelectorDialogProps) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!isOpen) return
    const plugin = PluginRegistry.getPlugin(widgetType)
    if (plugin) {
      const pluginItems = plugin.getItems()
      setItems(pluginItems)
    }
    setLoading(false)
  }, [widgetType, isOpen])

  const filteredItems = useMemo(() => {
    if (!search) return items
    return items.filter(item =>
      item.name?.toLowerCase().includes(search.toLowerCase())
    )
  }, [items, search])

  const IconComponent = getWidgetIcon(widgetType)
  const color = getWidgetColor(widgetType)
  const typeLabel = widgetType === 'countdown' ? 'Countdown' :
                   widgetType === 'planner' ? 'Trip Plan' :
                   widgetType === 'budget' ? 'Budget' : 'Packing List'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={`Select ${typeLabel}`}
      description={`Choose from your saved ${typeLabel.toLowerCase()}s or create a new one`}
    >
      <div className="space-y-6">
        {/* Search */}
        {items.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${typeLabel.toLowerCase()}s...`}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        )}

        {/* Items Grid */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading...</p>
            </div>
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left group hover:shadow-md
                  ${selectedItemId === item.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center text-white shadow-sm`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{getItemSummary(widgetType, item)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Created {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {selectedItemId === item.id && (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <IconComponent className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No {typeLabel.toLowerCase()}s found</h3>
              <p className="text-gray-500 mb-4">
                {search ? 'Try adjusting your search terms' : `Create your first ${typeLabel.toLowerCase()} to get started`}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <Button
            onClick={() => onCreateNew && onCreateNew()}
            variant="disney"
            size="md"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New {typeLabel}
          </Button>
          {onEdit && selectedItemId && (
            <Button
              onClick={() => onEdit(selectedItemId)}
              variant="outline"
              size="md"
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Selected
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}