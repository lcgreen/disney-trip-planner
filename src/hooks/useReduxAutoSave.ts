import { useEffect, useRef, useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { RootState } from '@/store/types'

interface AutoSaveOptions {
  delay?: number // Debounce delay in milliseconds
  enabled?: boolean // Whether auto-save is enabled
  onSave?: () => void // Callback when save is triggered
  onError?: (error: Error) => void // Callback for save errors
  widgetId?: string // Widget ID for linking data to widgets
}

interface UseReduxAutoSaveReturn {
  isSaving: boolean
  lastSaved: Date | null
  error: string | null
  forceSave: () => Promise<void>
  clearError: () => void
}

/**
 * Redux-based auto-save hook that integrates with Redux slices
 * @param sliceName - The name of the Redux slice (e.g., 'countdown', 'budget')
 * @param data - The data to auto-save
 * @param saveAction - Redux action to dispatch for saving
 * @param options - Configuration options
 */
export function useReduxAutoSave<T>(
  sliceName: keyof RootState,
  data: T,
  saveAction: (data: T) => any,
  options: AutoSaveOptions = {}
): UseReduxAutoSaveReturn {
  const {
    delay = 1000, // Default 1 second delay
    enabled = true,
    onSave,
    onError
  } = options

  const dispatch = useAppDispatch()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedDataRef = useRef<T | null>(null)
  const currentDataRef = useRef<T>(data)
  const saveActionRef = useRef(saveAction)

  // Get state from the specific slice
  const sliceState = useAppSelector((state: RootState) => state[sliceName]) as any
  const isSaving = sliceState?.isSaving || false
  const lastSaved = sliceState?.lastSaved || null
  const error = sliceState?.error || null

  // Update refs when data or saveAction changes
  useEffect(() => {
    currentDataRef.current = data
  }, [data])

  useEffect(() => {
    saveActionRef.current = saveAction
  }, [saveAction])

  // Trigger auto-save when data changes
  useEffect(() => {
    if (!enabled) return

    const currentData = currentDataRef.current
    console.log(`[useReduxAutoSave:${sliceName}] Data changed, triggering debounced save:`, currentData)

    // Clear existing timeout
    if (timeoutRef.current) {
      console.log(`[useReduxAutoSave:${sliceName}] Clearing existing timeout`)
      clearTimeout(timeoutRef.current)
    }

    console.log(`[useReduxAutoSave:${sliceName}] Setting new timeout with delay:`, delay)
    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      console.log(`[useReduxAutoSave:${sliceName}] Timeout executed! About to save data...`)
      try {
        console.log(`[useReduxAutoSave:${sliceName}] Executing save, data changed:`, JSON.stringify(currentData) !== JSON.stringify(lastSavedDataRef.current))
        // Check if data has actually changed
        if (JSON.stringify(currentData) !== JSON.stringify(lastSavedDataRef.current)) {
          await dispatch(saveActionRef.current(currentData))
          lastSavedDataRef.current = JSON.parse(JSON.stringify(currentData)) // Deep clone
          onSave?.()
        } else {
          console.log(`[useReduxAutoSave:${sliceName}] Data unchanged, skipping save`)
        }
      } catch (error) {
        console.error(`Auto-save failed for ${sliceName}:`, error)
        onError?.(error as Error)
      }
    }, delay)

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, delay, enabled, onSave, onError, dispatch, sliceName])

  // Force save function (for immediate saves)
  const forceSave = useCallback(async () => {
    if (!enabled) return

    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    try {
      await dispatch(saveActionRef.current(data))
      lastSavedDataRef.current = JSON.parse(JSON.stringify(data)) // Deep clone
      onSave?.()
    } catch (error) {
      console.error(`Force save failed for ${sliceName}:`, error)
      onError?.(error as Error)
    }
  }, [data, saveAction, enabled, onSave, onError, dispatch, sliceName])

  // Clear error function
  const clearError = useCallback(() => {
    // Dispatch clear error action for the specific slice
    dispatch({ type: `${sliceName}/clearError` })
  }, [dispatch, sliceName])

  return { isSaving, lastSaved, error, forceSave, clearError }
}

/**
 * Specialized auto-save hook for countdown data
 */
export function useCountdownAutoSave(
  data: any,
  options: AutoSaveOptions = {}
) {
  // Create a custom save action that integrates with AutoSaveService
  const saveCountdownData = (countdownData: any) => {
    return async (dispatch: any) => {
      const { AutoSaveService } = await import('@/lib/autoSaveService')
      const { updateCountdown } = await import('@/store/slices/countdownSlice')

      // First save to AutoSaveService for persistence
      await AutoSaveService.saveCountdownData(countdownData, options.widgetId)

      // Then update Redux state
      dispatch(updateCountdown({ id: countdownData.id, updates: countdownData }))
    }
  }

  return useReduxAutoSave('countdown', data, saveCountdownData, options)
}

/**
 * Specialized auto-save hook for budget data
 */
export function useBudgetAutoSave(
  data: any,
  options: AutoSaveOptions = {}
) {
  // Create a custom save action that integrates with AutoSaveService
  const saveBudgetData = (budgetData: any) => {
    return async (dispatch: any) => {
      const { AutoSaveService } = await import('@/lib/autoSaveService')
      const { updateBudget } = await import('@/store/slices/budgetSlice')

      // First save to AutoSaveService for persistence
      await AutoSaveService.saveBudgetData(budgetData, options.widgetId)

      // Then update Redux state
      dispatch(updateBudget({ id: budgetData.id, updates: budgetData }))
    }
  }

  return useReduxAutoSave('budget', data, saveBudgetData, options)
}

/**
 * Specialized auto-save hook for packing data
 */
export function usePackingAutoSave(
  data: any,
  options: AutoSaveOptions = {}
) {
  // Create a custom save action that integrates with AutoSaveService
  const savePackingData = (packingData: any) => {
    return async (dispatch: any) => {
      const { AutoSaveService } = await import('@/lib/autoSaveService')
      const { updatePacking } = await import('@/store/slices/packingSlice')

      // First save to AutoSaveService for persistence
      await AutoSaveService.savePackingData(packingData, options.widgetId)

      // Then update Redux state
      dispatch(updatePacking({ id: packingData.id, updates: packingData }))
    }
  }

  return useReduxAutoSave('packing', data, savePackingData, options)
}

/**
 * Specialized auto-save hook for planner data
 */
export function usePlannerAutoSave(
  data: any,
  options: AutoSaveOptions = {}
) {
  // Create a custom save action that integrates with AutoSaveService
  const savePlannerData = (plannerData: any) => {
    return async (dispatch: any) => {
      const { AutoSaveService } = await import('@/lib/autoSaveService')
      const { updatePlanner } = await import('@/store/slices/plannerSlice')

      // First save to AutoSaveService for persistence
      await AutoSaveService.saveTripPlanData(plannerData, options.widgetId)

      // Then update Redux state
      dispatch(updatePlanner({ id: plannerData.id, updates: plannerData }))
    }
  }

  return useReduxAutoSave('planner', data, savePlannerData, options)
}