import { Middleware } from '@reduxjs/toolkit'
import { RootState } from '../types'
import { AutoSaveData } from '../types'

// Auto-save configuration
const AUTO_SAVE_CONFIG = {
  delay: 1000, // 1 second delay
  enabled: true,
} as const

// Track pending auto-saves
const pendingAutoSaves = new Map<string, NodeJS.Timeout>()

// Auto-save actions that should trigger debounced saves
const AUTO_SAVE_ACTIONS = [
  'countdown/updateItem',
  'budget/updateItem',
  'packing/updateItem',
  'planner/updateItem',
] as const

export const autoSaveMiddleware: Middleware<{}, RootState> = store => next => action => {
  // Call the next middleware
  const result = next(action)

  // Check if this action should trigger auto-save
  if (AUTO_SAVE_ACTIONS.includes((action as any).type) && AUTO_SAVE_CONFIG.enabled) {
    const state = store.getState()
    const actionType = (action as any).type as string
    const payload = (action as any).payload

    // Don't auto-save for anonymous users (except in test mode)
    if (state.user.currentUser?.level === 'anon' && process.env.NODE_ENV !== 'test') {
      return result
    }

    // Determine the data type and ID from the action
    let dataType: AutoSaveData['type'] | null = null
    let itemId: string | null = null

    if (actionType.startsWith('countdown/')) {
      dataType = 'countdown'
      itemId = payload?.id
    } else if (actionType.startsWith('budget/')) {
      dataType = 'budget'
      itemId = payload?.id
    } else if (actionType.startsWith('packing/')) {
      dataType = 'packing'
      itemId = payload?.id
    } else if (actionType.startsWith('planner/')) {
      dataType = 'planner'
      itemId = payload?.id
    }

    if (dataType && itemId) {
      // Create a unique key for this auto-save
      const autoSaveKey = `${dataType}-${itemId}`

      // Clear existing timeout for this item
      if (pendingAutoSaves.has(autoSaveKey)) {
        clearTimeout(pendingAutoSaves.get(autoSaveKey)!)
      }

      // Set new timeout for auto-save
      const timeout = setTimeout(() => {
        try {
          // Get the current state for this data type
          let currentData: any = null
          let autoSaveStatusAction: any = null

          switch (dataType) {
            case 'countdown':
              currentData = state.countdown.items.find(item => item.id === itemId)
              autoSaveStatusAction = { type: 'countdown/setAutoSaveStatus', payload: { isSaving: true } }
              break
            case 'budget':
              currentData = state.budget.items.find(item => item.id === itemId)
              autoSaveStatusAction = { type: 'budget/setAutoSaveStatus', payload: { isSaving: true } }
              break
            case 'packing':
              currentData = state.packing.items.find(item => item.id === itemId)
              autoSaveStatusAction = { type: 'packing/setAutoSaveStatus', payload: { isSaving: false } }
              break
            case 'planner':
              currentData = state.planner.items.find(item => item.id === itemId)
              autoSaveStatusAction = { type: 'planner/setAutoSaveStatus', payload: { isSaving: true } }
              break
          }

          if (currentData && autoSaveStatusAction) {
            // Dispatch auto-save status update
            store.dispatch(autoSaveStatusAction)

            // Simulate auto-save (in a real app, this would be an API call)
            setTimeout(() => {
              // Update auto-save status to indicate success
              const successAction = {
                type: `${dataType}/setAutoSaveStatus`,
                payload: {
                  isSaving: false,
                  lastSaved: new Date().toISOString(),
                  error: null,
                },
              }
              store.dispatch(successAction as any)

              console.log(`[AutoSaveMiddleware] Auto-saved ${dataType} item:`, itemId)
            }, 100) // Simulate async operation

            // Remove from pending auto-saves
            pendingAutoSaves.delete(autoSaveKey)
          }
        } catch (error) {
          console.error('[AutoSaveMiddleware] Auto-save failed:', error)

          // Update auto-save status to indicate error
          const errorAction = {
            type: `${dataType}/setAutoSaveStatus`,
            payload: {
              isSaving: false,
              error: error instanceof Error ? error.message : 'Auto-save failed',
            },
          }
          store.dispatch(errorAction as any)

          // Remove from pending auto-saves
          pendingAutoSaves.delete(autoSaveKey)
        }
      }, AUTO_SAVE_CONFIG.delay)

      // Store the timeout reference
      pendingAutoSaves.set(autoSaveKey, timeout)

      console.log(`[AutoSaveMiddleware] Scheduled auto-save for ${dataType} item:`, itemId)
    }
  }

  return result
}

// Helper function to clear all pending auto-saves
export const clearPendingAutoSaves = () => {
  pendingAutoSaves.forEach(timeout => clearTimeout(timeout))
  pendingAutoSaves.clear()
}