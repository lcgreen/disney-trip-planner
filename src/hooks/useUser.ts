import { useState, useEffect, useCallback } from 'react'
import { userManager, UserLevel, type User, type FeatureAccess } from '@/lib/userManagement'

export interface UseUserReturn {
  user: User | null
  isLoading: boolean
  isLoggedIn: boolean
  isPremium: boolean
  isStandard: boolean
  userLevel: UserLevel
  availableFeatures: FeatureAccess[]
  upgradeFeatures: FeatureAccess[]
  dataLimits: { items: number; storage: string }

  // Actions
  createAnonUser: () => User
  upgradeToStandard: (email: string, name?: string) => User
  upgradeToPremium: () => User
  upgradeToAdmin: () => User
  logout: () => void
  hasFeatureAccess: (feature: string) => boolean
  ensureUser: () => User
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize user on mount
  useEffect(() => {
    const currentUser = userManager.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    } else {
      // Create anonymous user if none exists
      const anonUser = userManager.createAnonUser()
      setUser(anonUser)
    }
    setIsLoading(false)
  }, [])

  // Update user state when user changes
  const updateUserState = useCallback(() => {
    setUser(userManager.getCurrentUser())
  }, [])

  // User actions
  const createAnonUser = useCallback((): User => {
    const newUser = userManager.createAnonUser()
    updateUserState()
    return newUser
  }, [updateUserState])

  const upgradeToStandard = useCallback((email: string, name?: string): User => {
    const upgradedUser = userManager.upgradeToStandard(email, name)
    updateUserState()
    return upgradedUser
  }, [updateUserState])

  const upgradeToPremium = useCallback((): User => {
    const upgradedUser = userManager.upgradeToPremium()
    updateUserState()
    return upgradedUser
  }, [updateUserState])

  const upgradeToAdmin = useCallback((): User => {
    const upgradedUser = userManager.upgradeToAdmin()
    updateUserState()
    return upgradedUser
  }, [updateUserState])

  const logout = useCallback((): void => {
    userManager.logout()
    updateUserState()
  }, [updateUserState])

  const hasFeatureAccess = useCallback((feature: string): boolean => {
    return userManager.hasFeatureAccess(feature)
  }, [])

  const ensureUser = useCallback((): User => {
    const currentUser = userManager.ensureUser()
    updateUserState()
    return currentUser
  }, [updateUserState])

  // Computed values
  const isLoggedIn = userManager.isLoggedIn()
  const isPremium = userManager.isPremium()
  const isStandard = userManager.isStandard()
  const userLevel = userManager.getCurrentUser()?.level || UserLevel.ANON
  const availableFeatures = userManager.getAvailableFeatures()
  const upgradeFeatures = userManager.getUpgradeFeatures()
  const dataLimits = userManager.getDataLimits()

  return {
    user,
    isLoading,
    isLoggedIn,
    isPremium,
    isStandard,
    userLevel,
    availableFeatures,
    upgradeFeatures,
    dataLimits,
    createAnonUser,
    upgradeToStandard,
    upgradeToPremium,
    upgradeToAdmin,
    logout,
    hasFeatureAccess,
    ensureUser
  }
}