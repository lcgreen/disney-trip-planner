'use client'

import { useEffect, forwardRef, useImperativeHandle } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Luggage, Check, Star, Save, FolderOpen } from 'lucide-react'
import {
  Modal,
  PackingProgress,
  WeatherBadge,
  CountBadge,
  Select,
  Checkbox,
  Button,
  Badge
} from '@/components/ui'
import {
  getAllPackingCategories,
  getPackingCategoryOptions,
  getPackingTips,
  type PackingCategory
} from '@/config'
import { PackingData } from '@/types'
import { WidgetConfigManager } from '@/lib/widgetConfig'
import { useReduxPacking } from '@/hooks/useReduxPacking'
import { useEditableName } from '@/hooks/useEditableName'

interface PackingChecklistProps {
  createdItemId?: string | null
  widgetId?: string | null
  isEditMode?: boolean
  name?: string
  onNameChange?: (name: string) => void
  onSave?: (data: Partial<PackingData>) => void
  onLoad?: (list: PackingData) => void
  onNew?: () => void
  savedLists?: PackingData[]
  activeList?: PackingData | null
  setCanSave?: (canSave: boolean) => void
}

export interface PackingChecklistRef {
  saveCurrentList: () => void
  loadList: (list: PackingData) => void
}

const PackingChecklist = forwardRef<PackingChecklistRef, PackingChecklistProps>(({
  createdItemId = null,
  widgetId = null,
  isEditMode = false,
  name = '',
  onNameChange,
  onSave,
  onLoad,
  onNew,
  savedLists = [],
  activeList = null,
  setCanSave
}, ref) => {
  // Editable name functionality
  const {
    isEditingName,
    editedName,
    handleNameEdit,
    handleNameChange,
    handleNameBlur,
    handleNameKeyDown
  } = useEditableName({ name, onNameChange })

  // Get Redux packing state and actions
  const {
    packingItems: items,
    selectedWeather,
    filterCategory,
    showAddItem,
    newItem,
    completionStats: stats,
    weatherConditions,
    configDefaultItems,
    itemsByCategory,
    getItemsByCategory,
    toggleItem,
    deleteItem,
    toggleWeather,
    setFilterCategory,
    setShowAddItem,
    setNewItem,
    addItem,
    loadPackingData
  } = useReduxPacking()

  // Get configuration data
  const allCategories = getAllPackingCategories()
  const allPackingTips = getPackingTips()

  // Load initial data
  useEffect(() => {
    if (isEditMode && activeList) {
      loadPackingData(activeList)
    }
  }, [isEditMode, activeList, loadPackingData])

  // Load created item in edit mode
  useEffect(() => {
    if (isEditMode && createdItemId) {
      const packingList = WidgetConfigManager.getSelectedItemData('packing', createdItemId) as PackingData
      if (packingList) {
        loadPackingData(packingList)
        onNameChange?.(packingList.name)
      }
    }
  }, [isEditMode, createdItemId, onNameChange, loadPackingData])

  // Update parent when data changes
  useEffect(() => {
    if (onSave) {
      onSave({
        items,
        selectedWeather
      })
    }
    const hasChanges = items.some(item => item.checked !== false)
    setCanSave?.(hasChanges && name.trim().length > 0)
  }, [items, selectedWeather, name, onSave, setCanSave])

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    saveCurrentList: () => {
      // This is handled by PluginPageWrapper now
    },
    loadList: (list: PackingData) => {
      loadPackingData(list)
    }
  }))

  const categoryOptions = getPackingCategoryOptions()

  const categorySelectOptions = allCategories.map(cat => ({
    value: cat.id,
    label: `${cat.icon} ${cat.name}`
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 gradient-text"
          >
            Disney Packing Checklist
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-gray-600 mb-8"
          >
            Make sure you&rsquo;re prepared for your magical Disney adventure with our comprehensive packing guide!
          </motion.p>

          {/* Editable name for widget editing */}
          {widgetId && isEditMode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center mb-6"
            >
              {isEditingName ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={handleNameChange}
                  onBlur={handleNameBlur}
                  onKeyDown={handleNameKeyDown}
                  placeholder="Enter packing list name..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-disney-blue text-center text-lg font-medium"
                  style={{ minWidth: '300px' }}
                  autoFocus
                />
              ) : (
                <button
                  onClick={handleNameEdit}
                  className="px-4 py-2 text-center text-lg font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  style={{ minWidth: '300px' }}
                >
                  {name || 'Click to enter packing list name...'}
                </button>
              )}
            </motion.div>
          )}
        </div>

        {/* Weather Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 mb-8 shadow-lg border border-gray-100"
        >
          <h3 className="text-xl md:text-2xl font-semibold mb-6 flex items-center gap-2">
            <Luggage className="w-5 h-5 md:w-6 md:h-6" />
            Expected Weather Conditions
          </h3>
          <div className="flex flex-wrap gap-3">
            {weatherConditions.map(condition => (
              <WeatherBadge
                key={condition.id}
                weather={condition.name}
                icon={condition.icon}
                active={selectedWeather.includes(condition.id)}
                onClick={() => toggleWeather(condition.id)}
              />
            ))}
          </div>
        </motion.div>

        {/* Progress Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <PackingProgress
            completed={stats.completed}
            total={stats.total}
            essential={stats.essential}
            completedEssential={stats.completedEssential}
          />
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          <Select
            value={filterCategory}
            onValueChange={(value) => setFilterCategory(value)}
            options={categoryOptions}
          />

          <button
            onClick={() => setShowAddItem(true)}
            className="btn-disney flex items-center gap-2 transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Add Custom Item
          </button>
        </motion.div>

        {/* Packing Lists by Category */}
        <div className="space-y-6">
          <AnimatePresence>
            {allCategories.map((category: PackingCategory, index: number) => {
              const categoryItems = getItemsByCategory(category.id)
              if (categoryItems.length === 0) return null

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100"
                >
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 md:p-6 border-b border-gray-200">
                    <h3 className="text-xl md:text-2xl font-semibold flex items-center gap-3">
                      <span className="text-2xl md:text-3xl">{category.icon}</span>
                      {category.name}
                      <CountBadge
                        count={categoryItems.filter(item => item.checked).length}
                        max={categoryItems.length}
                      />
                    </h3>
                  </div>

                  <div className="p-4 md:p-6">
                    <div className="space-y-3">
                      {categoryItems.map((item, itemIndex) => {
                        const configItem = configDefaultItems.find(config => config.name === item.name)
                        const isEssential = configItem?.isEssential
                        const weatherDependent = configItem?.weatherDependent
                        const isCustom = !configItem

                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + index * 0.1 + itemIndex * 0.05 }}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                              item.checked
                                ? 'bg-green-50 border-green-200 shadow-md'
                                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg'
                            }`}
                          >
                            <Checkbox
                              checked={item.checked}
                              onCheckedChange={() => toggleItem(item.id)}
                              className="scale-110"
                            />

                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`font-medium ${item.checked ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                  {item.name}
                                </span>
                                {isEssential && (
                                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                )}
                              </div>
                              {weatherDependent && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Weather: {weatherDependent.join(', ')}
                                </div>
                              )}
                            </div>

                            {isCustom && (
                              <button
                                onClick={() => deleteItem(item.id)}
                                className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Add Item Modal */}
        <Modal
          isOpen={showAddItem}
          onClose={() => setShowAddItem(false)}
          title="Add Custom Item"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                placeholder="e.g., Extra phone charger"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <Select
                value={newItem.category}
                onValueChange={(value) => setNewItem({...newItem, category: value})}
                options={categorySelectOptions}
              />
            </div>

            <Checkbox
              checked={newItem.isEssential}
              onCheckedChange={(checked) => setNewItem({...newItem, isEssential: Boolean(checked)})}
              label="This is an essential item"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={addItem} className="btn-disney flex-1">
              Add Item
            </button>
            <button
              onClick={() => setShowAddItem(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </Modal>

        {/* Packing Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-gray-100"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3">
            💡 Disney Packing Tips
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="p-4 md:p-6 bg-blue-50 rounded-xl border border-blue-200"
              >
                <h4 className="font-semibold text-blue-800 mb-3 text-lg">👟 Comfort First</h4>
                <p className="text-sm md:text-base text-blue-700">
                  Bring broken-in walking shoes and extra socks. You&rsquo;ll walk 10-15 miles per day!
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
                className="p-4 md:p-6 bg-green-50 rounded-xl border border-green-200"
              >
                <h4 className="font-semibold text-green-800 mb-3 text-lg">🧴 Travel Size</h4>
                <p className="text-sm md:text-base text-green-700">
                  Pack travel-size toiletries to save space and comply with airline regulations.
                </p>
              </motion.div>
            </div>

            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 }}
                className="p-4 md:p-6 bg-purple-50 rounded-xl border border-purple-200"
              >
                <h4 className="font-semibold text-purple-800 mb-3 text-lg">🔋 Stay Powered</h4>
                <p className="text-sm md:text-base text-purple-700">
                  Bring portable chargers and charging cables. Disney parks drain phone batteries quickly!
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
                className="p-4 md:p-6 bg-pink-50 rounded-xl border border-pink-200"
              >
                <h4 className="font-semibold text-pink-800 mb-3 text-lg">🏰 Disney Magic</h4>
                <p className="text-sm md:text-base text-pink-700">
                  Pack Disney-themed clothes for photos and to get into the magical spirit!
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
})

PackingChecklist.displayName = 'PackingChecklist'

export default PackingChecklist