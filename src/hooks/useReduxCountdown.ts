import { useCallback, useMemo, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  selectAllCountdowns,
  selectCurrentCountdown,
  selectCountdownLoading,
  selectCountdownError,
  selectCountdownById,
  selectCountdownsByName,
  createCountdown,
  updateCountdown,
  deleteCountdown,
  loadCountdowns,
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
  initializeParks,
} from '@/store/slices/countdownSlice'
import { CountdownData } from '@/types'
import { useCountdownAutoSave } from './useReduxAutoSave'

export interface UseReduxCountdownReturn {
  // State
  countdowns: CountdownData[]
  currentCountdown: CountdownData | null
  isLoading: boolean
  error: string | null
  lastSaved: Date | null
  isSaving: boolean

  // Real-time countdown state
  countdownData: {
    targetDate: string
    selectedPark: any
    settings: any
    customTheme: any
    isActive: boolean
    countdown: {
      days: number
      hours: number
      minutes: number
      seconds: number
      total: number
    }
    milliseconds: number
    disneyParks: any[]
  }

  // Actions
  createCountdown: (name?: string) => Promise<string>
  updateCountdown: (id: string, updates: Partial<CountdownData>) => Promise<void>
  deleteCountdown: (id: string) => Promise<void>
  loadCountdowns: () => Promise<void>
  setCurrentCountdown: (countdown: CountdownData | null) => void
  clearError: () => void

  // Real-time countdown actions
  setTargetDate: (date: string) => void
  setSelectedPark: (park: any) => void
  setSettings: (settings: any) => void
  setCustomTheme: (theme: any) => void
  startCountdown: () => void
  stopCountdown: () => void
  resetCountdown: () => void
  loadCountdown: (countdown: CountdownData) => void
  clearAllCountdowns: () => void

  // Selectors
  getCountdownById: (id: string) => CountdownData | null
  getCountdownsByName: (name: string) => CountdownData[]
  getCountdownsForUser: (userLevel: string) => CountdownData[]

  // Auto-save
  useAutoSave: (data: any, options?: any) => any
}

export function useReduxCountdown(): UseReduxCountdownReturn {
  const dispatch = useAppDispatch()

  // Selectors
  const countdowns = useAppSelector(selectAllCountdowns)
  const currentCountdown = useAppSelector(selectCurrentCountdown)
  const isLoading = useAppSelector(selectCountdownLoading)
  const error = useAppSelector(selectCountdownError)
  const lastSaved = useAppSelector((state) => state.countdown.lastSaved)
  const isSaving = useAppSelector((state) => state.countdown.isSaving)

  // Real-time countdown state - memoized to prevent unnecessary re-renders
  const countdownData = useAppSelector((state) => ({
    targetDate: state.countdown.targetDate,
    selectedPark: state.countdown.selectedPark,
    settings: state.countdown.settings,
    customTheme: state.countdown.customTheme,
    isActive: state.countdown.isActive,
    countdown: state.countdown.countdown,
    milliseconds: state.countdown.milliseconds,
    disneyParks: state.countdown.disneyParks
  }), (prev, next) => {
    // Custom equality function to prevent unnecessary re-renders
    return (
      prev.targetDate === next.targetDate &&
      prev.selectedPark === next.selectedPark &&
      prev.settings === next.settings &&
      prev.customTheme === next.customTheme &&
      prev.isActive === next.isActive &&
      prev.countdown === next.countdown &&
      prev.milliseconds === next.milliseconds &&
      prev.disneyParks === next.disneyParks
    )
  })

  // Initialize parks data on client side to prevent hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined' && countdownData.disneyParks.length === 0) {
      dispatch(initializeParks())
    }
  }, [dispatch, countdownData.disneyParks.length])

  // Actions
  const createCountdownAction = useCallback(async (name: string = 'My Disney Trip'): Promise<string> => {
    const result = await dispatch(createCountdown(name))
    if (createCountdown.fulfilled.match(result)) {
      return result.payload.id
    }
    throw new Error('Failed to create countdown')
  }, [dispatch])

  const updateCountdownAction = useCallback(async (id: string, updates: Partial<CountdownData>): Promise<void> => {
    const result = await dispatch(updateCountdown({ id, updates }))
    if (updateCountdown.rejected.match(result)) {
      throw new Error('Failed to update countdown')
    }
  }, [dispatch])

  const deleteCountdownAction = useCallback(async (id: string): Promise<void> => {
    const result = await dispatch(deleteCountdown(id))
    if (deleteCountdown.rejected.match(result)) {
      throw new Error('Failed to delete countdown')
    }
  }, [dispatch])

  const loadCountdownsAction = useCallback(async (): Promise<void> => {
    const result = await dispatch(loadCountdowns())
    if (loadCountdowns.rejected.match(result)) {
      throw new Error('Failed to load countdowns')
    }
  }, [dispatch])

  const setCurrentCountdown = useCallback((countdown: CountdownData | null) => {
    dispatch(setCurrentItem(countdown))
  }, [dispatch])

  const clearErrorAction = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  // Real-time countdown actions
  const setTargetDateAction = useCallback((date: string) => {
    dispatch(setTargetDate(date))
  }, [dispatch])

  const setSelectedParkAction = useCallback((park: any) => {
    dispatch(setSelectedPark(park))
  }, [dispatch])

  const setSettingsAction = useCallback((settings: any) => {
    dispatch(setSettings(settings))
  }, [dispatch])

  const setCustomThemeAction = useCallback((theme: any) => {
    dispatch(setCustomTheme(theme))
  }, [dispatch])

  const startCountdownAction = useCallback(() => {
    dispatch(startCountdown())
  }, [dispatch])

  const stopCountdownAction = useCallback(() => {
    dispatch(stopCountdown())
  }, [dispatch])

  const resetCountdownAction = useCallback(() => {
    dispatch(resetCountdown())
  }, [dispatch])

  const loadCountdownAction = useCallback((countdown: CountdownData) => {
    dispatch(loadCountdown(countdown))
  }, [dispatch])

  const clearAllCountdownsAction = useCallback(() => {
    dispatch(clearAllCountdowns())
  }, [dispatch])

  // Selectors
  const getCountdownById = useCallback((id: string): CountdownData | null => {
    return (countdowns as CountdownData[]).find(countdown => countdown.id === id) || null
  }, [countdowns])

  const getCountdownsByName = useCallback((name: string): CountdownData[] => {
    return (countdowns as CountdownData[]).filter(countdown =>
      countdown.name.toLowerCase().includes(name.toLowerCase())
    )
  }, [countdowns])

  const getCountdownsForUser = useCallback((userLevel: string): CountdownData[] => {
    // Filter countdowns based on user level
    if (userLevel === 'anon') {
      // Anonymous users get limited countdowns
      return (countdowns as CountdownData[]).slice(0, 2) // Limit to 2 countdowns for anonymous users
    }
    return countdowns as CountdownData[]
  }, [countdowns])

  // Auto-save hook - return the hook function directly
  const useAutoSave = useCountdownAutoSave

  return {
    // State
    countdowns,
    currentCountdown,
    isLoading,
    error,
    lastSaved,
    isSaving,

    // Real-time countdown state
    countdownData,

    // Actions
    createCountdown: createCountdownAction,
    updateCountdown: updateCountdownAction,
    deleteCountdown: deleteCountdownAction,
    loadCountdowns: loadCountdownsAction,
    setCurrentCountdown,
    clearError: clearErrorAction,

    // Real-time countdown actions
    setTargetDate: setTargetDateAction,
    setSelectedPark: setSelectedParkAction,
    setSettings: setSettingsAction,
    setCustomTheme: setCustomThemeAction,
    startCountdown: startCountdownAction,
    stopCountdown: stopCountdownAction,
    resetCountdown: resetCountdownAction,
    loadCountdown: loadCountdownAction,
    clearAllCountdowns: clearAllCountdownsAction,

    // Selectors
    getCountdownById,
    getCountdownsByName,
    getCountdownsForUser,

    // Auto-save
    useAutoSave,
  }
}