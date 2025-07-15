'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Luggage, Check, Star, Save, FolderOpen } from 'lucide-react'
import {
  Modal,
  PackingProgress,
  WeatherBadge,
  CountBadge,
  PackingItemCheckbox,
  Select,
  Checkbox,
  Button,
  Badge
} from '@/components/ui'
import {
  getAllPackingCategories,
  getDefaultPackingItems,
  getPackingCategoryOptions,
  getAllWeatherConditions,
  getPackingTips,
  type PackingCategory,
  type PackingItem as ConfigPackingItem
} from '@/config'
import {
  packingStorage,
  storageUtils,
  type StoredPackingList,
  type PackingStorage
} from '@/lib/storage'

interface PackingItem {
  id: string
  name: string
  category: string
  isChecked: boolean
  isEssential: boolean
  weatherDependent?: string[]
  description?: string
  isCustom?: boolean
}

export default function PackingChecklist() {
  // Get configuration data
  const categories = getAllPackingCategories()
  const configDefaultItems = getDefaultPackingItems()
  const weatherConditions = getAllWeatherConditions()
  const packingTips = getPackingTips()

  // Convert config items to component format
  const defaultItems: PackingItem[] = configDefaultItems.map((item, index) => ({
    ...item,
    id: index.toString(),
    isChecked: false
  }))

  const [items, setItems] = useState<PackingItem[]>(defaultItems)
  const [showAddItem, setShowAddItem] = useState(false)
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'other',
    isEssential: false
  })
  const [selectedWeather, setSelectedWeather] = useState<string[]>(['sunny'])
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Local storage state
  const [savedLists, setSavedLists] = useState<StoredPackingList[]>([])
  const [currentListName, setCurrentListName] = useState<string>('')
  const [activeListId, setActiveListId] = useState<string | null>(null)
  const [showSaveList, setShowSaveList] = useState(false)
  const [showLoadList, setShowLoadList] = useState(false)
  const [listToSave, setListToSave] = useState<string>('')

  // Load saved lists on component mount
  useEffect(() => {
    const storage = storageUtils.initializePackingStorage()
    setSavedLists(storage.lists)

    // Load active list if exists
    if (storage.activeListId) {
      const activeList = storage.lists.find(list => list.id === storage.activeListId)
      if (activeList) {
        loadList(activeList)
      }
    }
  }, [])

  // Auto-save current list when items or weather change (if we have an active list)
  useEffect(() => {
    if (activeListId && currentListName && items.some(item => item.isCustom || item.isChecked !== false)) {
      saveCurrentList(false) // Silent save without showing modal
    }
  }, [items, selectedWeather, activeListId, currentListName])

  const addItem = () => {
    if (newItem.name.trim()) {
      const item: PackingItem = {
        id: Date.now().toString(),
        name: newItem.name.trim(),
        category: newItem.category,
        isChecked: false,
        isEssential: newItem.isEssential,
        isCustom: true
      }
      setItems([...items, item])
      setNewItem({ name: '', category: 'other', isEssential: false })
      setShowAddItem(false)
    }
  }

  const toggleItem = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    ))
  }

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const toggleWeather = (weather: string) => {
    setSelectedWeather(prev =>
      prev.includes(weather)
        ? prev.filter(w => w !== weather)
        : [...prev, weather]
    )
  }

  // Storage functions
  const saveCurrentList = (showModal: boolean = true) => {
    if (!listToSave.trim() && showModal) {
      setShowSaveList(true)
      return
    }

    const listName = showModal ? listToSave.trim() : currentListName
    if (!listName) return

    const listData: StoredPackingList = {
      id: activeListId || storageUtils.generateId(),
      name: listName,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        isChecked: item.isChecked,
        isEssential: item.isEssential,
        weatherDependent: item.weatherDependent,
        description: item.description,
        isCustom: item.isCustom || false
      })),
      selectedWeather,
      createdAt: activeListId ? savedLists.find(l => l.id === activeListId)?.createdAt || storageUtils.getCurrentTimestamp() : storageUtils.getCurrentTimestamp(),
      updatedAt: storageUtils.getCurrentTimestamp()
    }

    packingStorage.update(storage => {
      const lists = storage?.lists || []
      const existingIndex = lists.findIndex(list => list.id === listData.id)

      if (existingIndex >= 0) {
        lists[existingIndex] = listData
      } else {
        lists.push(listData)
      }

      return {
        lists,
        activeListId: listData.id
      }
    })

    // Update local state
    const storage = packingStorage.get()!
    setSavedLists(storage.lists)
    setActiveListId(listData.id)
    setCurrentListName(listData.name)

    if (showModal) {
      setListToSave('')
      setShowSaveList(false)
    }
  }

  const loadList = (list: StoredPackingList) => {
    setItems(list.items.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      isChecked: item.isChecked,
      isEssential: item.isEssential,
      weatherDependent: item.weatherDependent,
      description: item.description,
      isCustom: item.isCustom
    })))
    setSelectedWeather(list.selectedWeather)

    setActiveListId(list.id)
    setCurrentListName(list.name)
    setShowLoadList(false)

    // Update active list in storage
    packingStorage.update(storage => ({
      ...storage,
      lists: storage?.lists || [],
      activeListId: list.id
    }))
  }

  const deleteList = (listId: string) => {
    packingStorage.update(storage => {
      const lists = storage?.lists?.filter(list => list.id !== listId) || []
      const activeListId = storage?.activeListId === listId ? undefined : storage?.activeListId

      return { lists, activeListId }
    })

    const storage = packingStorage.get()!
    setSavedLists(storage.lists)

    if (activeListId === listId) {
      setActiveListId(null)
      setCurrentListName('')
      setItems(defaultItems)
      setSelectedWeather(['sunny'])
    }
  }

  const startNewList = () => {
    setItems(defaultItems)
    setSelectedWeather(['sunny'])
    setActiveListId(null)
    setCurrentListName('')

    packingStorage.update(storage => ({
      ...storage,
      lists: storage?.lists || [],
      activeListId: undefined
    }))
  }

  const getFilteredItems = () => {
    let filtered = items

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory)
    }

    // Filter by weather
    filtered = filtered.filter(item => {
      if (!item.weatherDependent) return true
      return item.weatherDependent.some(weather => selectedWeather.includes(weather))
    })

    return filtered
  }

  const getItemsByCategory = (categoryId: string) => {
    return getFilteredItems().filter(item => item.category === categoryId)
  }

  const getCompletionStats = () => {
    const total = getFilteredItems().length
    const completed = getFilteredItems().filter(item => item.isChecked).length
    const essential = getFilteredItems().filter(item => item.isEssential).length
    const completedEssential = getFilteredItems().filter(item => item.isEssential && item.isChecked).length

    return { total, completed, essential, completedEssential }
  }

  const categoryOptions = getPackingCategoryOptions()

  const categorySelectOptions = categories.map(cat => ({
    value: cat.id,
    label: `${cat.icon} ${cat.name}`
  }))

  const stats = getCompletionStats()

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4 gradient-text">Disney Packing Checklist</h2>
        <p className="text-gray-600 mb-6">
          Make sure you're prepared for your magical Disney adventure with our comprehensive packing guide!
        </p>

        {/* Save/Load Controls */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {currentListName ? (
                <div className="flex items-center gap-2">
                  <Luggage className="w-4 h-4 text-disney-blue" />
                  <span className="font-medium text-gray-700">Current List: {currentListName}</span>
                  <Badge variant="success" size="sm">Saved</Badge>
                </div>
              ) : (
                <span className="text-gray-500">No list loaded</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowLoadList(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <FolderOpen className="w-4 h-4" />
                Load List
              </Button>

              <Button
                onClick={() => setShowSaveList(true)}
                variant="disney"
                size="sm"
                className="flex items-center gap-2"
                disabled={items.every(item => !item.isChecked && !item.isCustom)}
              >
                <Save className="w-4 h-4" />
                Save List
              </Button>

              <Button
                onClick={startNewList}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New List
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-8"
      >
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Luggage className="w-5 h-5" />
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
        transition={{ delay: 0.1 }}
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
      <div className="flex flex-wrap gap-4 mb-8">
        <Select
          value={filterCategory}
          onValueChange={(value) => setFilterCategory(value)}
          options={categoryOptions}
        />

        <button
          onClick={() => setShowAddItem(true)}
          className="btn-disney flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Custom Item
        </button>
      </div>

      {/* Packing Lists by Category */}
      <div className="space-y-6">
        {categories.map((category) => {
          const categoryItems = getItemsByCategory(category.id)
          if (categoryItems.length === 0) return null

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categories.indexOf(category) * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b">
                <h3 className="text-xl font-semibold flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  {category.name}
                  <CountBadge
                    count={categoryItems.filter(item => item.isChecked).length}
                    max={categoryItems.length}
                  />
                </h3>
              </div>

              <div className="p-4">
                <div className="space-y-2">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        item.isChecked
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <PackingItemCheckbox
                        checked={item.isChecked}
                        onCheckedChange={() => toggleItem(item.id)}
                        label={item.name}
                        essential={item.isEssential}
                        packed={item.isChecked}
                      />

                      <div className="flex-1">
                        {item.weatherDependent && (
                          <div className="text-xs text-gray-500 mt-1">
                            Weather: {item.weatherDependent.join(', ')}
                          </div>
                        )}
                      </div>

                      {!configDefaultItems.some(defaultItem => defaultItem.name === item.name) && (
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )
        })}
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
        className="mt-8 bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-2xl font-bold mb-6">💡 Disney Packing Tips</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">👟 Comfort First</h4>
              <p className="text-sm text-blue-700">
                Bring broken-in walking shoes and extra socks. You'll walk 10-15 miles per day!
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">🧴 Travel Size</h4>
              <p className="text-sm text-green-700">
                Pack travel-size toiletries to save space and comply with airline regulations.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">🔋 Stay Powered</h4>
              <p className="text-sm text-purple-700">
                Bring portable chargers and charging cables. Disney parks drain phone batteries quickly!
              </p>
            </div>

            <div className="p-4 bg-pink-50 rounded-lg">
              <h4 className="font-semibold text-pink-800 mb-2">🏰 Disney Magic</h4>
              <p className="text-sm text-pink-700">
                Pack Disney-themed clothes for photos and to get into the magical spirit!
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Save List Modal */}
      <Modal
        isOpen={showSaveList}
        onClose={() => {
          setShowSaveList(false)
          setListToSave('')
        }}
        title="Save Packing List"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Save your current packing list to access it later. Your list will be stored locally in your browser.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">List Name</label>
            <input
              type="text"
              value={listToSave}
              onChange={(e) => setListToSave(e.target.value)}
              placeholder="Enter a name for your packing list..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-disney-blue"
              autoFocus
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setShowSaveList(false)
                setListToSave('')
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => saveCurrentList(true)}
              disabled={!listToSave.trim()}
              className="px-4 py-2 bg-disney-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              Save List
            </button>
          </div>
        </div>
      </Modal>

      {/* Load List Modal */}
      <Modal
        isOpen={showLoadList}
        onClose={() => setShowLoadList(false)}
        title="Load Packing List"
        size="lg"
      >
        <div className="space-y-4">
          {savedLists.length === 0 ? (
            <div className="text-center py-8">
              <Luggage className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No saved lists found.</p>
              <p className="text-sm text-gray-400">Create and save a packing list to see it here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-600">
                Select a saved packing list to load. This will replace your current list.
              </p>

              {savedLists.map((list) => (
                <div
                  key={list.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    activeListId === list.id
                      ? 'border-disney-blue bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1" onClick={() => loadList(list)}>
                      <h3 className="font-medium text-gray-900">{list.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span>{list.items.length} {list.items.length === 1 ? 'item' : 'items'}</span>
                        <span>•</span>
                        <span>{list.items.filter(item => item.isChecked).length} packed</span>
                        <span>•</span>
                        <span>Updated {new Date(list.updatedAt).toLocaleDateString()}</span>
                        {activeListId === list.id && (
                          <>
                            <span>•</span>
                            <Badge variant="success" size="sm">Currently Loaded</Badge>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm(`Are you sure you want to delete "${list.name}"?`)) {
                          deleteList(list.id)
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}