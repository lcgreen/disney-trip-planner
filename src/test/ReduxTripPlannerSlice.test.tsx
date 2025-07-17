import { describe, it, expect, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import plannerSlice, {
  setItems,
  addItem,
  updateItem,
  removeItem,
  setCurrentItem,
  setDays,
  setCurrentName,
  addDay,
  deleteDay,
  addPlan,
  updatePlan,
  deletePlan,
  loadPlanner,
  clearAllPlanner
} from '@/store/slices/plannerSlice'
import { PlannerState } from '@/store/types'

describe('Redux TripPlanner Slice', () => {
  let store: ReturnType<typeof configureStore>

  beforeEach(() => {
    store = configureStore({
      reducer: {
        planner: plannerSlice
      }
    })
  })

  it('should have initial state', () => {
    const state = store.getState().planner as PlannerState

    expect(state.items).toEqual([])
    expect(state.currentItem).toBeNull()
    expect(state.days).toEqual([])
    expect(state.currentName).toBe('')
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
    expect(state.lastSaved).toBeNull()
    expect(state.isSaving).toBe(false)
  })

  it('should set items', () => {
    const items = [
      {
        id: 'plan-1',
        name: 'Summer Trip',
        days: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]

    store.dispatch(setItems(items))

    const state = store.getState().planner as PlannerState
    expect(state.items).toEqual(items)
  })

  it('should add item', () => {
    const newItem = {
      id: 'plan-1',
      name: 'Summer Trip',
      days: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }

    store.dispatch(addItem(newItem))

    const state = store.getState().planner as PlannerState
    expect(state.items).toHaveLength(1)
    expect(state.items[0]).toEqual(newItem)
  })

  it('should update item', () => {
    const item = {
      id: 'plan-1',
      name: 'Summer Trip',
      days: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }

    store.dispatch(addItem(item))
    store.dispatch(updateItem({ id: 'plan-1', updates: { name: 'Updated Trip' } }))

    const state = store.getState().planner as PlannerState
    expect(state.items[0].name).toBe('Updated Trip')
  })

  it('should remove item', () => {
    const item = {
      id: 'plan-1',
      name: 'Summer Trip',
      days: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }

    store.dispatch(addItem(item))
    store.dispatch(removeItem('plan-1'))

    const state = store.getState().planner as PlannerState
    expect(state.items).toHaveLength(0)
  })

  it('should set current item', () => {
    const item = {
      id: 'plan-1',
      name: 'Summer Trip',
      days: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }

    store.dispatch(setCurrentItem(item))

    const state = store.getState().planner as PlannerState
    expect(state.currentItem).toEqual(item)
  })

  it('should set days', () => {
    const days = [
      {
        id: 'day-1',
        date: '2024-07-15',
        park: 'Magic Kingdom',
        plans: []
      }
    ]

    store.dispatch(setDays(days))

    const state = store.getState().planner as PlannerState
    expect(state.days).toEqual(days)
  })

  it('should set current name', () => {
    store.dispatch(setCurrentName('Summer Trip'))

    const state = store.getState().planner as PlannerState
    expect(state.currentName).toBe('Summer Trip')
  })

  it('should add day', () => {
    const day = {
      id: 'day-1',
      date: '2024-07-15',
      park: 'Magic Kingdom',
      plans: []
    }

    store.dispatch(addDay(day))

    const state = store.getState().planner as PlannerState
    expect(state.days).toHaveLength(1)
    expect(state.days[0]).toEqual(day)
  })

  it('should delete day', () => {
    const day = {
      id: 'day-1',
      date: '2024-07-15',
      park: 'Magic Kingdom',
      plans: []
    }

    store.dispatch(addDay(day))
    store.dispatch(deleteDay('day-1'))

    const state = store.getState().planner as PlannerState
    expect(state.days).toHaveLength(0)
  })

  it('should add plan to day', () => {
    const day = {
      id: 'day-1',
      date: '2024-07-15',
      park: 'Magic Kingdom',
      plans: []
    }

    const plan = {
      id: 'plan-1',
      time: '09:00',
      activity: 'Breakfast',
      park: 'Magic Kingdom'
    }

    store.dispatch(addDay(day))
    store.dispatch(addPlan({ dayId: 'day-1', plan }))

    const state = store.getState().planner as PlannerState
    expect(state.days[0].plans).toHaveLength(1)
    expect(state.days[0].plans[0]).toEqual(plan)
  })

  it('should update plan', () => {
    const day = {
      id: 'day-1',
      date: '2024-07-15',
      park: 'Magic Kingdom',
      plans: [{
        id: 'plan-1',
        time: '09:00',
        activity: 'Breakfast',
        park: 'Magic Kingdom'
      }]
    }

    store.dispatch(addDay(day))
    store.dispatch(updatePlan({ planId: 'plan-1', updates: { activity: 'Lunch' } }))

    const state = store.getState().planner as PlannerState
    expect(state.days[0].plans[0].activity).toBe('Lunch')
  })

  it('should delete plan', () => {
    const day = {
      id: 'day-1',
      date: '2024-07-15',
      park: 'Magic Kingdom',
      plans: [{
        id: 'plan-1',
        time: '09:00',
        activity: 'Breakfast',
        park: 'Magic Kingdom'
      }]
    }

    store.dispatch(addDay(day))
    store.dispatch(deletePlan('plan-1'))

    const state = store.getState().planner as PlannerState
    expect(state.days[0].plans).toHaveLength(0)
  })

  it('should load planner data', () => {
    const plannerData = {
      id: 'plan-1',
      name: 'Summer Trip',
      days: [{
        id: 'day-1',
        date: '2024-07-15',
        park: 'Magic Kingdom',
        plans: [{
          id: 'plan-1',
          time: '09:00',
          activity: 'Breakfast',
          park: 'Magic Kingdom'
        }]
      }],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }

    store.dispatch(loadPlanner(plannerData))

    const state = store.getState().planner as PlannerState
    expect(state.days).toEqual(plannerData.days)
    expect(state.currentName).toBe(plannerData.name)
  })

  it('should clear all planner data', () => {
    // First add some data
    const day = {
      id: 'day-1',
      date: '2024-07-15',
      park: 'Magic Kingdom',
      plans: []
    }
    store.dispatch(addDay(day))
    store.dispatch(setCurrentName('Summer Trip'))

    // Then clear it
    store.dispatch(clearAllPlanner())

    const state = store.getState().planner as PlannerState
    expect(state.days).toEqual([])
    expect(state.currentName).toBe('')
  })
})