import { useCallback } from 'react'
import { UnifiedStorage } from '@/lib/unifiedStorage'
import { PluginData } from '@/types'
import { useReduxUser } from '@/hooks/useReduxUser'

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

interface PluginCallbacks<T extends PluginData> {
  onSave?: (data: Partial<T>) => void
  onLoad?: (item: T) => void
  onNew?: () => void
  onNameChange?: (name: string) => void
  setCanSave?: (canSave: boolean) => void
}

export function usePluginActions<T extends PluginData>(
  pluginId: string,
  state: PluginState<T>,
  modalState: ModalState,
  updateState: (updates: Partial<PluginState<T>>) => void,
  updateModalState: (updates: Partial<ModalState>) => void,
  callbacks: PluginCallbacks<T>
) {
  const { hasFeatureAccess } = useReduxUser()

  const handleSave = useCallback((name: string) => {
    updateModalState({ itemToSave: name, showSave: true })
  }, [updateModalState])

  const confirmSave = useCallback(async () => {
    if (!modalState.itemToSave.trim()) return

    if (!hasFeatureAccess('saveData')) {
      console.warn('Save blocked: User does not have save permissions')
      return
    }

    try {
      updateState({ isLoading: true, error: null })

      const newItem: T = {
        id: Date.now().toString(),
        name: modalState.itemToSave.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as T

      await UnifiedStorage.addPluginItem(pluginId, newItem)

      updateState({
        savedItems: [...state.savedItems, newItem],
        activeItem: newItem,
        isLoading: false
      })

      updateModalState({ showSave: false, itemToSave: '' })

      // Call parent callbacks
      callbacks.onNameChange?.(newItem.name)
      callbacks.onSave?.(newItem)
    } catch (error) {
      updateState({
        error: `Failed to save ${pluginId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isLoading: false
      })
    }
  }, [modalState.itemToSave, hasFeatureAccess, pluginId, updateState, updateModalState, callbacks, state.savedItems])

  const handleLoad = useCallback(() => {
    updateModalState({ showLoad: true })
  }, [updateModalState])

  const handleSelectLoad = useCallback((item: T) => {
    updateState({ activeItem: item })
    updateModalState({ showLoad: false })
    callbacks.onNameChange?.(item.name)
    callbacks.onLoad?.(item)
  }, [updateState, updateModalState, callbacks])

  const handleNew = useCallback(() => {
    updateState({ activeItem: null, canSave: false })
    updateModalState({ itemToSave: '' })
    callbacks.onNameChange?.('')
    callbacks.onNew?.()
  }, [updateState, updateModalState, callbacks])

  return {
    handleSave,
    confirmSave,
    handleLoad,
    handleSelectLoad,
    handleNew
  }
}