import { Modal, Badge } from '@/components/ui'
import { LucideIcon } from 'lucide-react'
import { PluginData } from '@/types'

interface LoadModalProps<T extends PluginData> {
  isOpen: boolean
  onClose: () => void
  savedItems: T[]
  activeItem: T | null
  onSelectItem: (item: T) => void
  pluginId: string
  icon: LucideIcon
}

export default function LoadModal<T extends PluginData>({
  isOpen,
  onClose,
  savedItems,
  activeItem,
  onSelectItem,
  pluginId,
  icon: Icon
}: LoadModalProps<T>) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Load ${pluginId.charAt(0).toUpperCase() + pluginId.slice(1)}`}
      size="lg"
    >
      <div className="space-y-4">
        {savedItems.length === 0 ? (
          <div className="text-center py-8">
            <Icon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No saved {pluginId}s found.</p>
            <p className="text-sm text-gray-400">Create and save a {pluginId} to see it here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-600">
              Select a saved {pluginId} to load. This will replace your current data.
            </p>
            {savedItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  activeItem?.id === item.id
                    ? 'border-disney-blue bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onSelectItem(item)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span>Created {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {activeItem?.id === item.id && (
                    <Badge variant="success" size="sm">Currently Loaded</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}