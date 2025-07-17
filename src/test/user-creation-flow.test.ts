import { describe, it, expect, vi, beforeEach } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../store/slices/userSlice'
import { upgradeToStandard, createAnonUser } from '../store/slices/userSlice'

// Create a test store
const createTestStore = () => {
  return configureStore({
    reducer: {
      user: userReducer
    }
  })
}

describe('User Creation and Upgrade Flow', () => {
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    store = createTestStore()
  })

  it('should create anonymous user and then upgrade to standard successfully', async () => {
    // First create an anonymous user
    const createResult = await store.dispatch(createAnonUser())
    expect(createAnonUser.fulfilled.match(createResult)).toBe(true)

    const anonUser = createResult.payload
    expect(anonUser.level).toBe('anon')

    // Now upgrade to standard
    const upgradeResult = await store.dispatch(upgradeToStandard({
      email: 'test@example.com',
      name: 'Test User'
    }))

    expect(upgradeToStandard.fulfilled.match(upgradeResult)).toBe(true)

    const standardUser = upgradeResult.payload
    expect(standardUser.level).toBe('standard')
    expect(standardUser.email).toBe('test@example.com')
    expect(standardUser.name).toBe('Test User')
  })

  it('should handle upgrade without existing user by creating one first', async () => {
    // Try to upgrade without creating a user first
    // This should fail with "No user to upgrade"
    const upgradeResult = await store.dispatch(upgradeToStandard({
      email: 'test@example.com',
      name: 'Test User'
    }))

    expect(upgradeToStandard.rejected.match(upgradeResult)).toBe(true)
    if (upgradeToStandard.rejected.match(upgradeResult)) {
      expect(upgradeResult.error?.message).toBe('No user to upgrade')
    }
  })
})