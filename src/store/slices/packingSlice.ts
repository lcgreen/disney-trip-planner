import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { PackingState, PackingAction } from '../types'
import { PackingData, PackingItem } from '@/types'

const initialState: PackingState = {
  items: [],
  currentItem: null,
  isLoading: false,
  error: null,
  lastSaved: null,
  isSaving: false,
  // Real-time packing state
  packingItems: [],
  selectedWeather: ['sunny'],
  filterCategory: 'all',
  showAddItem: false,
  newItem: {
    name: '',
    category: 'other',
    isEssential: false
  },
  completionStats: {
    total: 0,
    completed: 0,
    essential: 0,
    completedEssential: 0
  }
}

// Async thunks for packing operations
export const createPacking = createAsyncThunk(
  'packing/create',
  async (name: string = 'My Packing List') => {
    const id = `packing-${Date.now()}`
    const newItem: PackingData = {
      id,
      name,
      items: [],
      selectedWeather: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return newItem
  }
)

export const updatePacking = createAsyncThunk(
  'packing/update',
  async ({ id, updates }: { id: string; updates: Partial<PackingData> }) => {
    return { id, updates: { ...updates, updatedAt: new Date().toISOString() } }
  }
)

export const deletePacking = createAsyncThunk(
  'packing/delete',
  async (id: string) => {
    return id
  }
)

export const loadPackingLists = createAsyncThunk(
  'packing/load',
  async () => {
    // In a real app, this would load from storage
    // For now, we'll return an empty array
    return []
  }
)

const packingSlice = createSlice({
  name: 'packing',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<PackingData[]>) => {
      state.items = action.payload
    },
    addItem: (state, action: PayloadAction<PackingData>) => {
      state.items.push(action.payload)
    },
    updateItem: (state, action: PayloadAction<{ id: string; updates: Partial<PackingData> }>) => {
      const { id, updates } = action.payload
      const index = state.items.findIndex(item => item.id === id)
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates, updatedAt: new Date().toISOString() }
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload)
    },
    setCurrentItem: (state, action: PayloadAction<PackingData | null>) => {
      state.currentItem = action.payload
    },
    setSaving: (state, action: PayloadAction<boolean>) => {
      state.isSaving = action.payload
    },
    setLastSaved: (state, action: PayloadAction<Date | null>) => {
      state.lastSaved = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    // Real-time packing state reducers
    setPackingItems: (state, action: PayloadAction<PackingItem[]>) => {
      state.packingItems = action.payload
    },
    setSelectedWeather: (state, action: PayloadAction<string[]>) => {
      state.selectedWeather = action.payload
    },
    setFilterCategory: (state, action: PayloadAction<string>) => {
      state.filterCategory = action.payload
    },
    setShowAddItem: (state, action: PayloadAction<boolean>) => {
      state.showAddItem = action.payload
    },
    setNewItem: (state, action: PayloadAction<Partial<PackingState['newItem']>>) => {
      state.newItem = { ...state.newItem, ...action.payload }
    },
    resetNewItem: (state) => {
      state.newItem = {
        name: '',
        category: 'other',
        isEssential: false
      }
    },
    setCompletionStats: (state, action: PayloadAction<PackingState['completionStats']>) => {
      state.completionStats = action.payload
    },
    togglePackingItem: (state, action: PayloadAction<string>) => {
      const item = state.packingItems.find(item => item.id === action.payload)
      if (item) {
        item.checked = !item.checked
      }
    },
    addPackingItem: (state, action: PayloadAction<PackingItem>) => {
      state.packingItems.push(action.payload)
    },
    deletePackingItem: (state, action: PayloadAction<string>) => {
      state.packingItems = state.packingItems.filter(item => item.id !== action.payload)
    },
    toggleWeather: (state, action: PayloadAction<string>) => {
      const weather = action.payload
      if (state.selectedWeather.includes(weather)) {
        state.selectedWeather = state.selectedWeather.filter(w => w !== weather)
      } else {
        state.selectedWeather.push(weather)
      }
    },
    loadPacking: (state, action: PayloadAction<PackingData>) => {
      state.packingItems = action.payload.items
      state.selectedWeather = action.payload.selectedWeather
    },
    clearAllPacking: (state) => {
      state.packingItems = []
      state.selectedWeather = ['sunny']
      state.filterCategory = 'all'
      state.showAddItem = false
      state.newItem = {
        name: '',
        category: 'other',
        isEssential: false
      }
      state.completionStats = {
        total: 0,
        completed: 0,
        essential: 0,
        completedEssential: 0
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // createPacking
      .addCase(createPacking.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createPacking.fulfilled, (state, action) => {
        state.isLoading = false
        state.items.push(action.payload)
        state.lastSaved = new Date()
      })
      .addCase(createPacking.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to create packing list'
      })
      // updatePacking
      .addCase(updatePacking.pending, (state) => {
        state.isSaving = true
        state.error = null
      })
      .addCase(updatePacking.fulfilled, (state, action) => {
        state.isSaving = false
        const { id, updates } = action.payload
        const index = state.items.findIndex(item => item.id === id)
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...updates }
        }
        state.lastSaved = new Date()
      })
      .addCase(updatePacking.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.error.message || 'Failed to update packing list'
      })
      // deletePacking
      .addCase(deletePacking.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deletePacking.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = state.items.filter(item => item.id !== action.payload)
        state.lastSaved = new Date()
      })
      .addCase(deletePacking.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to delete packing list'
      })
      // loadPackingLists
      .addCase(loadPackingLists.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loadPackingLists.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(loadPackingLists.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to load packing lists'
      })
  },
})

export const {
  setItems,
  addItem,
  updateItem,
  removeItem,
  setCurrentItem,
  setSaving,
  setLastSaved,
  clearError,
  // Real-time packing actions
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
} = packingSlice.actions

export default packingSlice.reducer