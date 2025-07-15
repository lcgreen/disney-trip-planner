import { useEffect, useRef, useCallback, useState } from 'react'

interface AutoSaveOptions {
  delay?: number // Debounce delay in milliseconds
  enabled?: boolean // Whether auto-save is enabled
  onSave?: () => void // Callback when save is triggered
  onError?: (error: Error) => void // Callback for save errors
}

/**
 * Custom hook for auto-saving data with debouncing
 * @param data - The data to auto-save
 * @param saveFunction - Function to save the data
 * @param options - Configuration options
 */
export function useAutoSave<T>(
  data: T,
  saveFunction: (data: T) => void | Promise<void>,
  options: AutoSaveOptions = {}
) {
  const {
    delay = 1000, // Default 1 second delay
    enabled = true,
    onSave,
    onError
  } = options

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedDataRef = useRef<T | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Debounced save function
  const debouncedSave = useCallback(() => {
    console.log('[useAutoSave] debouncedSave called, enabled:', enabled, 'data:', data)
    if (!enabled) {
      console.log('[useAutoSave] Auto-save disabled')
      return
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        console.log('[useAutoSave] Executing save, data changed:', JSON.stringify(data) !== JSON.stringify(lastSavedDataRef.current))
        // Check if data has actually changed
        if (JSON.stringify(data) !== JSON.stringify(lastSavedDataRef.current)) {
          setIsSaving(true)
          setError(null)

          await saveFunction(data)
          lastSavedDataRef.current = JSON.parse(JSON.stringify(data)) // Deep clone
          setLastSaved(new Date())
          setIsSaving(false)
          onSave?.()
        } else {
          console.log('[useAutoSave] Data unchanged, skipping save')
        }
      } catch (error) {
        console.error('Auto-save failed:', error)
        setError(error instanceof Error ? error.message : 'Save failed')
        setIsSaving(false)
        onError?.(error as Error)
      }
    }, delay)
  }, [data, saveFunction, delay, enabled, onSave, onError])

  // Trigger auto-save when data changes
  useEffect(() => {
    debouncedSave()

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [debouncedSave])

  // Force save function (for immediate saves)
  const forceSave = useCallback(async () => {
    if (!enabled) return

    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    try {
      setIsSaving(true)
      setError(null)

      await saveFunction(data)
      lastSavedDataRef.current = JSON.parse(JSON.stringify(data)) // Deep clone
      setLastSaved(new Date())
      setIsSaving(false)
      onSave?.()
    } catch (error) {
      console.error('Force save failed:', error)
      setError(error instanceof Error ? error.message : 'Save failed')
      setIsSaving(false)
      onError?.(error as Error)
    }
  }, [data, saveFunction, enabled, onSave, onError])

  return { forceSave, isSaving, lastSaved, error }
}