// Migration utility to help transition from UserManager singleton to Redux
// This provides backward compatibility during the migration phase

import { store } from '@/store'
import { setUser, createAnonUser, upgradeToStandard, upgradeToPremium, upgradeToAdmin, clearUser } from '@/store/slices/userSlice'
import { User, UserLevel } from './userManagement'
import { RootState } from '@/store/types'

// Legacy UserManager interface for backward compatibility
export interface LegacyUserManager {
  createAnonUser(): User | Promise<User>
  upgradeToStandard(email: string, name?: string): User | Promise<User>
  upgradeToPremium(): User | Promise<User>
  upgradeToAdmin(): User | Promise<User>
  getCurrentUser(): User | null
  isLoggedIn(): boolean
  isPremium(): boolean
  isStandard(): boolean
  isAdmin(): boolean
  hasFeatureAccess(feature: string): boolean
  hasLevelAccess(requiredLevel: 'anon' | 'standard' | 'premium' | 'admin'): boolean
  logout(): void
  ensureUser(): User
}

// Redux-based UserManager implementation
class ReduxUserManager implements LegacyUserManager {
  async createAnonUser(): Promise<User> {
    const result = await store.dispatch(createAnonUser())
    if (createAnonUser.fulfilled.match(result)) {
      return result.payload
    }
    throw new Error('Failed to create anonymous user')
  }

  async upgradeToStandard(email: string, name?: string): Promise<User> {
    const result = await store.dispatch(upgradeToStandard({ email, name }))
    if (upgradeToStandard.fulfilled.match(result)) {
      return result.payload
    }
    throw new Error('Failed to upgrade to standard')
  }

  async upgradeToPremium(): Promise<User> {
    const result = await store.dispatch(upgradeToPremium())
    if (upgradeToPremium.fulfilled.match(result)) {
      return result.payload
    }
    throw new Error('Failed to upgrade to premium')
  }

  async upgradeToAdmin(): Promise<User> {
    const result = await store.dispatch(upgradeToAdmin())
    if (upgradeToAdmin.fulfilled.match(result)) {
      return result.payload
    }
    throw new Error('Failed to upgrade to admin')
  }

  getCurrentUser(): User | null {
    return (store.getState() as RootState).user.currentUser
  }

  isLoggedIn(): boolean {
    return !!(store.getState() as RootState).user.currentUser
  }

  isPremium(): boolean {
    const user = (store.getState() as RootState).user.currentUser
    return user?.level === UserLevel.PREMIUM
  }

  isStandard(): boolean {
    const user = (store.getState() as RootState).user.currentUser
    return user?.level === UserLevel.STANDARD
  }

  isAdmin(): boolean {
    const user = (store.getState() as RootState).user.currentUser
    return user?.level === UserLevel.ADMIN
  }

  hasFeatureAccess(feature: string): boolean {
    const user = (store.getState() as RootState).user.currentUser
    if (!user) return false

    // Import FEATURES here to avoid circular dependency
    const { FEATURES } = require('./userManagement')
    const featureConfig = FEATURES[feature]
    if (!featureConfig) return false

    const userLevelIndex = Object.values(UserLevel).indexOf(user.level)
    const requiredLevelIndex = Object.values(UserLevel).indexOf(featureConfig.level)

    return userLevelIndex >= requiredLevelIndex && featureConfig.isEnabled
  }

  hasLevelAccess(requiredLevel: 'anon' | 'standard' | 'premium' | 'admin'): boolean {
    const user = (store.getState() as RootState).user.currentUser
    if (!user) return false

    const userLevelIndex = Object.values(UserLevel).indexOf(user.level)
    const requiredLevelIndex = Object.values(UserLevel).indexOf(requiredLevel as UserLevel)

    return userLevelIndex >= requiredLevelIndex
  }

  logout(): void {
    store.dispatch(clearUser())
  }

  ensureUser(): User {
    const currentUser = this.getCurrentUser()
    if (currentUser) {
      return currentUser
    }

    // Create anonymous user synchronously for backward compatibility
    const user: User = {
      id: `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      level: UserLevel.ANON,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preferences: {
        theme: 'auto',
        notifications: true,
        autoSave: true,
        defaultView: 'dashboard'
      }
    }

    store.dispatch(setUser(user))
    return user
  }
}

// Export the Redux-based UserManager as a singleton
export const userManager = new ReduxUserManager()

// Migration helper to load existing user data
export const migrateUserData = () => {
  try {
    const savedUserData = localStorage.getItem('disney-user')
    if (savedUserData) {
      const userData = JSON.parse(savedUserData)
      if (userData.currentUser) {
        store.dispatch(setUser(userData.currentUser))
        console.log('[UserMigration] Migrated user data to Redux')
      }
    }
  } catch (error) {
    console.error('[UserMigration] Failed to migrate user data:', error)
  }
}

// Migration helper to ensure user exists
export const ensureUserExists = () => {
  const currentUser = (store.getState() as RootState).user.currentUser
  if (!currentUser) {
    userManager.ensureUser()
  }
}