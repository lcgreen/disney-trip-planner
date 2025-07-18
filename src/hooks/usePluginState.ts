import { useState, useEffect, useCallback } from 'react'
import { UnifiedStorage } from '@/lib/unifiedStorage'
import { PluginData } from '@/types'

interface PluginState<T extends PluginData> {
  savedItems: T[]
  activeItem: T | null
  canSave: boolean
  isLoading: boolean
  error: string | null
}

interface ModalState {
  showSave: boolean
  showLoad: boolean
  itemToSave: string
}

export function usePluginState<T extends PluginData>(pluginId: string) {
  const [state, setState] = useState<PluginState<T>>({
    savedItems: [],
    activeItem: null,
    canSave: false,
    isLoading: false,
    error: null
  })

  const [modalState, setModalState] = useState<ModalState>({
    showSave: false,
    showLoad: false,
    itemToSave: ''
  })

  // Load saved items from storage
  useEffect(() => {
    const loadItems = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      try {
        const items = UnifiedStorage.getPluginItems<T>(pluginId)
        setState(prev => ({ ...prev, savedItems: items, isLoading: false }))
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: `Failed to load ${pluginId}s: ${error instanceof Error ? error.message : 'Unknown error'}`,
          isLoading: false
        }))
      }
    }

    loadItems()
  }, [pluginId])

  const updateState = useCallback((updates: Partial<PluginState<T>>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const updateModalState = useCallback((updates: Partial<ModalState>) => {
    setModalState(prev => ({ ...prev, ...updates }))
  }, [])

  return {
    state,
    modalState,
    updateState,
    updateModalState
  }
}