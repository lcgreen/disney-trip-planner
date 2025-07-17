'use client'

import { Provider } from 'react-redux'
import { useEffect, useState } from 'react'
import { store } from '@/store'
import { loadInitialState } from '@/store/middleware/storageMiddleware'

interface ReduxProviderProps {
  children: React.ReactNode
}

export default function ReduxProvider({ children }: ReduxProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Load initial state from localStorage on the client side
    const initialState = loadInitialState()

    // Dispatch actions to hydrate the store with localStorage data
    if (initialState.user?.currentUser) {
      store.dispatch({ type: 'user/setUser', payload: initialState.user.currentUser })
    }
    if (initialState.widgets?.configs) {
      store.dispatch({ type: 'widgets/setConfigs', payload: initialState.widgets.configs })
    }
    if (initialState.countdown?.items) {
      store.dispatch({ type: 'countdown/setItems', payload: initialState.countdown.items })
    }
    if (initialState.budget?.items) {
      store.dispatch({ type: 'budget/setItems', payload: initialState.budget.items })
    }
    if (initialState.packing?.items) {
      store.dispatch({ type: 'packing/setItems', payload: initialState.packing.items })
    }
    if (initialState.planner?.items) {
      store.dispatch({ type: 'planner/setItems', payload: initialState.planner.items })
    }

    setIsHydrated(true)
  }, [])

  return <Provider store={store}>{children}</Provider>
}