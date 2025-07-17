import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  selectCurrentUser,
  selectUserLoading,
  selectUserError,
  selectIsLoggedIn,
  selectUserLevel,
  selectIsPremium,
  selectIsStandard,
  selectIsAdmin,
  createAnonUser,
  upgradeToStandard,
  upgradeToPremium,
  upgradeToAdmin,
  clearUser,
  updateUser,
} from '@/store/slices/userSlice'
import { User, UserLevel } from '@/lib/userManagement'
import { FEATURES } from '@/lib/userManagement'

export interface UseReduxUserReturn {
  // State
  user: User | null
  isLoading: boolean
  error: string | null
  isLoggedIn: boolean
  userLevel: string
  isPremium: boolean
  isStandard: boolean
  isAdmin: boolean

  // Actions
  createAnonUser: () => Promise<User>
  upgradeToStandard: (email: string, name?: string) => Promise<User>
  upgradeToPremium: () => Promise<User>
  upgradeToAdmin: () => Promise<User>
  logout: () => void
  updateUserPreferences: (preferences: Partial<User['preferences']>) => void

  // Feature access
  hasFeatureAccess: (feature: string) => boolean
  hasLevelAccess: (requiredLevel: 'anon' | 'standard' | 'premium' | 'admin') => boolean
  getAvailableFeatures: () => any[]
  getUpgradeFeatures: () => any[]
  getDataLimits: () => { maxItems: number; maxStorage: string }
}

export function useReduxUser(): UseReduxUserReturn {
  const dispatch = useAppDispatch()

  // Selectors
  const user = useAppSelector(selectCurrentUser)
  const isLoading = useAppSelector(selectUserLoading)
  const error = useAppSelector(selectUserError)
  const isLoggedIn = useAppSelector(selectIsLoggedIn)
  const userLevel = useAppSelector(selectUserLevel)
  const isPremium = useAppSelector(selectIsPremium)
  const isStandard = useAppSelector(selectIsStandard)
  const isAdmin = useAppSelector(selectIsAdmin)

  // Actions
  const createAnonUserAction = useCallback(async (): Promise<User> => {
    try {
      const result = await dispatch(createAnonUser())
      if (createAnonUser.fulfilled.match(result)) {
        return result.payload
      }

      // If we get here, the action was rejected
      // Use a simple fallback error message
      throw new Error('Failed to create anonymous user')
    } catch (error) {
      // Handle any other errors that might occur
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to create anonymous user')
    }
  }, [dispatch])

  const upgradeToStandardAction = useCallback(async (email: string, name?: string): Promise<User> => {
    try {
      const result = await dispatch(upgradeToStandard({ email, name }))
      if (upgradeToStandard.fulfilled.match(result)) {
        return result.payload
      }

      // If we get here, the action was rejected
      // Use a simple fallback error message
      throw new Error('Failed to upgrade to standard')
    } catch (error) {
      // Handle any other errors that might occur
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to upgrade to standard')
    }
  }, [dispatch])

  const upgradeToPremiumAction = useCallback(async (): Promise<User> => {
    try {
      const result = await dispatch(upgradeToPremium())
      if (upgradeToPremium.fulfilled.match(result)) {
        return result.payload
      }

      // If we get here, the action was rejected
      // Use a simple fallback error message
      throw new Error('Failed to upgrade to premium')
    } catch (error) {
      // Handle any other errors that might occur
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to upgrade to premium')
    }
  }, [dispatch])

  const upgradeToAdminAction = useCallback(async (): Promise<User> => {
    try {
      const result = await dispatch(upgradeToAdmin())
      if (upgradeToAdmin.fulfilled.match(result)) {
        return result.payload
      }

      // If we get here, the action was rejected
      // Use a simple fallback error message
      throw new Error('Failed to upgrade to admin')
    } catch (error) {
      // Handle any other errors that might occur
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to upgrade to admin')
    }
  }, [dispatch])

  const logout = useCallback(() => {
    dispatch(clearUser())
  }, [dispatch])

  const updateUserPreferences = useCallback((preferences: Partial<User['preferences']>) => {
    if (user) {
      dispatch(updateUser({ preferences: { ...user.preferences, ...preferences } }))
    }
  }, [dispatch, user])

  // Feature access helpers
  const hasFeatureAccess = useCallback((feature: string): boolean => {
    if (!user) return false

    const featureConfig = FEATURES[feature]
    if (!featureConfig) return false

    const userLevelIndex = Object.values(UserLevel).indexOf(user.level)
    const requiredLevelIndex = Object.values(UserLevel).indexOf(featureConfig.level)

    return userLevelIndex >= requiredLevelIndex && featureConfig.isEnabled
  }, [user])

  const hasLevelAccess = useCallback((requiredLevel: 'anon' | 'standard' | 'premium' | 'admin'): boolean => {
    if (!user) return false

    const userLevelIndex = Object.values(UserLevel).indexOf(user.level)
    const requiredLevelIndex = Object.values(UserLevel).indexOf(requiredLevel as UserLevel)

    return userLevelIndex >= requiredLevelIndex
  }, [user])

  const getAvailableFeatures = useCallback(() => {
    return Object.values(FEATURES).filter(feature => hasFeatureAccess(feature.feature))
  }, [hasFeatureAccess])

  const getUpgradeFeatures = useCallback(() => {
    return Object.values(FEATURES).filter(feature => !hasFeatureAccess(feature.feature))
  }, [hasFeatureAccess])

  const getDataLimits = useCallback(() => {
    switch (user?.level) {
      case UserLevel.ANON:
        return { maxItems: 1, maxStorage: '0MB' }
      case UserLevel.STANDARD:
        return { maxItems: 10, maxStorage: '10MB' }
      case UserLevel.PREMIUM:
      case UserLevel.ADMIN:
        return { maxItems: -1, maxStorage: 'Unlimited' }
      default:
        return { maxItems: 1, maxStorage: '0MB' }
    }
  }, [user])

  return {
    // State
    user,
    isLoading,
    error,
    isLoggedIn,
    userLevel,
    isPremium,
    isStandard,
    isAdmin,

    // Actions
    createAnonUser: createAnonUserAction,
    upgradeToStandard: upgradeToStandardAction,
    upgradeToPremium: upgradeToPremiumAction,
    upgradeToAdmin: upgradeToAdminAction,
    logout,
    updateUserPreferences,

    // Feature access
    hasFeatureAccess,
    hasLevelAccess,
    getAvailableFeatures,
    getUpgradeFeatures,
    getDataLimits,
  }
}