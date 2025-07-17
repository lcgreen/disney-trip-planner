import { useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  selectAllWidgets,
  selectWidgetsLoading,
  selectWidgetsError,
  selectPendingLinks,
  selectWidgetById,
  selectWidgetsByType,
  selectOrderedWidgets,
  addConfig,
  updateConfig,
  removeConfig,
  reorderConfigs,
  setPendingLink,
  clearPendingLink,
  createAndLinkItem,
  checkAndApplyPendingLinks,
} from '@/store/slices/widgetsSlice'
import { WidgetConfig } from '@/types'

export interface UseReduxWidgetsReturn {
  // State
  widgets: WidgetConfig[]
  orderedWidgets: WidgetConfig[]
  isLoading: boolean
  error: string | null
  pendingLinks: Record<string, { widgetId: string; widgetType: string }>

  // Actions
  addWidget: (config: WidgetConfig) => void
  updateWidget: (id: string, updates: Partial<WidgetConfig>) => void
  removeWidget: (id: string) => void
  reorderWidgets: (newOrder: string[]) => void
  setPendingWidgetLink: (widgetId: string, widgetType: WidgetConfig['type']) => void
  clearPendingWidgetLink: (widgetId: string) => void
  createAndLinkItem: (widgetId: string, widgetType: WidgetConfig['type']) => Promise<string | null>
  checkAndApplyPendingLinks: (itemId: string, widgetType: WidgetConfig['type']) => Promise<void>

  // Selectors
  getWidgetById: (id: string) => WidgetConfig | null
  getWidgetsByType: (type: string) => WidgetConfig[]
  getWidgetsForUser: (userLevel: string) => WidgetConfig[]
}

export function useReduxWidgets(): UseReduxWidgetsReturn {
  const dispatch = useAppDispatch()

  // Selectors
  const widgets = useAppSelector(selectAllWidgets)
  const orderedWidgets = useAppSelector(selectOrderedWidgets)
  const isLoading = useAppSelector(selectWidgetsLoading)
  const error = useAppSelector(selectWidgetsError)
  const pendingLinks = useAppSelector(selectPendingLinks)

  // Actions
  const addWidget = useCallback((config: WidgetConfig) => {
    dispatch(addConfig(config))
  }, [dispatch])

  const updateWidget = useCallback((id: string, updates: Partial<WidgetConfig>) => {
    dispatch(updateConfig({ id, updates }))
  }, [dispatch])

  const removeWidget = useCallback((id: string) => {
    dispatch(removeConfig(id))
  }, [dispatch])

  const reorderWidgets = useCallback((newOrder: string[]) => {
    dispatch(reorderConfigs(newOrder))
  }, [dispatch])

  const setPendingWidgetLink = useCallback((widgetId: string, widgetType: WidgetConfig['type']) => {
    const itemId = `pending-${Date.now()}`
    dispatch(setPendingLink({ widgetId, itemId, widgetType }))
  }, [dispatch])

  const clearPendingWidgetLink = useCallback((widgetId: string) => {
    // Find the pending link for this widget and clear it
    for (const [itemId, link] of Object.entries(pendingLinks)) {
      if (link.widgetId === widgetId) {
        dispatch(clearPendingLink(itemId))
        break
      }
    }
  }, [dispatch, pendingLinks])

  const createAndLinkItemAction = useCallback(async (widgetId: string, widgetType: WidgetConfig['type']): Promise<string | null> => {
    const result = await dispatch(createAndLinkItem({ widgetId, widgetType }))
    if (createAndLinkItem.fulfilled.match(result)) {
      return result.payload
    }
    throw new Error('Failed to create and link item')
  }, [dispatch])

  const checkAndApplyPendingLinksAction = useCallback(async (itemId: string, widgetType: WidgetConfig['type']): Promise<void> => {
    const result = await dispatch(checkAndApplyPendingLinks({ itemId, widgetType }))
    if (checkAndApplyPendingLinks.rejected.match(result)) {
      throw new Error('Failed to check and apply pending links')
    }
  }, [dispatch])

  // Selectors
  const getWidgetById = useCallback((id: string): WidgetConfig | null => {
    return widgets.find(widget => widget.id === id) || null
  }, [widgets])

  const getWidgetsByType = useCallback((type: string): WidgetConfig[] => {
    return widgets.filter(widget => widget.type === type)
  }, [widgets])

  const getWidgetsForUser = useCallback((userLevel: string): WidgetConfig[] => {
    // Filter widgets based on user level
    if (userLevel === 'anon') {
      // Anonymous users get limited widgets
      return widgets.slice(0, 3) // Limit to 3 widgets for anonymous users
    }
    return widgets
  }, [widgets])

  return {
    // State
    widgets,
    orderedWidgets,
    isLoading,
    error,
    pendingLinks,

    // Actions
    addWidget,
    updateWidget,
    removeWidget,
    reorderWidgets,
    setPendingWidgetLink,
    clearPendingWidgetLink,
    createAndLinkItem: createAndLinkItemAction,
    checkAndApplyPendingLinks: checkAndApplyPendingLinksAction,

    // Selectors
    getWidgetById,
    getWidgetsByType,
    getWidgetsForUser,
  }
}