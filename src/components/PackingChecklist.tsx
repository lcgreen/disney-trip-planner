'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Check, Plus, Trash2, Cloud, Sun, Umbrella } from 'lucide-react'
import {
  Modal,
  ProgressBar,
  PackingProgress,
  Badge,
  EssentialBadge,
  WeatherBadge,
  CountBadge,
  Select,
  Checkbox,
  PackingItemCheckbox,
  StatCard
} from '@/components/ui'

interface PackingItem {
  id: string
  name: string
  category: string
  isChecked: boolean
  isEssential: boolean
  weatherDependent?: string[]
}

interface PackingCategory {
  id: string
  name: string
  icon: string
  color: string
}

const categories: PackingCategory[] = [
  { id: 'clothing', name: 'Clothing', icon: '👕', color: 'bg-blue-100 text-blue-800' },
  { id: 'electronics', name: 'Electronics', icon: '📱', color: 'bg-purple-100 text-purple-800' },
  { id: 'toiletries', name: 'Toiletries', icon: '🧴', color: 'bg-green-100 text-green-800' },
  { id: 'documents', name: 'Documents', icon: '📋', color: 'bg-red-100 text-red-800' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎮', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'disney', name: 'Disney Essentials', icon: '🏰', color: 'bg-pink-100 text-pink-800' },
  { id: 'health', name: 'Health & Safety', icon: '🏥', color: 'bg-orange-100 text-orange-800' },
  { id: 'other', name: 'Other', icon: '📦', color: 'bg-gray-100 text-gray-800' },
]

const defaultItems: Omit<PackingItem, 'id'>[] = [
  // Clothing
  { name: 'Comfortable walking shoes', category: 'clothing', isChecked: false, isEssential: true },
  { name: 'Casual day clothes', category: 'clothing', isChecked: false, isEssential: true },
  { name: 'Pajamas', category: 'clothing', isChecked: false, isEssential: true },
  { name: 'Underwear', category: 'clothing', isChecked: false, isEssential: true },
  { name: 'Socks', category: 'clothing', isChecked: false, isEssential: true },
  { name: 'Rain jacket', category: 'clothing', isChecked: false, isEssential: false, weatherDependent: ['rain'] },
  { name: 'Warm jacket', category: 'clothing', isChecked: false, isEssential: false, weatherDependent: ['cold'] },
  { name: 'Shorts', category: 'clothing', isChecked: false, isEssential: false, weatherDependent: ['hot'] },
  { name: 'Swimwear', category: 'clothing', isChecked: false, isEssential: false, weatherDependent: ['hot'] },

  // Electronics
  { name: 'Phone charger', category: 'electronics', isChecked: false, isEssential: true },
  { name: 'Camera', category: 'electronics', isChecked: false, isEssential: false },
  { name: 'Portable battery pack', category: 'electronics', isChecked: false, isEssential: true },
  { name: 'Headphones', category: 'electronics', isChecked: false, isEssential: false },

  // Toiletries
  { name: 'Toothbrush & toothpaste', category: 'toiletries', isChecked: false, isEssential: true },
  { name: 'Shampoo & conditioner', category: 'toiletries', isChecked: false, isEssential: true },
  { name: 'Deodorant', category: 'toiletries', isChecked: false, isEssential: true },
  { name: 'Sunscreen', category: 'toiletries', isChecked: false, isEssential: true, weatherDependent: ['sunny'] },

  // Documents
  { name: 'Park tickets', category: 'documents', isChecked: false, isEssential: true },
  { name: 'ID/Passport', category: 'documents', isChecked: false, isEssential: true },
  { name: 'Hotel confirmation', category: 'documents', isChecked: false, isEssential: true },
  { name: 'Travel insurance', category: 'documents', isChecked: false, isEssential: false },

  // Disney Essentials
  { name: 'Disney app downloaded', category: 'disney', isChecked: false, isEssential: true },
  { name: 'Autograph book', category: 'disney', isChecked: false, isEssential: false },
  { name: 'Disney ears/costume', category: 'disney', isChecked: false, isEssential: false },
  { name: 'Pin trading pins', category: 'disney', isChecked: false, isEssential: false },
  { name: 'Reusable water bottle', category: 'disney', isChecked: false, isEssential: true },

  // Health & Safety
  { name: 'First aid kit', category: 'health', isChecked: false, isEssential: false },
  { name: 'Prescription medications', category: 'health', isChecked: false, isEssential: true },
  { name: 'Hand sanitizer', category: 'health', isChecked: false, isEssential: true },

  // Entertainment
  { name: 'Books/e-reader', category: 'entertainment', isChecked: false, isEssential: false },
  { name: 'Tablet for kids', category: 'entertainment', isChecked: false, isEssential: false },
  { name: 'Travel games', category: 'entertainment', isChecked: false, isEssential: false },
]

export default function PackingChecklist() {
  const [items, setItems] = useState<PackingItem[]>(
    defaultItems.map((item, index) => ({ ...item, id: index.toString() }))
  )
  const [showAddItem, setShowAddItem] = useState(false)
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'other',
    isEssential: false
  })
  const [selectedWeather, setSelectedWeather] = useState<string[]>(['sunny'])
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const addItem = () => {
    if (newItem.name.trim()) {
      const item: PackingItem = {
        id: Date.now().toString(),
        name: newItem.name.trim(),
        category: newItem.category,
        isChecked: false,
        isEssential: newItem.isEssential
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

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map(cat => ({
      value: cat.id,
      label: `${cat.icon} ${cat.name}`
    }))
  ]

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
      </div>

      {/* Weather Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-8"
      >
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Expected Weather Conditions
        </h3>
        <div className="flex flex-wrap gap-3">
          <WeatherBadge
            weather="Sunny"
            icon="☀️"
            active={selectedWeather.includes('sunny')}
            onClick={() => toggleWeather('sunny')}
          />
          <WeatherBadge
            weather="Hot (>25°C)"
            icon="🌡️"
            active={selectedWeather.includes('hot')}
            onClick={() => toggleWeather('hot')}
          />
          <WeatherBadge
            weather="Cold (<15°C)"
            icon="❄️"
            active={selectedWeather.includes('cold')}
            onClick={() => toggleWeather('cold')}
          />
          <WeatherBadge
            weather="Rainy"
            icon="🌧️"
            active={selectedWeather.includes('rain')}
            onClick={() => toggleWeather('rain')}
          />
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
          onChange={(value) => setFilterCategory(value)}
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

                      {!defaultItems.some(defaultItem => defaultItem.name === item.name) && (
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
              onChange={(value) => setNewItem({...newItem, category: value})}
              options={categorySelectOptions}
            />
          </div>

          <Checkbox
            checked={newItem.isEssential}
            onCheckedChange={(checked) => setNewItem({...newItem, isEssential: checked})}
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
    </div>
  )
}