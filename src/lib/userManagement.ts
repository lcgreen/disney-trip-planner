// User Management System for Disney Countdown
// Handles user levels, authentication, and feature access control

export enum UserLevel {
  ANON = 'anon',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  ADMIN = 'admin'
}

export interface User {
  id: string
  email?: string
  name?: string
  level: UserLevel
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
  preferences?: UserPreferences
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'auto'
  notifications?: boolean
  autoSave?: boolean
  defaultView?: 'dashboard' | 'countdown' | 'planner' | 'budget' | 'packing'
}

export interface FeatureAccess {
  feature: string
  level: UserLevel
  description: string
  isEnabled: boolean
}

// Feature definitions with access levels
export const FEATURES: Record<string, FeatureAccess> = {
  // Basic features - available to all users
  countdown: {
    feature: 'countdown',
    level: UserLevel.ANON,
    description: 'Basic countdown timer',
    isEnabled: true
  },
  packing: {
    feature: 'packing',
    level: UserLevel.ANON,
    description: 'Packing checklist',
    isEnabled: true
  },

  // Standard features - available to standard and premium users
  saveData: {
    feature: 'saveData',
    level: UserLevel.STANDARD,
    description: 'Save and load data',
    isEnabled: true
  },
  multipleItems: {
    feature: 'multipleItems',
    level: UserLevel.STANDARD,
    description: 'Create multiple items',
    isEnabled: true
  },
  exportData: {
    feature: 'exportData',
    level: UserLevel.STANDARD,
    description: 'Export data to file',
    isEnabled: true
  },

  // Premium features - available only to premium users
  tripPlanner: {
    feature: 'tripPlanner',
    level: UserLevel.PREMIUM,
    description: 'Advanced trip planning',
    isEnabled: true
  },
  budgetTracker: {
    feature: 'budgetTracker',
    level: UserLevel.PREMIUM,
    description: 'Budget tracking and analysis',
    isEnabled: true
  },
  advancedAnalytics: {
    feature: 'advancedAnalytics',
    level: UserLevel.PREMIUM,
    description: 'Advanced analytics and insights',
    isEnabled: true
  },
  prioritySupport: {
    feature: 'prioritySupport',
    level: UserLevel.PREMIUM,
    description: 'Priority customer support',
    isEnabled: true
  },
  unlimitedStorage: {
    feature: 'unlimitedStorage',
    level: UserLevel.PREMIUM,
    description: 'Unlimited data storage',
    isEnabled: true
  },

  // Admin features - available only to admin users
  userManagement: {
    feature: 'userManagement',
    level: UserLevel.ADMIN,
    description: 'Manage users and their access levels',
    isEnabled: true
  },
  analytics: {
    feature: 'analytics',
    level: UserLevel.ADMIN,
    description: 'View application analytics and usage statistics',
    isEnabled: true
  },
  contentManagement: {
    feature: 'contentManagement',
    level: UserLevel.ADMIN,
    description: 'Manage parks, themes, and content',
    isEnabled: true
  },
  systemSettings: {
    feature: 'systemSettings',
    level: UserLevel.ADMIN,
    description: 'Configure system settings and features',
    isEnabled: true
  },
  debugTools: {
    feature: 'debugTools',
    level: UserLevel.ADMIN,
    description: 'Access to advanced debugging and development tools',
    isEnabled: true
  }
}

// Storage keys
const STORAGE_KEYS = {
  USER: 'disney-user',
  USER_PREFERENCES: 'disney-user-preferences',
  FEATURE_ACCESS: 'disney-feature-access'
} as const

export class UserManager {
  private static instance: UserManager
  private currentUser: User | null = null

  private constructor() {
    this.loadUser()
  }

  static getInstance(): UserManager {
    if (!UserManager.instance) {
      UserManager.instance = new UserManager()
    }
    return UserManager.instance
  }

  // User management
  createAnonUser(): User {
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

    this.currentUser = user
    this.saveUser(user)
    return user
  }

  upgradeToStandard(email: string, name?: string): User {
    if (!this.currentUser) {
      throw new Error('No user to upgrade')
    }

    const upgradedUser: User = {
      ...this.currentUser,
      email,
      name,
      level: UserLevel.STANDARD,
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }

    this.currentUser = upgradedUser
    this.saveUser(upgradedUser)
    return upgradedUser
  }

  upgradeToPremium(): User {
    if (!this.currentUser) {
      throw new Error('No user to upgrade')
    }

    if (this.currentUser.level === UserLevel.ANON) {
      throw new Error('Must upgrade to standard first')
    }

    const upgradedUser: User = {
      ...this.currentUser,
      level: UserLevel.PREMIUM,
      updatedAt: new Date().toISOString()
    }

    this.currentUser = upgradedUser
    this.saveUser(upgradedUser)
    return upgradedUser
  }

  upgradeToAdmin(): User {
    if (!this.currentUser) {
      throw new Error('No user to upgrade')
    }

    const upgradedUser: User = {
      ...this.currentUser,
      level: UserLevel.ADMIN,
      updatedAt: new Date().toISOString()
    }

    this.currentUser = upgradedUser
    this.saveUser(upgradedUser)
    return upgradedUser
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null && this.currentUser.level !== UserLevel.ANON
  }

  isPremium(): boolean {
    return this.currentUser?.level === UserLevel.PREMIUM
  }

  isStandard(): boolean {
    return this.currentUser?.level === UserLevel.STANDARD || this.currentUser?.level === UserLevel.PREMIUM
  }

  isAdmin(): boolean {
    return this.currentUser?.level === UserLevel.ADMIN
  }

  // Feature access control
  hasFeatureAccess(feature: string): boolean {
    if (!this.currentUser) return false

    const featureDef = FEATURES[feature]
    if (!featureDef) return false

    const userLevel = this.currentUser.level
    const requiredLevel = featureDef.level

    // Admin only has access to admin features
    if (userLevel === UserLevel.ADMIN) {
      return requiredLevel === UserLevel.ADMIN
    }

    switch (requiredLevel) {
      case UserLevel.ANON:
        return true
      case UserLevel.STANDARD:
        return userLevel === UserLevel.STANDARD || userLevel === UserLevel.PREMIUM
      case UserLevel.PREMIUM:
        return userLevel === UserLevel.PREMIUM
      case UserLevel.ADMIN:
        return false // Only admin users can access admin features
      default:
        return false
    }
  }

  getAvailableFeatures(): FeatureAccess[] {
    return Object.values(FEATURES).filter(feature => this.hasFeatureAccess(feature.feature))
  }

  getUpgradeFeatures(): FeatureAccess[] {
    if (!this.currentUser) return []

    switch (this.currentUser.level) {
      case UserLevel.ANON:
        return Object.values(FEATURES).filter(f => f.level !== UserLevel.ANON && f.level !== UserLevel.ADMIN)
      case UserLevel.STANDARD:
        return Object.values(FEATURES).filter(f => f.level === UserLevel.PREMIUM)
      case UserLevel.PREMIUM:
        return []
      case UserLevel.ADMIN:
        return [] // Admin users don't need to upgrade
      default:
        return []
    }
  }

  // Storage management
  private saveUser(user: User): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  }

  private loadUser(): void {
    if (typeof window === 'undefined') return

    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER)
      if (saved) {
        this.currentUser = JSON.parse(saved)
      }
    } catch (error) {
      console.warn('Failed to load user data:', error)
      this.currentUser = null
    }
  }

  // Data limits based on user level
  getDataLimits() {
    if (!this.currentUser) return { items: 1, storage: '1MB' }

    switch (this.currentUser.level) {
      case UserLevel.ANON:
        return { items: 1, storage: '1MB' }
      case UserLevel.STANDARD:
        return { items: 10, storage: '10MB' }
      case UserLevel.PREMIUM:
        return { items: -1, storage: 'unlimited' } // -1 means unlimited
      default:
        return { items: 1, storage: '1MB' }
    }
  }

  // Cleanup and logout
  logout(): void {
    this.currentUser = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER)
    }
  }

  // Initialize user if none exists
  ensureUser(): User {
    if (!this.currentUser) {
      return this.createAnonUser()
    }
    return this.currentUser
  }
}

// Export singleton instance
export const userManager = UserManager.getInstance()

// Utility functions
export const getUserLevel = (): UserLevel => {
  return userManager.getCurrentUser()?.level || UserLevel.ANON
}

export const hasFeatureAccess = (feature: string): boolean => {
  return userManager.hasFeatureAccess(feature)
}

export const isPremiumUser = (): boolean => {
  return userManager.isPremium()
}

export const isStandardUser = (): boolean => {
  return userManager.isStandard()
}

export const isAdminUser = (): boolean => {
  return userManager.isAdmin()
}