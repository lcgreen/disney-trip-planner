import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { BudgetState, BudgetAction } from '../types'
import { BudgetData, BudgetCategory, Expense } from '@/types'
import { getAllBudgetCategories } from '@/config'

const initialState: BudgetState = {
  items: [],
  currentItem: null,
  isLoading: false,
  error: null,
  lastSaved: null,
  isSaving: false,
  // Real-time budget state
  totalBudget: 0,
  categories: getAllBudgetCategories().map(cat => ({
    id: cat.id,
    name: cat.name,
    budget: 0,
    color: cat.color,
    icon: cat.icon
  })),
  expenses: [],
  showAddExpense: false,
  newExpense: {
    category: 'tickets',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    isEstimate: true
  }
}

// Async thunks for budget operations
export const createBudget = createAsyncThunk(
  'budget/create',
  async (name: string = 'My Disney Budget') => {
    const id = `budget-${Date.now()}`
    const newItem: BudgetData = {
      id,
      name,
      totalBudget: 0,
      categories: [],
      expenses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return newItem
  }
)

export const updateBudget = createAsyncThunk(
  'budget/update',
  async ({ id, updates }: { id: string; updates: Partial<BudgetData> }) => {
    return { id, updates: { ...updates, updatedAt: new Date().toISOString() } }
  }
)

export const deleteBudget = createAsyncThunk(
  'budget/delete',
  async (id: string) => {
    return id
  }
)

export const loadBudgets = createAsyncThunk(
  'budget/load',
  async () => {
    // In a real app, this would load from storage
    // For now, we'll return an empty array
    return []
  }
)

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<BudgetData[]>) => {
      state.items = action.payload
    },
    addItem: (state, action: PayloadAction<BudgetData>) => {
      state.items.push(action.payload)
    },
    updateItem: (state, action: PayloadAction<{ id: string; updates: Partial<BudgetData> }>) => {
      const { id, updates } = action.payload
      const index = state.items.findIndex(item => item.id === id)
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates, updatedAt: new Date().toISOString() }
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload)
    },
    setCurrentItem: (state, action: PayloadAction<BudgetData | null>) => {
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
    // Real-time budget actions
    setTotalBudget: (state, action: PayloadAction<number>) => {
      state.totalBudget = action.payload
    },
    setCategories: (state, action: PayloadAction<BudgetCategory[]>) => {
      state.categories = action.payload
    },
    updateCategoryBudget: (state, action: PayloadAction<{ categoryId: string; budget: number }>) => {
      const { categoryId, budget } = action.payload
      const category = state.categories.find(cat => cat.id === categoryId)
      if (category) {
        category.budget = budget
      }
    },
    setExpenses: (state, action: PayloadAction<Expense[]>) => {
      state.expenses = action.payload
    },
    addExpense: (state, action: PayloadAction<Expense>) => {
      state.expenses.push(action.payload)
    },
    deleteExpense: (state, action: PayloadAction<string>) => {
      state.expenses = state.expenses.filter(expense => expense.id !== action.payload)
    },
    setShowAddExpense: (state, action: PayloadAction<boolean>) => {
      state.showAddExpense = action.payload
    },
    setNewExpense: (state, action: PayloadAction<Partial<BudgetState['newExpense']>>) => {
      state.newExpense = { ...state.newExpense, ...action.payload }
    },
    resetNewExpense: (state) => {
      state.newExpense = {
        category: 'tickets',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        isEstimate: true
      }
    },
    loadBudget: (state, action: PayloadAction<BudgetData>) => {
      const budget = action.payload
      state.totalBudget = budget.totalBudget
      state.categories = budget.categories
      state.expenses = budget.expenses
    },
    clearAllBudgets: (state) => {
      state.items = []
    }
  },
  extraReducers: (builder) => {
    builder
      // createBudget
      .addCase(createBudget.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createBudget.fulfilled, (state, action) => {
        state.isLoading = false
        state.items.push(action.payload)
        state.lastSaved = new Date()
      })
      .addCase(createBudget.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to create budget'
      })
      // updateBudget
      .addCase(updateBudget.pending, (state) => {
        state.isSaving = true
        state.error = null
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        state.isSaving = false
        const { id, updates } = action.payload
        const index = state.items.findIndex(item => item.id === id)
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...updates }
        }
        state.lastSaved = new Date()
      })
      .addCase(updateBudget.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.error.message || 'Failed to update budget'
      })
      // deleteBudget
      .addCase(deleteBudget.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = state.items.filter(item => item.id !== action.payload)
        state.lastSaved = new Date()
      })
      .addCase(deleteBudget.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to delete budget'
      })
      // loadBudgets
      .addCase(loadBudgets.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loadBudgets.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(loadBudgets.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to load budgets'
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
  setTotalBudget,
  setCategories,
  updateCategoryBudget,
  setExpenses,
  addExpense,
  deleteExpense,
  setShowAddExpense,
  setNewExpense,
  resetNewExpense,
  loadBudget,
  clearAllBudgets,
} = budgetSlice.actions

export default budgetSlice.reducer