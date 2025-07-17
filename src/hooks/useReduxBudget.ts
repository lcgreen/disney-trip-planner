import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { BudgetData, BudgetCategory, Expense } from '@/types'
import { BudgetState } from '@/store/types'
import { useBudgetAutoSave } from './useReduxAutoSave'
import {
  createBudget,
  updateBudget,
  deleteBudget,
  loadBudgets,
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
} from '@/store/slices/budgetSlice'

export interface UseReduxBudgetReturn {
  // State
  budgets: BudgetData[]
  currentBudget: BudgetData | null
  isLoading: boolean
  error: string | null
  lastSaved: Date | null
  isSaving: boolean

  // Real-time budget state
  budgetData: {
    totalBudget: number
    categories: BudgetCategory[]
    expenses: Expense[]
    showAddExpense: boolean
    newExpense: {
      category: string
      description: string
      amount: string
      date: string
      isEstimate: boolean
    }
  }

  // Actions
  createBudget: (name?: string) => Promise<string>
  updateBudget: (id: string, updates: Partial<BudgetData>) => Promise<void>
  deleteBudget: (id: string) => Promise<void>
  loadBudgets: () => Promise<void>
  setCurrentBudget: (budget: BudgetData | null) => void
  clearError: () => void

  // Real-time budget actions
  setTotalBudget: (budget: number) => void
  setCategories: (categories: BudgetCategory[]) => void
  updateCategoryBudget: (categoryId: string, budget: number) => void
  setExpenses: (expenses: Expense[]) => void
  addExpense: (expense: Expense) => void
  deleteExpense: (id: string) => void
  setShowAddExpense: (show: boolean) => void
  setNewExpense: (expense: Partial<BudgetState['newExpense']>) => void
  resetNewExpense: () => void
  loadBudget: (budget: BudgetData) => void
  clearAllBudgets: () => void

  // Selectors
  getBudgetById: (id: string) => BudgetData | null
  getBudgetsByName: (name: string) => BudgetData[]
  getBudgetsForUser: (userLevel: string) => BudgetData[]

  // Auto-save
  useAutoSave: typeof useBudgetAutoSave
}

export function useReduxBudget(): UseReduxBudgetReturn {
  const dispatch = useAppDispatch()

  // Selectors
  const budgets = useAppSelector((state) => state.budget.items)
  const currentBudget = useAppSelector((state) => state.budget.currentItem)
  const isLoading = useAppSelector((state) => state.budget.isLoading)
  const error = useAppSelector((state) => state.budget.error)
  const lastSaved = useAppSelector((state) => state.budget.lastSaved)
  const isSaving = useAppSelector((state) => state.budget.isSaving)

  // Real-time budget state
  const budgetData = useAppSelector((state) => ({
    totalBudget: state.budget.totalBudget,
    categories: state.budget.categories,
    expenses: state.budget.expenses,
    showAddExpense: state.budget.showAddExpense,
    newExpense: state.budget.newExpense
  }))

  // Actions
  const createBudgetAction = useCallback(async (name: string = 'My Disney Budget'): Promise<string> => {
    const result = await dispatch(createBudget(name))
    if (createBudget.fulfilled.match(result)) {
      return result.payload.id
    }
    throw new Error('Failed to create budget')
  }, [dispatch])

  const updateBudgetAction = useCallback(async (id: string, updates: Partial<BudgetData>): Promise<void> => {
    const result = await dispatch(updateBudget({ id, updates }))
    if (updateBudget.rejected.match(result)) {
      throw new Error('Failed to update budget')
    }
  }, [dispatch])

  const deleteBudgetAction = useCallback(async (id: string): Promise<void> => {
    const result = await dispatch(deleteBudget(id))
    if (deleteBudget.rejected.match(result)) {
      throw new Error('Failed to delete budget')
    }
  }, [dispatch])

  const loadBudgetsAction = useCallback(async (): Promise<void> => {
    const result = await dispatch(loadBudgets())
    if (loadBudgets.rejected.match(result)) {
      throw new Error('Failed to load budgets')
    }
  }, [dispatch])

  const setCurrentBudget = useCallback((budget: BudgetData | null) => {
    dispatch(setCurrentItem(budget))
  }, [dispatch])

  const clearErrorAction = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  // Real-time budget actions
  const setTotalBudgetAction = useCallback((budget: number) => {
    dispatch(setTotalBudget(budget))
  }, [dispatch])

  const setCategoriesAction = useCallback((categories: BudgetCategory[]) => {
    dispatch(setCategories(categories))
  }, [dispatch])

  const updateCategoryBudgetAction = useCallback((categoryId: string, budget: number) => {
    dispatch(updateCategoryBudget({ categoryId, budget }))
  }, [dispatch])

  const setExpensesAction = useCallback((expenses: Expense[]) => {
    dispatch(setExpenses(expenses))
  }, [dispatch])

  const addExpenseAction = useCallback((expense: Expense) => {
    dispatch(addExpense(expense))
  }, [dispatch])

  const deleteExpenseAction = useCallback((id: string) => {
    dispatch(deleteExpense(id))
  }, [dispatch])

  const setShowAddExpenseAction = useCallback((show: boolean) => {
    dispatch(setShowAddExpense(show))
  }, [dispatch])

  const setNewExpenseAction = useCallback((expense: Partial<BudgetState['newExpense']>) => {
    dispatch(setNewExpense(expense))
  }, [dispatch])

  const resetNewExpenseAction = useCallback(() => {
    dispatch(resetNewExpense())
  }, [dispatch])

  const loadBudgetAction = useCallback((budget: BudgetData) => {
    dispatch(loadBudget(budget))
  }, [dispatch])

  const clearAllBudgetsAction = useCallback(() => {
    dispatch(clearAllBudgets())
  }, [dispatch])

  // Selectors
  const getBudgetById = useCallback((id: string): BudgetData | null => {
    return (budgets as BudgetData[]).find(budget => budget.id === id) || null
  }, [budgets])

  const getBudgetsByName = useCallback((name: string): BudgetData[] => {
    return (budgets as BudgetData[]).filter(budget =>
      budget.name.toLowerCase().includes(name.toLowerCase())
    )
  }, [budgets])

  const getBudgetsForUser = useCallback((userLevel: string): BudgetData[] => {
    // Filter budgets based on user level
    if (userLevel === 'anon') {
      // Anonymous users get limited budgets
      return (budgets as BudgetData[]).slice(0, 1) // Limit to 1 budget for anonymous users
    }
    return budgets as BudgetData[]
  }, [budgets])

  return {
    // State
    budgets: budgets as BudgetData[],
    currentBudget,
    isLoading,
    error,
    lastSaved,
    isSaving,

    // Real-time budget state
    budgetData,

    // Actions
    createBudget: createBudgetAction,
    updateBudget: updateBudgetAction,
    deleteBudget: deleteBudgetAction,
    loadBudgets: loadBudgetsAction,
    setCurrentBudget,
    clearError: clearErrorAction,

    // Real-time budget actions
    setTotalBudget: setTotalBudgetAction,
    setCategories: setCategoriesAction,
    updateCategoryBudget: updateCategoryBudgetAction,
    setExpenses: setExpensesAction,
    addExpense: addExpenseAction,
    deleteExpense: deleteExpenseAction,
    setShowAddExpense: setShowAddExpenseAction,
    setNewExpense: setNewExpenseAction,
    resetNewExpense: resetNewExpenseAction,
    loadBudget: loadBudgetAction,
    clearAllBudgets: clearAllBudgetsAction,

    // Selectors
    getBudgetById,
    getBudgetsByName,
    getBudgetsForUser,

    // Auto-save
    useAutoSave: useBudgetAutoSave,
  }
}