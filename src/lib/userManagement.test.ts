import { describe, it, expect, beforeEach } from 'vitest'
import { userManager, UserLevel, FEATURES } from './userManagement'

describe('UserManager Permissions', () => {
  beforeEach(() => {
    // Clear localStorage and reset singleton state
    localStorage.clear()
    // Reset the singleton's internal state
    userManager['currentUser'] = null
  })

  describe('Anonymous User Permissions', () => {
    beforeEach(() => {
      userManager.createAnonUser()
    })

    it('should have access to anonymous features only', () => {
      // Anonymous features that should be accessible
      expect(userManager.hasFeatureAccess('countdown')).toBe(true)

      // Standard features should be blocked
      expect(userManager.hasFeatureAccess('saveData')).toBe(false)
      expect(userManager.hasFeatureAccess('multipleItems')).toBe(false)
      expect(userManager.hasFeatureAccess('exportData')).toBe(false)

      // Premium features should be blocked
      expect(userManager.hasFeatureAccess('planner')).toBe(false)
      expect(userManager.hasFeatureAccess('tripPlanner')).toBe(false)
      expect(userManager.hasFeatureAccess('budget')).toBe(false)
      expect(userManager.hasFeatureAccess('packing')).toBe(false)
      expect(userManager.hasFeatureAccess('advancedAnalytics')).toBe(false)
      expect(userManager.hasFeatureAccess('prioritySupport')).toBe(false)
      expect(userManager.hasFeatureAccess('unlimitedStorage')).toBe(false)

      // Admin features should be blocked
      expect(userManager.hasFeatureAccess('userManagement')).toBe(false)
      expect(userManager.hasFeatureAccess('analytics')).toBe(false)
      expect(userManager.hasFeatureAccess('contentManagement')).toBe(false)
      expect(userManager.hasFeatureAccess('systemSettings')).toBe(false)
      expect(userManager.hasFeatureAccess('debugTools')).toBe(false)
    })

    it('should have correct level access', () => {
      expect(userManager.hasLevelAccess('anon')).toBe(true)
      expect(userManager.hasLevelAccess('standard')).toBe(false)
      expect(userManager.hasLevelAccess('premium')).toBe(false)
      expect(userManager.hasLevelAccess('admin')).toBe(false)
    })

    it('should have correct data limits', () => {
      const limits = userManager.getDataLimits()
      expect(limits).toEqual({ items: 1, storage: '1MB' })
    })

    it('should have correct user level indicators', () => {
      expect(userManager.isLoggedIn()).toBe(false)
      expect(userManager.isStandard()).toBe(false)
      expect(userManager.isPremium()).toBe(false)
      expect(userManager.isAdmin()).toBe(false)
    })
  })

  describe('Standard User Permissions', () => {
    beforeEach(() => {
      userManager.createAnonUser()
      userManager.upgradeToStandard('test@example.com', 'Test User')
    })

    it('should have access to anonymous and standard features', () => {
      // Anonymous features should be accessible
      expect(userManager.hasFeatureAccess('countdown')).toBe(true)

      // Standard features should be accessible
      expect(userManager.hasFeatureAccess('saveData')).toBe(true)
      expect(userManager.hasFeatureAccess('multipleItems')).toBe(true)
      expect(userManager.hasFeatureAccess('exportData')).toBe(true)

      // Premium features should be blocked
      expect(userManager.hasFeatureAccess('planner')).toBe(false)
      expect(userManager.hasFeatureAccess('tripPlanner')).toBe(false)
      expect(userManager.hasFeatureAccess('budget')).toBe(false)
      expect(userManager.hasFeatureAccess('packing')).toBe(false)
      expect(userManager.hasFeatureAccess('advancedAnalytics')).toBe(false)
      expect(userManager.hasFeatureAccess('prioritySupport')).toBe(false)
      expect(userManager.hasFeatureAccess('unlimitedStorage')).toBe(false)

      // Admin features should be blocked
      expect(userManager.hasFeatureAccess('userManagement')).toBe(false)
      expect(userManager.hasFeatureAccess('analytics')).toBe(false)
      expect(userManager.hasFeatureAccess('contentManagement')).toBe(false)
      expect(userManager.hasFeatureAccess('systemSettings')).toBe(false)
      expect(userManager.hasFeatureAccess('debugTools')).toBe(false)
    })

    it('should have correct level access', () => {
      expect(userManager.hasLevelAccess('anon')).toBe(true)
      expect(userManager.hasLevelAccess('standard')).toBe(true)
      expect(userManager.hasLevelAccess('premium')).toBe(false)
      expect(userManager.hasLevelAccess('admin')).toBe(false)
    })

    it('should have correct data limits', () => {
      const limits = userManager.getDataLimits()
      expect(limits).toEqual({ items: 10, storage: '10MB' })
    })

    it('should have correct user level indicators', () => {
      expect(userManager.isLoggedIn()).toBe(true)
      expect(userManager.isStandard()).toBe(true)
      expect(userManager.isPremium()).toBe(false)
      expect(userManager.isAdmin()).toBe(false)
    })
  })

  describe('Premium User Permissions', () => {
    beforeEach(() => {
      userManager.createAnonUser()
      userManager.upgradeToStandard('test@example.com', 'Test User')
      userManager.upgradeToPremium()
    })

    it('should have access to anonymous, standard, and premium features', () => {
      // Anonymous features should be accessible
      expect(userManager.hasFeatureAccess('countdown')).toBe(true)

      // Standard features should be accessible
      expect(userManager.hasFeatureAccess('saveData')).toBe(true)
      expect(userManager.hasFeatureAccess('multipleItems')).toBe(true)
      expect(userManager.hasFeatureAccess('exportData')).toBe(true)

      // Premium features should be accessible
      expect(userManager.hasFeatureAccess('planner')).toBe(true)
      expect(userManager.hasFeatureAccess('tripPlanner')).toBe(true)
      expect(userManager.hasFeatureAccess('budget')).toBe(true)
      expect(userManager.hasFeatureAccess('packing')).toBe(true)
      expect(userManager.hasFeatureAccess('advancedAnalytics')).toBe(true)
      expect(userManager.hasFeatureAccess('prioritySupport')).toBe(true)
      expect(userManager.hasFeatureAccess('unlimitedStorage')).toBe(true)

      // Admin features should be blocked
      expect(userManager.hasFeatureAccess('userManagement')).toBe(false)
      expect(userManager.hasFeatureAccess('analytics')).toBe(false)
      expect(userManager.hasFeatureAccess('contentManagement')).toBe(false)
      expect(userManager.hasFeatureAccess('systemSettings')).toBe(false)
      expect(userManager.hasFeatureAccess('debugTools')).toBe(false)
    })

    it('should have correct level access', () => {
      expect(userManager.hasLevelAccess('anon')).toBe(true)
      expect(userManager.hasLevelAccess('standard')).toBe(true)
      expect(userManager.hasLevelAccess('premium')).toBe(true)
      expect(userManager.hasLevelAccess('admin')).toBe(false)
    })

    it('should have correct data limits', () => {
      const limits = userManager.getDataLimits()
      expect(limits).toEqual({ items: -1, storage: 'unlimited' })
    })

    it('should have correct user level indicators', () => {
      expect(userManager.isLoggedIn()).toBe(true)
      expect(userManager.isStandard()).toBe(true)
      expect(userManager.isPremium()).toBe(true)
      expect(userManager.isAdmin()).toBe(false)
    })
  })

  describe('Admin User Permissions', () => {
    beforeEach(() => {
      userManager.createAnonUser()
      userManager.upgradeToStandard('admin@example.com', 'Admin User')
      userManager.upgradeToAdmin()
    })

    it('should have access to ALL features (admin should have access to everything)', () => {
      // Test all features defined in FEATURES
      Object.keys(FEATURES).forEach(featureName => {
        expect(userManager.hasFeatureAccess(featureName)).toBe(true)
      })
    })

    it('should have correct level access', () => {
      expect(userManager.hasLevelAccess('anon')).toBe(true)
      expect(userManager.hasLevelAccess('standard')).toBe(true)
      expect(userManager.hasLevelAccess('premium')).toBe(true)
      expect(userManager.hasLevelAccess('admin')).toBe(true)
    })

    it('should have unlimited data limits', () => {
      const limits = userManager.getDataLimits()
      expect(limits).toEqual({ items: -1, storage: 'unlimited' })
    })

    it('should have correct user level indicators', () => {
      expect(userManager.isLoggedIn()).toBe(true)
      expect(userManager.isStandard()).toBe(true)
      expect(userManager.isPremium()).toBe(true)
      expect(userManager.isAdmin()).toBe(true)
    })
  })

  describe('User Upgrade Flow', () => {
    it('should prevent direct upgrade from anonymous to premium', () => {
      userManager.createAnonUser()

      expect(() => {
        userManager.upgradeToPremium()
      }).toThrow('Must upgrade to standard first')
    })

    it('should allow upgrade from anonymous to standard', () => {
      userManager.createAnonUser()
      const user = userManager.upgradeToStandard('test@example.com', 'Test User')

      expect(user.level).toBe(UserLevel.STANDARD)
      expect(user.email).toBe('test@example.com')
      expect(user.name).toBe('Test User')
    })

    it('should allow upgrade from standard to premium', () => {
      userManager.createAnonUser()
      userManager.upgradeToStandard('test@example.com', 'Test User')
      const user = userManager.upgradeToPremium()

      expect(user.level).toBe(UserLevel.PREMIUM)
      expect(user.email).toBe('test@example.com')
      expect(user.name).toBe('Test User')
    })

    it('should allow upgrade to admin from any level', () => {
      userManager.createAnonUser()
      userManager.upgradeToStandard('admin@example.com', 'Admin User')
      const user = userManager.upgradeToAdmin()

      expect(user.level).toBe(UserLevel.ADMIN)
      expect(user.email).toBe('admin@example.com')
      expect(user.name).toBe('Admin User')
    })
  })

  describe('Available and Upgrade Features', () => {
    it('should return correct available features for each level', () => {
      // Anonymous user
      userManager.createAnonUser()
      let availableFeatures = userManager.getAvailableFeatures()
      expect(availableFeatures.length).toBe(1) // Only countdown
      expect(availableFeatures[0].feature).toBe('countdown')

      // Standard user
      userManager.upgradeToStandard('test@example.com', 'Test User')
      availableFeatures = userManager.getAvailableFeatures()
      expect(availableFeatures.length).toBe(4) // countdown, saveData, multipleItems, exportData

      // Premium user
      userManager.upgradeToPremium()
      availableFeatures = userManager.getAvailableFeatures()
      expect(availableFeatures.length).toBe(11) // All non-admin features

      // Admin user
      userManager.upgradeToAdmin()
      availableFeatures = userManager.getAvailableFeatures()
      expect(availableFeatures.length).toBe(Object.keys(FEATURES).length) // All features
    })

    it('should return correct upgrade features for each level', () => {
      // Anonymous user
      userManager.createAnonUser()
      let upgradeFeatures = userManager.getUpgradeFeatures()
      expect(upgradeFeatures.length).toBeGreaterThan(0)

      // Standard user
      userManager.upgradeToStandard('test@example.com', 'Test User')
      upgradeFeatures = userManager.getUpgradeFeatures()
      expect(upgradeFeatures.every(f => f.level === UserLevel.PREMIUM)).toBe(true)

      // Premium user
      userManager.upgradeToPremium()
      upgradeFeatures = userManager.getUpgradeFeatures()
      expect(upgradeFeatures.length).toBe(0)

      // Admin user
      userManager.upgradeToAdmin()
      upgradeFeatures = userManager.getUpgradeFeatures()
      expect(upgradeFeatures.length).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle invalid feature names gracefully', () => {
      userManager.createAnonUser()
      expect(userManager.hasFeatureAccess('nonExistentFeature')).toBe(false)
    })

    it('should handle invalid level names gracefully', () => {
      userManager.createAnonUser()
      expect(userManager.hasLevelAccess('invalidLevel' as any)).toBe(false)
    })

    it('should handle no current user gracefully', () => {
      // Don't create any user
      expect(userManager.hasFeatureAccess('countdown')).toBe(false)
      expect(userManager.hasLevelAccess('anon')).toBe(false)
      expect(userManager.isLoggedIn()).toBe(false)
      expect(userManager.isStandard()).toBe(false)
      expect(userManager.isPremium()).toBe(false)
      expect(userManager.isAdmin()).toBe(false)
    })
  })
})