import { useMemo, useEffect } from 'react'
import { useAutoSave } from '@/hooks/useAutoSave'
import { AutoSaveService } from '@/lib/autoSaveService'
import { CountdownData } from '@/types'
import type { DisneyPark } from '@/config'

interface UseCountdownAutoSaveProps {
  widgetId: string | null
  isEditMode: boolean
  targetDate: string
  createdItemId: string | null
  activeCountdown: CountdownData | null
  editedName: string
  name: string
  selectedPark: DisneyPark | null
  settings: any
  customTheme: any
}

export function useCountdownAutoSave({
  widgetId,
  isEditMode,
  targetDate,
  createdItemId,
  activeCountdown,
  editedName,
  name,
  selectedPark,
  settings,
  customTheme
}: UseCountdownAutoSaveProps) {
  // Auto-save functionality for widget editing
  const autoSaveData = useMemo(() => {
    if (!widgetId || !isEditMode || !targetDate) return null

    return {
      id: createdItemId || activeCountdown?.id || Date.now().toString(),
      name: editedName || name || 'New Countdown',
      tripDate: (() => {
        const date = new Date(targetDate)
        return !isNaN(date.getTime()) ? date.toISOString() : targetDate
      })(),
      park: selectedPark,
      settings,
      theme: customTheme || undefined,
      createdAt: activeCountdown?.createdAt || new Date().toISOString()
    }
  }, [widgetId, isEditMode, targetDate, createdItemId, activeCountdown?.id, activeCountdown?.createdAt, editedName, name, selectedPark?.id, JSON.stringify(settings), customTheme?.id])

  const { forceSave, isSaving, lastSaved, error } = useAutoSave(
    autoSaveData,
    async (data) => {
      if (data) {
        console.log('[AutoSave] Attempting to save countdown data:', data)
        await AutoSaveService.saveCountdownData(data, widgetId || undefined)
      }
    },
    {
      enabled: !!autoSaveData,
      delay: 1000, // 1 second delay
      onSave: () => {
        console.log('[AutoSave] Successfully auto-saved countdown changes')
      },
      onError: (error) => {
        console.error('[AutoSave] Auto-save failed:', error)
      }
    }
  )

  // Debug logging for auto-save conditions (only in development)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[AutoSave Debug] Conditions:', {
        widgetId,
        isEditMode,
        hasAutoSaveData: !!autoSaveData,
        autoSaveEnabled: !!autoSaveData,
        targetDate: !!targetDate
      })
    }
  }, [widgetId, isEditMode, autoSaveData, targetDate])

  return {
    forceSave,
    isSaving,
    lastSaved,
    error,
    autoSaveData
  }
}