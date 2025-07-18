import { Modal } from '@/components/ui'
import { PluginData } from '@/types'

interface SaveModalProps<T extends PluginData> {
  isOpen: boolean
  onClose: () => void
  itemToSave: string
  onItemToSaveChange: (value: string) => void
  onConfirm: () => void
  pluginId: string
  title: string
  description: string
}

export default function SaveModal<T extends PluginData>({
  isOpen,
  onClose,
  itemToSave,
  onItemToSaveChange,
  onConfirm,
  pluginId,
  title,
  description
}: SaveModalProps<T>) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="space-y-4">
        <p className="text-gray-600">{description}</p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {pluginId.charAt(0).toUpperCase() + pluginId.slice(1)} Name
          </label>
          <input
            type="text"
            value={itemToSave}
            onChange={e => onItemToSaveChange(e.target.value)}
            placeholder={`Enter a name for your ${pluginId}...`}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-disney-blue"
            autoFocus
          />
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!itemToSave.trim()}
            className="px-4 py-2 bg-disney-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  )
}