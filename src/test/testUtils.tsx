import React from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { render } from '@testing-library/react'
import userSlice from '../store/slices/userSlice'
import widgetsSlice from '../store/slices/widgetsSlice'
import countdownSlice from '../store/slices/countdownSlice'
import budgetSlice from '../store/slices/budgetSlice'
import packingSlice from '../store/slices/packingSlice'
import plannerSlice from '../store/slices/plannerSlice'
import uiSlice from '../store/slices/uiSlice'

// Create a test store
export const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      user: userSlice,
      widgets: widgetsSlice,
      countdown: countdownSlice,
      budget: budgetSlice,
      packing: packingSlice,
      planner: plannerSlice,
      ui: uiSlice,
    },
    preloadedState,
  })
}

// Custom render function with Redux Provider
export const renderWithRedux = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return <Provider store={store}>{children}</Provider>
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}