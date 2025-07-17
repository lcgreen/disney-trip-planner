import { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, PackingState } from '@/store/types'
import { AppDispatch } from '@/store'
import {
  createPacking,
  updatePacking,
  deletePacking,
  loadPackingLists,
  setPackingItems,
  setSelectedWeather,
  setFilterCategory,
  setShowAddItem,
  setNewItem,
  resetNewItem,
  setCompletionStats,
  togglePackingItem,
  addPackingItem,
  deletePackingItem,
  toggleWeather,
  loadPacking,
  clearAllPacking,
  setCurrentItem,
  setSaving,
  setLastSaved,
  clearError,
} from '@/store/slices/packingSlice'
import { PackingData, PackingItem } from '@/types'
import { getDefaultPackingItems, getAllWeatherConditions } from '@/config'

export const useReduxPacking = () => {
  const dispatch = useDispatch<AppDispatch>()
  const packingState = useSelector((state: RootState) => state.packing)

  // Get configuration data
  const configDefaultItems = getDefaultPackingItems()
  const weatherConditions = getAllWeatherConditions()

  // Convert config items to component format
  const defaultItems: PackingItem[] = useMemo(() =>
    configDefaultItems.map((item, index) => ({
      ...item,
      id: index.toString(),
      checked: false
    })), [configDefaultItems]
  )

  // Initialize default items if none exist
  useEffect(() => {
    if (packingState.packingItems.length === 0) {
      dispatch(setPackingItems(defaultItems))
    }
  }, [dispatch, packingState.packingItems.length, defaultItems])

  // Calculate completion stats
  const calculateCompletionStats = useCallback(() => {
    const filteredItems = getFilteredItems()
    const total = filteredItems.length
    const completed = filteredItems.filter(item => item.checked).length
    const essential = filteredItems.filter(item => {
      const configItem = configDefaultItems.find(config => config.name === item.name)
      return configItem?.isEssential
    }).length
    const completedEssential = filteredItems.filter(item => {
      const configItem = configDefaultItems.find(config => config.name === item.name)
      return configItem?.isEssential && item.checked
    }).length

    return { total, completed, essential, completedEssential }
  }, [packingState.packingItems, packingState.selectedWeather, packingState.filterCategory, configDefaultItems])

  // Update completion stats when items or filters change
  useEffect(() => {
    const stats = calculateCompletionStats()
    dispatch(setCompletionStats(stats))
  }, [dispatch, calculateCompletionStats])

  // Get filtered items based on category and weather
  const getFilteredItems = useCallback(() => {
    let filtered = packingState.packingItems

    // Filter by category
    if (packingState.filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === packingState.filterCategory)
    }

    // Filter by weather (if weather dependency exists in config)
    filtered = filtered.filter(item => {
      const configItem = configDefaultItems.find(config => config.name === item.name)
      if (!configItem?.weatherDependent) return true
      return configItem.weatherDependent.some(weather => packingState.selectedWeather.includes(weather))
    })

    return filtered
  }, [packingState.packingItems, packingState.selectedWeather, packingState.filterCategory, configDefaultItems])

  // Get items by category
  const getItemsByCategory = useCallback((categoryId: string) => {
    return getFilteredItems().filter(item => item.category === categoryId)
  }, [getFilteredItems])

  // Actions
  const createPackingList = useCallback(async (name: string = 'My Packing List') => {
    try {
      const result = await dispatch(createPacking(name)).unwrap()
      return result
    } catch (error) {
      console.error('Failed to create packing list:', error)
      throw error
    }
  }, [dispatch])

  const updatePackingList = useCallback(async (id: string, updates: Partial<PackingData>) => {
    try {
      const result = await dispatch(updatePacking({ id, updates })).unwrap()
      return result
    } catch (error) {
      console.error('Failed to update packing list:', error)
      throw error
    }
  }, [dispatch])

  const deletePackingList = useCallback(async (id: string) => {
    try {
      await dispatch(deletePacking(id)).unwrap()
    } catch (error) {
      console.error('Failed to delete packing list:', error)
      throw error
    }
  }, [dispatch])

  const loadPackingListsAction = useCallback(async () => {
    try {
      const result = await dispatch(loadPackingLists()).unwrap()
      return result
    } catch (error) {
      console.error('Failed to load packing lists:', error)
      throw error
    }
  }, [dispatch])

  const addItem = useCallback(() => {
    if (packingState.newItem.name.trim()) {
      const item: PackingItem = {
        id: Date.now().toString(),
        name: packingState.newItem.name.trim(),
        category: packingState.newItem.category,
        checked: false
      }
      dispatch(addPackingItem(item))
      dispatch(resetNewItem())
      dispatch(setShowAddItem(false))
    }
  }, [dispatch, packingState.newItem])

  const toggleItem = useCallback((id: string) => {
    dispatch(togglePackingItem(id))
  }, [dispatch])

  const deleteItem = useCallback((id: string) => {
    dispatch(deletePackingItem(id))
  }, [dispatch])

  const toggleWeatherCondition = useCallback((weather: string) => {
    dispatch(toggleWeather(weather))
  }, [dispatch])

  const setFilterCategoryAction = useCallback((category: string) => {
    dispatch(setFilterCategory(category))
  }, [dispatch])

  const setShowAddItemAction = useCallback((show: boolean) => {
    dispatch(setShowAddItem(show))
  }, [dispatch])

  const setNewItemAction = useCallback((updates: Partial<PackingState['newItem']>) => {
    dispatch(setNewItem(updates))
  }, [dispatch])

  const loadPackingData = useCallback((data: PackingData) => {
    dispatch(loadPacking(data))
  }, [dispatch])

  const clearAllPackingData = useCallback(() => {
    dispatch(clearAllPacking())
  }, [dispatch])

  const setCurrentPackingItem = useCallback((item: PackingData | null) => {
    dispatch(setCurrentItem(item))
  }, [dispatch])

  const setPackingSaving = useCallback((saving: boolean) => {
    dispatch(setSaving(saving))
  }, [dispatch])

  const setPackingLastSaved = useCallback((date: Date | null) => {
    dispatch(setLastSaved(date))
  }, [dispatch])

  const clearPackingError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  // Computed values
  const filteredItems = useMemo(() => getFilteredItems(), [getFilteredItems])
  const itemsByCategory = useMemo(() => {
    const categories = ['clothing', 'toiletries', 'electronics', 'documents', 'other']
    return categories.reduce((acc, categoryId) => {
      acc[categoryId] = getItemsByCategory(categoryId)
      return acc
    }, {} as Record<string, PackingItem[]>)
  }, [getItemsByCategory])

  const completionStats = useMemo(() => calculateCompletionStats(), [calculateCompletionStats])

  return {
    // State
    ...packingState,
    filteredItems,
    itemsByCategory,
    completionStats,
    weatherConditions,
    configDefaultItems,

    // Actions
    createPackingList,
    updatePackingList,
    deletePackingList,
    loadPackingLists: loadPackingListsAction,
    addItem,
    toggleItem,
    deleteItem,
    toggleWeather: toggleWeatherCondition,
    setFilterCategory: setFilterCategoryAction,
    setShowAddItem: setShowAddItemAction,
    setNewItem: setNewItemAction,
    loadPackingData,
    clearAllPackingData,
    setCurrentPackingItem,
    setPackingSaving,
    setPackingLastSaved,
    clearPackingError,

    // Utility functions
    getFilteredItems,
    getItemsByCategory,
    calculateCompletionStats,
  }
}