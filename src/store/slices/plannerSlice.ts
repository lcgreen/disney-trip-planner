import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { PlannerState, PlannerAction } from '../types'
import { PlannerData, PlannerDay, PlannerPlan } from '@/types'

const initialState: PlannerState = {
  items: [],
  currentItem: null,
  isLoading: false,
  error: null,
  lastSaved: null,
  isSaving: false,
  // Real-time planner state
  days: [],
  currentName: '',
  showAddDay: false,
  showAddPlan: false,
  editingPlan: null,
  newDay: {
    date: '',
    park: 'magic-kingdom'
  },
  newPlan: {
    time: '',
    activity: '',
    park: 'magic-kingdom'
  },
  selectedDayId: null,
  formErrors: {
    date: '',
    park: ''
  },
  stats: {
    totalDays: 0,
    totalPlans: 0,
    parksCount: 0
  }
}

// Async thunks for planner operations
export const createPlanner = createAsyncThunk(
  'planner/create',
  async (name: string = 'My Trip Plan') => {
    const id = `planner-${Date.now()}`
    const newItem: PlannerData = {
      id,
      name,
      days: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return newItem
  }
)

export const updatePlanner = createAsyncThunk(
  'planner/update',
  async ({ id, updates }: { id: string; updates: Partial<PlannerData> }) => {
    return { id, updates: { ...updates, updatedAt: new Date().toISOString() } }
  }
)

export const deletePlanner = createAsyncThunk(
  'planner/delete',
  async (id: string) => {
    return id
  }
)

export const loadPlanners = createAsyncThunk(
  'planner/load',
  async () => {
    // In a real app, this would load from storage
    // For now, we'll return an empty array
    return []
  }
)

const plannerSlice = createSlice({
  name: 'planner',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<PlannerData[]>) => {
      state.items = action.payload
    },
    addItem: (state, action: PayloadAction<PlannerData>) => {
      state.items.push(action.payload)
    },
    updateItem: (state, action: PayloadAction<{ id: string; updates: Partial<PlannerData> }>) => {
      const { id, updates } = action.payload
      const index = state.items.findIndex(item => item.id === id)
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates, updatedAt: new Date().toISOString() }
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload)
    },
    setCurrentItem: (state, action: PayloadAction<PlannerData | null>) => {
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
    // Real-time planner state reducers
    setDays: (state, action: PayloadAction<PlannerDay[]>) => {
      state.days = action.payload
    },
    setCurrentName: (state, action: PayloadAction<string>) => {
      state.currentName = action.payload
    },
    setShowAddDay: (state, action: PayloadAction<boolean>) => {
      state.showAddDay = action.payload
    },
    setShowAddPlan: (state, action: PayloadAction<boolean>) => {
      state.showAddPlan = action.payload
    },
    setEditingPlan: (state, action: PayloadAction<PlannerPlan | null>) => {
      state.editingPlan = action.payload
    },
    setNewDay: (state, action: PayloadAction<Partial<PlannerState['newDay']>>) => {
      state.newDay = { ...state.newDay, ...action.payload }
    },
    resetNewDay: (state) => {
      state.newDay = {
        date: '',
        park: 'magic-kingdom'
      }
    },
    setNewPlan: (state, action: PayloadAction<Partial<PlannerState['newPlan']>>) => {
      state.newPlan = { ...state.newPlan, ...action.payload }
    },
    resetNewPlan: (state) => {
      state.newPlan = {
        time: '',
        activity: '',
        park: 'magic-kingdom'
      }
    },
    setSelectedDayId: (state, action: PayloadAction<string | null>) => {
      state.selectedDayId = action.payload
    },
    setFormErrors: (state, action: PayloadAction<Partial<PlannerState['formErrors']>>) => {
      state.formErrors = { ...state.formErrors, ...action.payload }
    },
    clearFormErrors: (state) => {
      state.formErrors = {
        date: '',
        park: ''
      }
    },
    setStats: (state, action: PayloadAction<PlannerState['stats']>) => {
      state.stats = action.payload
    },
    addDay: (state, action: PayloadAction<PlannerDay>) => {
      state.days.push(action.payload)
      state.days.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    },
    deleteDay: (state, action: PayloadAction<string>) => {
      state.days = state.days.filter(day => day.id !== action.payload)
    },
    addPlan: (state, action: PayloadAction<{ dayId: string; plan: PlannerPlan }>) => {
      const { dayId, plan } = action.payload
      const day = state.days.find(d => d.id === dayId)
      if (day) {
        day.plans.push(plan)
        day.plans.sort((a, b) => a.time.localeCompare(b.time))
      }
    },
    updatePlan: (state, action: PayloadAction<{ planId: string; updates: Partial<PlannerPlan> }>) => {
      const { planId, updates } = action.payload
      state.days.forEach(day => {
        day.plans.forEach(plan => {
          if (plan.id === planId) {
            Object.assign(plan, updates)
          }
        })
      })
    },
    deletePlan: (state, action: PayloadAction<string>) => {
      const planId = action.payload
      state.days.forEach(day => {
        day.plans = day.plans.filter(plan => plan.id !== planId)
      })
    },
    loadPlanner: (state, action: PayloadAction<PlannerData>) => {
      state.days = action.payload.days
      state.currentName = action.payload.name
    },
    clearAllPlanner: (state) => {
      state.days = []
      state.currentName = ''
      state.showAddDay = false
      state.showAddPlan = false
      state.editingPlan = null
      state.newDay = {
        date: '',
        park: 'magic-kingdom'
      }
      state.newPlan = {
        time: '',
        activity: '',
        park: 'magic-kingdom'
      }
      state.selectedDayId = null
      state.formErrors = {
        date: '',
        park: ''
      }
      state.stats = {
        totalDays: 0,
        totalPlans: 0,
        parksCount: 0
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // createPlanner
      .addCase(createPlanner.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createPlanner.fulfilled, (state, action) => {
        state.isLoading = false
        state.items.push(action.payload)
        state.lastSaved = new Date()
      })
      .addCase(createPlanner.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to create planner'
      })
      // updatePlanner
      .addCase(updatePlanner.pending, (state) => {
        state.isSaving = true
        state.error = null
      })
      .addCase(updatePlanner.fulfilled, (state, action) => {
        state.isSaving = false
        const { id, updates } = action.payload
        const index = state.items.findIndex(item => item.id === id)
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...updates }
        }
        state.lastSaved = new Date()
      })
      .addCase(updatePlanner.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.error.message || 'Failed to update planner'
      })
      // deletePlanner
      .addCase(deletePlanner.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deletePlanner.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = state.items.filter(item => item.id !== action.payload)
        state.lastSaved = new Date()
      })
      .addCase(deletePlanner.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to delete planner'
      })
      // loadPlanners
      .addCase(loadPlanners.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loadPlanners.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(loadPlanners.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to load planners'
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
  // Real-time planner actions
  setDays,
  setCurrentName,
  setShowAddDay,
  setShowAddPlan,
  setEditingPlan,
  setNewDay,
  resetNewDay,
  setNewPlan,
  resetNewPlan,
  setSelectedDayId,
  setFormErrors,
  clearFormErrors,
  setStats,
  addDay,
  deleteDay,
  addPlan,
  updatePlan,
  deletePlan,
  loadPlanner,
  clearAllPlanner,
} = plannerSlice.actions

export default plannerSlice.reducer