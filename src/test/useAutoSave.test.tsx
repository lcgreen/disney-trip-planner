import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePlannerAutoSave } from '@/hooks/useReduxAutoSave'
import ReduxProvider from '@/components/ReduxProvider'

// Mock AutoSaveService and Redux actions
vi.mock('@/lib/autoSaveService', () => ({
  AutoSaveService: {
    saveTripPlanData: vi.fn().mockResolvedValue(undefined)
  }
}))

vi.mock('@/store/slices/plannerSlice', () => ({
  updatePlanner: vi.fn().mockReturnValue({ type: 'planner/updatePlanner' }),
  default: vi.fn().mockReturnValue({})
}))

// Mock timers
vi.useFakeTimers()

describe('usePlannerAutoSave', () => {
  beforeEach(() => {
    vi.clearAllTimers()
    vi.clearAllMocks()
  })

  it('should return auto-save state', () => {
    const data = { id: '1', name: 'Test', days: [], createdAt: new Date().toISOString() }

    const { result } = renderHook(() =>
      usePlannerAutoSave(data, { delay: 1000 }),
      { wrapper: ReduxProvider }
    )

    // Check that the hook returns the expected interface
    expect(result.current).toHaveProperty('isSaving')
    expect(result.current).toHaveProperty('lastSaved')
    expect(result.current).toHaveProperty('error')
    expect(result.current).toHaveProperty('forceSave')
    expect(result.current).toHaveProperty('clearError')
    expect(typeof result.current.forceSave).toBe('function')
    expect(typeof result.current.clearError).toBe('function')
  })

  it('should handle disabled auto-save', () => {
    const data = { id: '1', name: 'Test', days: [], createdAt: new Date().toISOString() }

    const { result } = renderHook(() =>
      usePlannerAutoSave(data, { enabled: false }),
      { wrapper: ReduxProvider }
    )

    // Auto-save should be disabled
    expect(result.current.isSaving).toBe(false)
  })
})