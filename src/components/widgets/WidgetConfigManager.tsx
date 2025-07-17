'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, X, Plus, Edit, Trash2, Eye, EyeOff, GripVertical, ArrowUp, ArrowDown } from 'lucide-react'
import { WidgetConfigManager as ConfigManager } from '@/lib/widgetMigration'
import { type WidgetConfig } from '@/types'
import { Button, Badge, Modal } from '@/components/ui'
import { PluginRegistry } from '@/lib/pluginSystem'

interface WidgetConfigManagerProps {
  isOpen: boolean
  onClose: () => void
  onConfigsChange: (configs: WidgetConfig[]) => void
  currentConfigs: WidgetConfig[]
  userLevel: string
}

interface WidgetConfigItemProps {
  config: WidgetConfig
  index: number
  totalConfigs: number
  onEdit: (config: WidgetConfig) => void
  onRemove: (id: string) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  onToggleVisibility: (id: string) => void
  userLevel: string
}

function WidgetConfigItem({
  config,
  index,
  totalConfigs,
  onEdit,
  onRemove,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  userLevel
}: WidgetConfigItemProps) {
  const plugin = PluginRegistry.getPlugin(config.type)
  const [showActions, setShowActions] = useState(false)

  if (!plugin) return null

  const isVisible = !config.settings?.hidden

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200
        ${isVisible ? 'opacity-100' : 'opacity-60'}
        hover:shadow-md hover:border-gray-300
      `}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-center justify-between">
        {/* Widget Info */}
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Drag Handle */}
          <div className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Widget Icon */}
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${plugin.config.color} flex items-center justify-center flex-shrink-0`}>
            <span className="text-white text-lg">{plugin.config.icon}</span>
          </div>

          {/* Widget Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-800 truncate">{plugin.config.name}</h3>
              {plugin.config.requiredLevel === 'premium' && (
                <Badge variant="warning" size="sm">Premium</Badge>
              )}
              {plugin.config.requiredLevel === 'standard' && (
                <Badge variant="info" size="sm">Standard</Badge>
              )}
              {!isVisible && (
                <Badge variant="secondary" size="sm">Hidden</Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 truncate">{plugin.config.description}</p>
            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
              <span>Size: {config.size}</span>
              {config.width && <span>Width: {config.width} cols</span>}
              {config.selectedItemId && <span>Linked Item</span>}
            </div>
          </div>
        </div>

        {/* Actions */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center space-x-1"
            >
              {/* Visibility Toggle */}
              <button
                onClick={() => onToggleVisibility(config.id)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                title={isVisible ? 'Hide Widget' : 'Show Widget'}
              >
                {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>

              {/* Move Up */}
              {index > 0 && (
                <button
                  onClick={() => onMoveUp(index)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Move Up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              )}

              {/* Move Down */}
              {index < totalConfigs - 1 && (
                <button
                  onClick={() => onMoveDown(index)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Move Down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              )}

              {/* Edit */}
              <button
                onClick={() => onEdit(config)}
                className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                title="Edit Widget"
              >
                <Edit className="w-4 h-4" />
              </button>

              {/* Remove */}
              <button
                onClick={() => onRemove(config.id)}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Remove Widget"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function WidgetConfigManager({
  isOpen,
  onClose,
  onConfigsChange,
  currentConfigs,
  userLevel
}: WidgetConfigManagerProps) {
  const [configs, setConfigs] = useState<WidgetConfig[]>(currentConfigs)
  const [editingConfig, setEditingConfig] = useState<WidgetConfig | null>(null)
  const [showAddWidget, setShowAddWidget] = useState(false)

  useEffect(() => {
    setConfigs(currentConfigs)
  }, [currentConfigs])

  const handleRemoveConfig = (id: string) => {
    if (userLevel === 'anon') return

    ConfigManager.removeConfigSync(id)
    const updatedConfigs = ConfigManager.getConfigs()
    setConfigs(updatedConfigs)
    onConfigsChange(updatedConfigs)
  }

  const handleToggleVisibility = (id: string) => {
    if (userLevel === 'anon') return

    const config = configs.find(c => c.id === id)
    if (!config) return

    const updatedConfig = {
      ...config,
      settings: {
        ...config.settings,
        hidden: !config.settings?.hidden
      }
    }

    ConfigManager.updateConfigSync(id, updatedConfig)
    const updatedConfigs = ConfigManager.getConfigs()
    setConfigs(updatedConfigs)
    onConfigsChange(updatedConfigs)
  }

  const handleMoveUp = (index: number) => {
    if (userLevel === 'anon' || index === 0) return

    const newOrder = [...configs.map(c => c.id)]
    const [movedItem] = newOrder.splice(index, 1)
    newOrder.splice(index - 1, 0, movedItem)

    ConfigManager.reorderWidgetsSync(newOrder)
    const updatedConfigs = ConfigManager.getConfigs()
    setConfigs(updatedConfigs)
    onConfigsChange(updatedConfigs)
  }

  const handleMoveDown = (index: number) => {
    if (userLevel === 'anon' || index === configs.length - 1) return

    const newOrder = [...configs.map(c => c.id)]
    const [movedItem] = newOrder.splice(index, 1)
    newOrder.splice(index + 1, 0, movedItem)

    ConfigManager.reorderWidgetsSync(newOrder)
    const updatedConfigs = ConfigManager.getConfigs()
    setConfigs(updatedConfigs)
    onConfigsChange(updatedConfigs)
  }

  const handleEditConfig = (config: WidgetConfig) => {
    setEditingConfig(config)
  }

  const handleAddWidget = (type: string) => {
    if (userLevel === 'anon') return

    const newWidget: WidgetConfig = {
      id: `${type}-${Date.now()}`,
      type: type as 'countdown' | 'planner' | 'budget' | 'packing',
      size: 'medium',
      order: configs.length,
      width: undefined,
      selectedItemId: undefined,
      settings: {}
    }

    ConfigManager.addConfigSync(newWidget)
    const updatedConfigs = ConfigManager.getConfigs()
    setConfigs(updatedConfigs)
    onConfigsChange(updatedConfigs)
    setShowAddWidget(false)
  }

  const getWidgetOptions = () => {
    return PluginRegistry.getAllPlugins()
      .filter(plugin => {
        if (userLevel === 'anon') return true
        if (plugin.config.requiredLevel) {
          return userLevel === 'premium' || userLevel === 'standard'
        }
        return true
      })
      .map(plugin => ({
        type: plugin.config.widgetType,
        name: plugin.config.name,
        description: plugin.config.description,
        icon: plugin.config.icon,
        color: plugin.config.color,
        requiredLevel: plugin.config.requiredLevel
      }))
  }

  const widgetOptions = getWidgetOptions()

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Widget Configuration</h2>
          <div className="flex items-center space-x-2">
            {userLevel !== 'anon' && (
              <Button
                onClick={() => setShowAddWidget(true)}
                variant="disney"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                Add Widget
              </Button>
            )}
            <Button onClick={onClose} variant="secondary" size="sm">
              Close
            </Button>
          </div>
        </div>

        {/* Widget List */}
        <div className="space-y-3 mb-6">
          {configs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No widgets configured yet.</p>
              {userLevel !== 'anon' && (
                <p className="text-sm mt-1">Click &ldquo;Add Widget&rdquo; to get started.</p>
              )}
            </div>
          ) : (
            configs.map((config, index) => (
              <WidgetConfigItem
                key={config.id}
                config={config}
                index={index}
                totalConfigs={configs.length}
                onEdit={handleEditConfig}
                onRemove={handleRemoveConfig}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                onToggleVisibility={handleToggleVisibility}
                userLevel={userLevel}
              />
            ))
          )}
        </div>

        {/* Add Widget Modal */}
        {showAddWidget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Add Widget</h3>
                <button
                  onClick={() => setShowAddWidget(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {widgetOptions.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => handleAddWidget(option.type)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${option.color} flex items-center justify-center`}>
                        <span className="text-white text-lg">{option.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-800">{option.name}</h4>
                          {option.requiredLevel === 'premium' && (
                            <Badge variant="warning" size="sm">Premium</Badge>
                          )}
                          {option.requiredLevel === 'standard' && (
                            <Badge variant="info" size="sm">Standard</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Config Modal */}
        {editingConfig && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Edit Widget</h3>
                <button
                  onClick={() => setEditingConfig(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Widget Size
                  </label>
                  <select
                    value={editingConfig.size}
                    onChange={(e) => {
                      const updated = { ...editingConfig, size: e.target.value as any }
                      ConfigManager.updateConfigSync(editingConfig.id, updated)
                      const updatedConfigs = ConfigManager.getConfigs()
                      setConfigs(updatedConfigs)
                      onConfigsChange(updatedConfigs)
                      setEditingConfig(updated)
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="wide">Wide</option>
                    <option value="tall">Tall</option>
                    <option value="full">Full</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Widget Width
                  </label>
                  <select
                    value={editingConfig.width || ''}
                    onChange={(e) => {
                      const updated = { ...editingConfig, width: e.target.value || undefined }
                      ConfigManager.updateConfigSync(editingConfig.id, updated)
                      const updatedConfigs = ConfigManager.getConfigs()
                      setConfigs(updatedConfigs)
                      onConfigsChange(updatedConfigs)
                      setEditingConfig(updated)
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Auto</option>
                    <option value="1">1 Column</option>
                    <option value="2">2 Columns</option>
                    <option value="3">3 Columns</option>
                    <option value="4">4 Columns</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hidden"
                    checked={editingConfig.settings?.hidden || false}
                    onChange={(e) => {
                      const updated = {
                        ...editingConfig,
                        settings: {
                          ...editingConfig.settings,
                          hidden: e.target.checked
                        }
                      }
                      ConfigManager.updateConfigSync(editingConfig.id, updated)
                      const updatedConfigs = ConfigManager.getConfigs()
                      setConfigs(updatedConfigs)
                      onConfigsChange(updatedConfigs)
                      setEditingConfig(updated)
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="hidden" className="text-sm text-gray-700">
                    Hide widget from dashboard
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  onClick={() => setEditingConfig(null)}
                  variant="secondary"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setEditingConfig(null)}
                  variant="disney"
                  size="sm"
                >
                  Save
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </Modal>
  )
}