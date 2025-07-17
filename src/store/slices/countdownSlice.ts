import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { CountdownState, CountdownAction } from '../types'
import { CountdownData } from '@/types'
import { DisneyPark, CountdownPalette } from '@/config/types'
import { userManager } from '@/lib/userMigration'
import { getAllParksFlattened, getAllThemes } from '@/config'

const initialState: CountdownState = {
  items: [],
  currentItem: null,
  isLoading: false,
  error: null,
  lastSaved: null,
  isSaving: false,
  // Real-time countdown state
  targetDate: '', // Start empty to avoid hydration mismatch
  selectedPark: null, // Start with no park selected to avoid conflicts
  settings: {
    showMilliseconds: false,
    showTimezone: true,
    showTips: true,
    showAttractions: true,
    playSound: true,
    autoRefresh: true,
    digitStyle: 'modern' as const,
    layout: 'horizontal' as const,
    fontSize: 'medium' as const,
    backgroundEffect: 'gradient' as const
  },
  customTheme: getAllThemes()[0] || null,
  isActive: false,
  countdown: {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  },
  milliseconds: 0,
  disneyParks: getAllParksFlattened()
}

// Async thunks for countdown operations
export const createCountdown = createAsyncThunk(
  'countdown/create',
  async (name: string = 'My Disney Trip') => {
    const id = `countdown-${Date.now()}`
    const defaultPark = getAllParksFlattened()[0] // Get the first park as default
    const newItem: CountdownData = {
      id,
      name,
      tripDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      park: defaultPark, // Use the full park object
      settings: {
        showMilliseconds: false,
        showTimezone: true,
        showTips: true,
        showAttractions: true,
        playSound: true,
        autoRefresh: true,
        digitStyle: 'modern' as const,
        layout: 'horizontal' as const,
        fontSize: 'medium' as const,
        backgroundEffect: 'gradient' as const
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return newItem
  }
)

export const updateCountdown = createAsyncThunk(
  'countdown/update',
  async ({ id, updates }: { id: string; updates: Partial<CountdownData> }) => {
    return { id, updates: { ...updates, updatedAt: new Date().toISOString() } }
  }
)

export const deleteCountdown = createAsyncThunk(
  'countdown/delete',
  async (id: string) => {
    return id
  }
)

export const loadCountdowns = createAsyncThunk(
  'countdown/load',
  async () => {
    // In a real app, this would load from storage
    // For now, we'll return an empty array
    return []
  }
)

const countdownSlice = createSlice({
  name: 'countdown',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<CountdownData[]>) => {
      state.items = action.payload
    },
    addItem: (state, action: PayloadAction<CountdownData>) => {
      state.items.push(action.payload)
    },
    updateItem: (state, action: PayloadAction<{ id: string; updates: Partial<CountdownData> }>) => {
      const { id, updates } = action.payload
      const index = state.items.findIndex(item => item.id === id)
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates, updatedAt: new Date().toISOString() }
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload)
    },
    setCurrentItem: (state, action: PayloadAction<CountdownData | null>) => {
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
    // Real-time countdown actions
    setTargetDate: (state, action: PayloadAction<string>) => {
      state.targetDate = action.payload
    },
    setSelectedPark: (state, action: PayloadAction<DisneyPark | null>) => {
      state.selectedPark = action.payload
    },
    setSettings: (state, action: PayloadAction<CountdownState['settings']>) => {
      state.settings = action.payload
    },
    setCustomTheme: (state, action: PayloadAction<CountdownPalette | null>) => {
      state.customTheme = action.payload
    },
    setCountdown: (state, action: PayloadAction<CountdownState['countdown']>) => {
      state.countdown = action.payload
    },
    setMilliseconds: (state, action: PayloadAction<number>) => {
      state.milliseconds = action.payload
    },
    setIsActive: (state, action: PayloadAction<boolean>) => {
      state.isActive = action.payload
    },
    startCountdown: (state) => {
      state.isActive = true
    },
    stopCountdown: (state) => {
      state.isActive = false
    },
    resetCountdown: (state) => {
      state.isActive = false
      state.countdown = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0
      }
      state.milliseconds = 0
    },
    loadCountdown: (state, action: PayloadAction<CountdownData>) => {
      const countdown = action.payload
      console.log('[Redux] Loading countdown:', countdown)
      console.log('[Redux] Park data:', countdown.park)
      console.log('[Redux] Available parks:', state.disneyParks.map(p => ({ id: p.id, name: p.name })))

      state.targetDate = countdown.tripDate

      // Handle park data more robustly
      if (countdown.park) {
        // If park has an id, try to find the full park object from the available parks
        if (countdown.park.id) {
          const fullPark = state.disneyParks.find(p => p.id === countdown.park.id)
          if (fullPark) {
            state.selectedPark = fullPark
            console.log('[Redux] Found park by ID:', fullPark.name)
          } else {
            // Fallback to the saved park data if we can't find the full object
            state.selectedPark = countdown.park
            console.log('[Redux] Using park data as provided (no ID match)')
          }
        } else {
          // If no id, use the saved park data directly
          state.selectedPark = countdown.park
          console.log('[Redux] Using park data as provided (no ID)')
        }
      } else {
        state.selectedPark = null
        console.log('[Redux] No park data provided')
      }

      state.settings = countdown.settings || state.settings
      state.customTheme = countdown.theme || null

      console.log('[Redux] Final selectedPark:', state.selectedPark)
    },
    clearAllCountdowns: (state) => {
      state.items = []
    }
  },
  extraReducers: (builder) => {
    builder
      // createCountdown
      .addCase(createCountdown.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createCountdown.fulfilled, (state, action) => {
        state.isLoading = false
        state.items.push(action.payload)
        state.lastSaved = new Date()
      })
      .addCase(createCountdown.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to create countdown'
      })
      // updateCountdown
      .addCase(updateCountdown.pending, (state) => {
        state.isSaving = true
        state.error = null
      })
      .addCase(updateCountdown.fulfilled, (state, action) => {
        state.isSaving = false
        const { id, updates } = action.payload
        const index = state.items.findIndex(item => item.id === id)
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...updates }
        }
        state.lastSaved = new Date()
      })
      .addCase(updateCountdown.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.error.message || 'Failed to update countdown'
      })
      // deleteCountdown
      .addCase(deleteCountdown.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteCountdown.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = state.items.filter(item => item.id !== action.payload)
        state.lastSaved = new Date()
      })
      .addCase(deleteCountdown.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to delete countdown'
      })
      // loadCountdowns
      .addCase(loadCountdowns.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loadCountdowns.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(loadCountdowns.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to load countdowns'
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
  setTargetDate,
  setSelectedPark,
  setSettings,
  setCustomTheme,
  setCountdown,
  setMilliseconds,
  setIsActive,
  startCountdown,
  stopCountdown,
  resetCountdown,
  loadCountdown,
  clearAllCountdowns,
} = countdownSlice.actions

// Selectors
export const selectAllCountdowns = (state: { countdown: CountdownState }) => state.countdown.items
export const selectCurrentCountdown = (state: { countdown: CountdownState }) => state.countdown.currentItem
export const selectCountdownLoading = (state: { countdown: CountdownState }) => state.countdown.isLoading
export const selectCountdownError = (state: { countdown: CountdownState }) => state.countdown.error
export const selectCountdownById = (state: { countdown: CountdownState }, id: string) =>
  state.countdown.items.find(item => item.id === id)
export const selectCountdownsByName = (state: { countdown: CountdownState }, name: string) =>
  state.countdown.items.filter(item =>
    item.name.toLowerCase().includes(name.toLowerCase())
  )

export default countdownSlice.reducer