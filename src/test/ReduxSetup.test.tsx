import { describe, it, expect } from 'vitest'
import { renderWithRedux } from './testUtils'
import CountdownTimer from '@/components/CountdownTimer'

describe('Redux Setup', () => {
  it('should render CountdownTimer with Redux Provider', () => {
    const { store } = renderWithRedux(
      <CountdownTimer
        createdItemId="test-countdown-1"
        widgetId="test-widget-1"
        isEditMode={false}
      />
    )

    // Verify the store is created
    expect(store).toBeDefined()

    // Verify the component renders without Redux context errors
    expect(document.body).toBeInTheDocument()
  })

  it('should have initial Redux state', () => {
    const { store } = renderWithRedux(
      <CountdownTimer
        createdItemId="test-countdown-1"
        widgetId="test-widget-1"
        isEditMode={false}
      />
    )

    const state = store.getState()

    // Verify all slices are present
    expect(state.user).toBeDefined()
    expect(state.widgets).toBeDefined()
    expect(state.countdown).toBeDefined()
    expect(state.budget).toBeDefined()
    expect(state.packing).toBeDefined()
    expect(state.planner).toBeDefined()
    expect(state.ui).toBeDefined()
  })
})