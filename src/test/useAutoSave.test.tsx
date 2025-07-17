import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAutoSave } from '@/hooks/useAutoSave'

// Mock timers
vi.useFakeTimers()

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.clearAllTimers()
  })

  it('should call save function after delay', async () => {
    const saveFunction = vi.fn()
    const data = { id: '1', name: 'Test' }

    const { result } = renderHook(() =>
      useAutoSave(data, saveFunction, { delay: 1000 })
    )

    // Fast-forward time by 1 second
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Wait for async operations
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(saveFunction).toHaveBeenCalledWith(data)
  })

  it('should debounce multiple calls', async () => {
    const saveFunction = vi.fn()
    const data1 = { id: '1', name: 'Test1' }
    const data2 = { id: '1', name: 'Test2' }

    const { result, rerender } = renderHook(
      ({ data }) => useAutoSave(data, saveFunction, { delay: 1000 }),
      { initialProps: { data: data1 } }
    )

    // Change data before delay expires
    act(() => {
      rerender({ data: data2 })
    })

    // Fast-forward time by 1 second
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Wait for async operations
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    // Should only call saveFunction once with the latest data
    expect(saveFunction).toHaveBeenCalledTimes(1)
    expect(saveFunction).toHaveBeenCalledWith(data2)
  })
})