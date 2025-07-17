import { describe, it, expect, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import packingSlice, {
  setPackingItems,
  setSelectedWeather,
  togglePackingItem,
  addPackingItem,
  deletePackingItem,
  toggleWeather,
  loadPacking,
  clearAllPacking
} from '@/store/slices/packingSlice'
import { PackingState } from '@/store/types'

describe('Redux Packing Slice', () => {
  let store: ReturnType<typeof configureStore>

  beforeEach(() => {
    store = configureStore({
      reducer: {
        packing: packingSlice
      }
    })
  })

  it('should have initial state', () => {
    const state = store.getState().packing as PackingState

    expect(state.items).toEqual([])
    expect(state.packingItems).toEqual([])
    expect(state.selectedWeather).toEqual(['sunny'])
    expect(state.filterCategory).toBe('all')
    expect(state.showAddItem).toBe(false)
    expect(state.newItem).toEqual({
      name: '',
      category: 'other',
      isEssential: false
    })
    expect(state.completionStats).toEqual({
      total: 0,
      completed: 0,
      essential: 0,
      completedEssential: 0
    })
  })

  it('should set packing items', () => {
    const items = [
      { id: '1', name: 'Passport', checked: true, category: 'Documents' },
      { id: '2', name: 'Phone Charger', checked: false, category: 'Electronics' }
    ]

    store.dispatch(setPackingItems(items))

    const state = store.getState().packing as PackingState
    expect(state.packingItems).toEqual(items)
  })

  it('should set selected weather', () => {
    const weather = ['sunny', 'warm', 'rainy']

    store.dispatch(setSelectedWeather(weather))

    const state = store.getState().packing as PackingState
    expect(state.selectedWeather).toEqual(weather)
  })

  it('should toggle packing item', () => {
    const items = [
      { id: '1', name: 'Passport', checked: false, category: 'Documents' }
    ]

    store.dispatch(setPackingItems(items))
    store.dispatch(togglePackingItem('1'))

    const state = store.getState().packing as PackingState
    expect(state.packingItems[0].checked).toBe(true)
  })

  it('should add packing item', () => {
    const newItem = {
      id: '1',
      name: 'Sunscreen',
      checked: false,
      category: 'Toiletries'
    }

    store.dispatch(addPackingItem(newItem))

    const state = store.getState().packing as PackingState
    expect(state.packingItems).toHaveLength(1)
    expect(state.packingItems[0]).toEqual(newItem)
  })

  it('should delete packing item', () => {
    const items = [
      { id: '1', name: 'Passport', checked: false, category: 'Documents' },
      { id: '2', name: 'Phone Charger', checked: false, category: 'Electronics' }
    ]

    store.dispatch(setPackingItems(items))
    store.dispatch(deletePackingItem('1'))

    const state = store.getState().packing as PackingState
    expect(state.packingItems).toHaveLength(1)
    expect(state.packingItems[0].id).toBe('2')
  })

  it('should toggle weather condition', () => {
    // Add weather condition
    store.dispatch(toggleWeather('warm'))

    let state = store.getState().packing as PackingState
    expect(state.selectedWeather).toContain('warm')

    // Remove weather condition
    store.dispatch(toggleWeather('warm'))

    state = store.getState().packing as PackingState
    expect(state.selectedWeather).not.toContain('warm')
  })

  it('should load packing data', () => {
    const packingData = {
      id: 'test-packing-1',
      name: 'Test Packing List',
      items: [
        { id: '1', name: 'Passport', checked: true, category: 'Documents' }
      ],
      selectedWeather: ['sunny', 'warm'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }

    store.dispatch(loadPacking(packingData))

    const state = store.getState().packing as PackingState
    expect(state.packingItems).toEqual(packingData.items)
    expect(state.selectedWeather).toEqual(packingData.selectedWeather)
  })

  it('should clear all packing data', () => {
    // First add some data
    const items = [
      { id: '1', name: 'Passport', checked: true, category: 'Documents' }
    ]
    store.dispatch(setPackingItems(items))
    store.dispatch(setSelectedWeather(['sunny', 'warm']))

    // Then clear it
    store.dispatch(clearAllPacking())

    const state = store.getState().packing as PackingState
    expect(state.packingItems).toEqual([])
    expect(state.selectedWeather).toEqual(['sunny'])
    expect(state.filterCategory).toBe('all')
    expect(state.showAddItem).toBe(false)
    expect(state.newItem).toEqual({
      name: '',
      category: 'other',
      isEssential: false
    })
  })
})