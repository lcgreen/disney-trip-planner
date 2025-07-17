import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { WidgetsState, WidgetsAction } from '../types'
import { WidgetConfig, CountdownData, BudgetData, PackingData, PlannerData } from '@/types'
import { userManager } from '@/lib/userMigration'

const initialState: WidgetsState = {
  configs: [],
  isLoading: false,
  error: null,
  pendingLinks: {},
}

// Async thunks for widget management
export const createAndLinkItem = createAsyncThunk(
  'widgets/createAndLinkItem',
  async ({ widgetId, widgetType }: { widgetId: string; widgetType: WidgetConfig['type'] }, { getState, dispatch }: { getState: () => any; dispatch: any }): Promise<string | null> => {
    const state = getState()
    const user = state.user.currentUser

    // Don't create items for anonymous users (except in test mode)
    if (user?.level === 'anon' && process.env.NODE_ENV !== 'test') {
      return null
    }

    // Generate a unique ID for the new item
    const itemId = `${widgetType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create a basic item structure based on type
    const newItem = {
      id: itemId,
      name: `New ${widgetType.charAt(0).toUpperCase() + widgetType.slice(1)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add the item to the appropriate slice
    switch (widgetType) {
      case 'countdown':
        dispatch({ type: 'countdown/addItem', payload: { ...newItem, tripDate: '', park: null, settings: {} } as CountdownData })
        break
      case 'budget':
        dispatch({ type: 'budget/addItem', payload: { ...newItem, totalBudget: 0, categories: [], expenses: [] } as BudgetData })
        break
      case 'packing':
        dispatch({ type: 'packing/addItem', payload: { ...newItem, items: [], selectedWeather: [] } as PackingData })
        break
      case 'planner':
        dispatch({ type: 'planner/addItem', payload: { ...newItem, days: [] } as PlannerData })
        break
    }

    // Update the widget config to link to the new item
    dispatch(updateConfig({ id: widgetId, updates: { selectedItemId: itemId } }))

    return itemId
  }
)

export const checkAndApplyPendingLinks = createAsyncThunk(
  'widgets/checkAndApplyPendingLinks',
  async ({ itemId, widgetType }: { itemId: string; widgetType: WidgetConfig['type'] }, { getState, dispatch }: { getState: () => any; dispatch: any }): Promise<void> => {
    const state = getState()
    const pendingLinks = state.widgets.pendingLinks

    // Check if there's a pending link for this item
    const pendingLink = pendingLinks[itemId]
    if (pendingLink && pendingLink.widgetType === widgetType) {
      // Update the widget config to link to this item
      dispatch(updateConfig({ id: pendingLink.widgetId, updates: { selectedItemId: itemId } }))

      // Clear the pending link
      dispatch(clearPendingLink(itemId))
    }
  }
)

const widgetsSlice = createSlice({
  name: 'widgets',
  initialState,
  reducers: {
    setConfigs: (state, action: PayloadAction<WidgetConfig[]>) => {
      state.configs = action.payload
      state.error = null
    },
    addConfig: (state, action: PayloadAction<WidgetConfig>) => {
      // Set order to be at the end
      const newConfig = { ...action.payload, order: state.configs.length }
      state.configs.push(newConfig)
      state.error = null
    },
    updateConfig: (state, action: PayloadAction<{ id: string; updates: Partial<WidgetConfig> }>) => {
      const { id, updates } = action.payload
      const index = state.configs.findIndex(config => config.id === id)
      if (index >= 0) {
        state.configs[index] = { ...state.configs[index], ...updates }
      }
      state.error = null
    },
    removeConfig: (state, action: PayloadAction<string>) => {
      const id = action.payload
      state.configs = state.configs.filter(config => config.id !== id)

      // Update order for remaining configs
      state.configs = state.configs.map((config, index) => ({
        ...config,
        order: index
      }))
      state.error = null
    },
    reorderConfigs: (state, action: PayloadAction<string[]>) => {
      const newOrder = action.payload
      const reordered = newOrder.map((id, index) => {
        const config = state.configs.find(c => c.id === id)
        return config ? { ...config, order: index } : null
      }).filter(Boolean) as WidgetConfig[]

      state.configs = reordered
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setPendingLink: (state, action: PayloadAction<{ widgetId: string; itemId: string; widgetType: string }>) => {
      const { widgetId, itemId, widgetType } = action.payload
      state.pendingLinks[itemId] = { widgetId, widgetType }
    },
    clearPendingLink: (state, action: PayloadAction<string>) => {
      const itemId = action.payload
      delete state.pendingLinks[itemId]
    },
  },
  extraReducers: (builder) => {
    builder
      // createAndLinkItem
      .addCase(createAndLinkItem.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createAndLinkItem.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(createAndLinkItem.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to create and link item'
      })
      // checkAndApplyPendingLinks
      .addCase(checkAndApplyPendingLinks.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(checkAndApplyPendingLinks.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(checkAndApplyPendingLinks.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to check and apply pending links'
      })
  },
})

export const {
  setConfigs,
  addConfig,
  updateConfig,
  removeConfig,
  reorderConfigs,
  setLoading,
  setError,
  setPendingLink,
  clearPendingLink,
} = widgetsSlice.actions

// Selectors
export const selectAllWidgets = (state: { widgets: WidgetsState }) => state.widgets.configs
export const selectWidgetsLoading = (state: { widgets: WidgetsState }) => state.widgets.isLoading
export const selectWidgetsError = (state: { widgets: WidgetsState }) => state.widgets.error
export const selectPendingLinks = (state: { widgets: WidgetsState }) => state.widgets.pendingLinks

export const selectWidgetById = (state: { widgets: WidgetsState }, id: string) =>
  state.widgets.configs.find(config => config.id === id)

export const selectWidgetsByType = (state: { widgets: WidgetsState }, type: string) =>
  state.widgets.configs.filter(config => config.type === type)

export const selectOrderedWidgets = (state: { widgets: WidgetsState }) =>
  [...state.widgets.configs].sort((a, b) => a.order - b.order)

export default widgetsSlice.reducer