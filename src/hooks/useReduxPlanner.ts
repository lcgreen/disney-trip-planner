import { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, PlannerState } from '@/store/types'
import {
  createPlanner,
  updatePlanner,
  deletePlanner,
  loadPlanners,
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
  setCurrentItem,
  setSaving,
  setLastSaved,
  clearError,
} from '@/store/slices/plannerSlice'
import { PlannerData, PlannerDay, PlannerPlan } from '@/types'
import { AppDispatch } from '@/store'

export const useReduxPlanner = () => {
  const dispatch = useDispatch<AppDispatch>()
  const plannerState = useSelector((state: RootState) => state.planner)

  // Calculate stats when days change
  const calculateStats = useCallback(() => {
    const totalDays = plannerState.days.length
    const totalPlans = plannerState.days.reduce((total, day) => total + day.plans.length, 0)
    const parksSet = new Set<string>()
    plannerState.days.forEach(day => {
      day.plans.forEach(plan => {
        parksSet.add(plan.park)
      })
    })
    const parksCount = parksSet.size

    return { totalDays, totalPlans, parksCount }
  }, [plannerState.days])

  // Update stats when days change
  useEffect(() => {
    const stats = calculateStats()
    dispatch(setStats(stats))
  }, [dispatch, calculateStats])

  // Actions
  const createPlannerList = useCallback(async (name: string = 'My Trip Plan') => {
    try {
      const result = await dispatch(createPlanner(name)).unwrap()
      return result
    } catch (error) {
      console.error('Failed to create planner:', error)
      throw error
    }
  }, [dispatch])

  const updatePlannerList = useCallback(async (id: string, updates: Partial<PlannerData>) => {
    try {
      const result = await dispatch(updatePlanner({ id, updates })).unwrap()
      return result
    } catch (error) {
      console.error('Failed to update planner:', error)
      throw error
    }
  }, [dispatch])

  const deletePlannerList = useCallback(async (id: string) => {
    try {
      await dispatch(deletePlanner(id)).unwrap()
    } catch (error) {
      console.error('Failed to delete planner:', error)
      throw error
    }
  }, [dispatch])

  const loadPlannerLists = useCallback(async () => {
    try {
      const result = await dispatch(loadPlanners()).unwrap()
      return result
    } catch (error) {
      console.error('Failed to load planners:', error)
      throw error
    }
  }, [dispatch])

  const addNewDay = useCallback(() => {
    // Clear previous errors
    dispatch(clearFormErrors())

    // Validation
    if (!plannerState.newDay.date) {
      dispatch(setFormErrors({ date: 'Date is required' }))
      return false
    }

    // Check if date already exists
    const existingDay = plannerState.days.find(day => day.date === plannerState.newDay.date)
    if (existingDay) {
      dispatch(setFormErrors({ date: 'A plan for this date already exists' }))
      return false
    }

    const day: PlannerDay = {
      id: Date.now().toString(),
      date: plannerState.newDay.date,
      plans: []
    }

    dispatch(addDay(day))
    dispatch(resetNewDay())
    dispatch(setShowAddDay(false))
    dispatch(clearFormErrors())
    return true
  }, [dispatch, plannerState.newDay.date, plannerState.days])

  const deleteDayAction = useCallback((dayId: string) => {
    dispatch(deleteDay(dayId))
  }, [dispatch])

  const addPlanAction = useCallback(() => {
    if (!plannerState.newPlan.time || !plannerState.newPlan.activity || !plannerState.selectedDayId) {
      return false
    }

    const plan: PlannerPlan = {
      id: Date.now().toString(),
      date: plannerState.days.find(day => day.id === plannerState.selectedDayId)?.date || '',
      time: plannerState.newPlan.time,
      activity: plannerState.newPlan.activity,
      park: plannerState.newPlan.park
    }

    dispatch(addPlan({ dayId: plannerState.selectedDayId, plan }))
    dispatch(resetNewPlan())
    dispatch(setShowAddPlan(false))
    dispatch(setSelectedDayId(null))
    return true
  }, [dispatch, plannerState.newPlan, plannerState.selectedDayId, plannerState.days])

  const updatePlanAction = useCallback((planId: string, updates: Partial<PlannerPlan>) => {
    dispatch(updatePlan({ planId, updates }))
  }, [dispatch])

  const deletePlanAction = useCallback((planId: string) => {
    dispatch(deletePlan(planId))
  }, [dispatch])

  const getTotalPlans = useCallback(() => {
    return plannerState.days.reduce((total, day) => total + day.plans.length, 0)
  }, [plannerState.days])

  const getPlansByPark = useCallback(() => {
    const plansByPark: Record<string, number> = {}
    plannerState.days.forEach(day => {
      day.plans.forEach(plan => {
        plansByPark[plan.park] = (plansByPark[plan.park] || 0) + 1
      })
    })
    return plansByPark
  }, [plannerState.days])

  const loadPlannerData = useCallback((data: PlannerData) => {
    dispatch(loadPlanner(data))
  }, [dispatch])

  const clearAllPlannerData = useCallback(() => {
    dispatch(clearAllPlanner())
  }, [dispatch])

  const setCurrentPlannerItem = useCallback((item: PlannerData | null) => {
    dispatch(setCurrentItem(item))
  }, [dispatch])

  const setPlannerSaving = useCallback((saving: boolean) => {
    dispatch(setSaving(saving))
  }, [dispatch])

  const setPlannerLastSaved = useCallback((date: Date | null) => {
    dispatch(setLastSaved(date))
  }, [dispatch])

  const clearPlannerError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  // Computed values
  const totalPlans = useMemo(() => getTotalPlans(), [getTotalPlans])
  const plansByPark = useMemo(() => getPlansByPark(), [getPlansByPark])

  return {
    // State
    ...plannerState,
    totalPlans,
    plansByPark,

    // Actions
    createPlannerList,
    updatePlannerList,
    deletePlannerList,
    loadPlannerLists,
    addNewDay,
    deleteDay: deleteDayAction,
    addPlan: addPlanAction,
    updatePlan: updatePlanAction,
    deletePlan: deletePlanAction,
    loadPlannerData,
    clearAllPlannerData,
    setCurrentPlannerItem,
    setPlannerSaving,
    setPlannerLastSaved,
    clearPlannerError,

    // State setters
    setCurrentName: (name: string) => dispatch(setCurrentName(name)),
    setShowAddDay: (show: boolean) => dispatch(setShowAddDay(show)),
    setShowAddPlan: (show: boolean) => dispatch(setShowAddPlan(show)),
    setEditingPlan: (plan: PlannerPlan | null) => dispatch(setEditingPlan(plan)),
    setNewDay: (updates: Partial<PlannerState['newDay']>) => dispatch(setNewDay(updates)),
    setNewPlan: (updates: Partial<PlannerState['newPlan']>) => dispatch(setNewPlan(updates)),
    setSelectedDayId: (id: string | null) => dispatch(setSelectedDayId(id)),
    setFormErrors: (errors: Partial<PlannerState['formErrors']>) => dispatch(setFormErrors(errors)),

    // Utility functions
    getTotalPlans,
    getPlansByPark,
    calculateStats,
  }
}