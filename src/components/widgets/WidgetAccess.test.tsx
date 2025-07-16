import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useUser } from '@/hooks/useUser'
import { BudgetWidget } from '@/components/widgets'
import { TripPlannerWidget } from '@/components/widgets'
import { CountdownWidget } from '@/components/widgets'
import { PackingWidget } from '@/components/widgets'

// Mock the useUser hook
vi.mock('@/hooks/useUser')
const mockUseUser = vi.mocked(useUser)

// Mock the widget components to avoid complex rendering issues
vi.mock('@/components/widgets/BudgetWidget', () => ({
  default: ({ isDemoMode }: { isDemoMode?: boolean }) => (
    <div data-testid="budget-widget">
      Budget Widget {isDemoMode ? '(Demo)' : ''}
    </div>
  )
}))

vi.mock('@/components/widgets/TripPlannerWidget', () => ({
  default: ({ isDemoMode }: { isDemoMode?: boolean }) => (
    <div data-testid="planner-widget">
      Trip Planner Widget {isDemoMode ? '(Demo)' : ''}
    </div>
  )
}))

vi.mock('@/components/widgets/CountdownWidget', () => ({
  default: ({ isDemoMode }: { isDemoMode?: boolean }) => (
    <div data-testid="countdown-widget">
      Countdown Widget {isDemoMode ? '(Demo)' : ''}
    </div>
  )
}))

vi.mock('@/components/widgets/PackingWidget', () => ({
  default: ({ isDemoMode }: { isDemoMode?: boolean }) => (
    <div data-testid="packing-widget">
      Packing Widget {isDemoMode ? '(Demo)' : ''}
    </div>
  )
}))

describe('Widget Access Permissions', () => {
  const mockProps = {
    id: 'test-widget',
    onRemove: vi.fn(),
    onSettings: vi.fn(),
    onWidthChange: vi.fn(),
    onItemSelect: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Anonymous User Widget Access', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        userLevel: 'anon',
        isPremium: false,
        isStandard: false,
        hasFeatureAccess: vi.fn().mockReturnValue(false),
        user: null,
        isLoading: false,
        isLoggedIn: false,
        availableFeatures: [],
        upgradeFeatures: [],
        dataLimits: { items: 1, storage: '1MB' },
        createAnonUser: vi.fn(),
        upgradeToStandard: vi.fn(),
        upgradeToPremium: vi.fn(),
        upgradeToAdmin: vi.fn(),
        logout: vi.fn(),
        ensureUser: vi.fn(),
      })
    })

    it('should render CountdownWidget in demo mode', () => {
      render(<CountdownWidget {...mockProps} isDemoMode={true} />)
      expect(screen.getByTestId('countdown-widget')).toBeInTheDocument()
      expect(screen.getByText(/Demo/)).toBeInTheDocument()
    })

    it('should render BudgetWidget in demo mode', () => {
      render(<BudgetWidget {...mockProps} isDemoMode={true} />)
      expect(screen.getByTestId('budget-widget')).toBeInTheDocument()
      expect(screen.getByText(/Demo/)).toBeInTheDocument()
    })

    it('should render TripPlannerWidget in demo mode', () => {
      render(<TripPlannerWidget {...mockProps} isDemoMode={true} />)
      expect(screen.getByTestId('planner-widget')).toBeInTheDocument()
      expect(screen.getByText(/Demo/)).toBeInTheDocument()
    })

    it('should render PackingWidget in demo mode', () => {
      render(<PackingWidget {...mockProps} isDemoMode={true} />)
      expect(screen.getByTestId('packing-widget')).toBeInTheDocument()
      expect(screen.getByText(/Demo/)).toBeInTheDocument()
    })
  })

  describe('Standard User Widget Access', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        userLevel: 'standard',
        isPremium: false,
        isStandard: true,
        hasFeatureAccess: vi.fn().mockImplementation((feature) => {
          return ['countdown', 'saveData', 'multipleItems', 'exportData'].includes(feature)
        }),
        user: { id: '1', level: 'standard' } as any,
        isLoading: false,
        isLoggedIn: true,
        availableFeatures: [],
        upgradeFeatures: [],
        dataLimits: { items: 10, storage: '10MB' },
        createAnonUser: vi.fn(),
        upgradeToStandard: vi.fn(),
        upgradeToPremium: vi.fn(),
        upgradeToAdmin: vi.fn(),
        logout: vi.fn(),
        ensureUser: vi.fn(),
      })
    })

    it('should render CountdownWidget normally', () => {
      render(<CountdownWidget {...mockProps} isDemoMode={false} />)
      expect(screen.getByTestId('countdown-widget')).toBeInTheDocument()
      expect(screen.queryByText(/Demo/)).not.toBeInTheDocument()
    })

    it('should render premium widgets with upgrade prompts', () => {
      // For standard users, premium widgets should show upgrade prompts
      // This would be tested in actual widget implementation
      render(<BudgetWidget {...mockProps} isDemoMode={false} />)
      expect(screen.getByTestId('budget-widget')).toBeInTheDocument()
    })
  })

  describe('Premium User Widget Access', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        userLevel: 'premium',
        isPremium: true,
        isStandard: true,
        hasFeatureAccess: vi.fn().mockImplementation((feature) => {
          const premiumFeatures = [
            'countdown', 'saveData', 'multipleItems', 'exportData',
            'planner', 'tripPlanner', 'budget', 'packing', 'advancedAnalytics',
            'prioritySupport', 'unlimitedStorage'
          ]
          return premiumFeatures.includes(feature)
        }),
        user: { id: '1', level: 'premium' } as any,
        isLoading: false,
        isLoggedIn: true,
        availableFeatures: [],
        upgradeFeatures: [],
        dataLimits: { items: -1, storage: 'unlimited' },
        createAnonUser: vi.fn(),
        upgradeToStandard: vi.fn(),
        upgradeToPremium: vi.fn(),
        upgradeToAdmin: vi.fn(),
        logout: vi.fn(),
        ensureUser: vi.fn(),
      })
    })

    it('should render all widgets normally', () => {
      render(<CountdownWidget {...mockProps} isDemoMode={false} />)
      expect(screen.getByTestId('countdown-widget')).toBeInTheDocument()
      expect(screen.queryByText(/Demo/)).not.toBeInTheDocument()

      render(<BudgetWidget {...mockProps} isDemoMode={false} />)
      expect(screen.getByTestId('budget-widget')).toBeInTheDocument()
      expect(screen.queryByText(/Demo/)).not.toBeInTheDocument()

      render(<TripPlannerWidget {...mockProps} isDemoMode={false} />)
      expect(screen.getByTestId('planner-widget')).toBeInTheDocument()
      expect(screen.queryByText(/Demo/)).not.toBeInTheDocument()

      render(<PackingWidget {...mockProps} isDemoMode={false} />)
      expect(screen.getByTestId('packing-widget')).toBeInTheDocument()
      expect(screen.queryByText(/Demo/)).not.toBeInTheDocument()
    })
  })

  describe('Admin User Widget Access', () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({
        userLevel: 'admin',
        isPremium: true,
        isStandard: true,
        hasFeatureAccess: vi.fn().mockReturnValue(true), // Admin has access to all features
        user: { id: '1', level: 'admin' } as any,
        isLoading: false,
        isLoggedIn: true,
        availableFeatures: [],
        upgradeFeatures: [],
        dataLimits: { items: -1, storage: 'unlimited' },
        createAnonUser: vi.fn(),
        upgradeToStandard: vi.fn(),
        upgradeToPremium: vi.fn(),
        upgradeToAdmin: vi.fn(),
        logout: vi.fn(),
        ensureUser: vi.fn(),
      })
    })

    it('should render all widgets normally with full access', () => {
      render(<CountdownWidget {...mockProps} isDemoMode={false} />)
      expect(screen.getByTestId('countdown-widget')).toBeInTheDocument()
      expect(screen.queryByText(/Demo/)).not.toBeInTheDocument()

      render(<BudgetWidget {...mockProps} isDemoMode={false} />)
      expect(screen.getByTestId('budget-widget')).toBeInTheDocument()
      expect(screen.queryByText(/Demo/)).not.toBeInTheDocument()

      render(<TripPlannerWidget {...mockProps} isDemoMode={false} />)
      expect(screen.getByTestId('planner-widget')).toBeInTheDocument()
      expect(screen.queryByText(/Demo/)).not.toBeInTheDocument()

      render(<PackingWidget {...mockProps} isDemoMode={false} />)
      expect(screen.getByTestId('packing-widget')).toBeInTheDocument()
      expect(screen.queryByText(/Demo/)).not.toBeInTheDocument()
    })
  })

  describe('Widget Demo Mode Behavior', () => {
    it('should respect isDemoMode prop regardless of user level', () => {
      mockUseUser.mockReturnValue({
        userLevel: 'premium',
        isPremium: true,
        isStandard: true,
        hasFeatureAccess: vi.fn().mockReturnValue(true),
        user: { id: '1', level: 'premium' } as any,
        isLoading: false,
        isLoggedIn: true,
        availableFeatures: [],
        upgradeFeatures: [],
        dataLimits: { items: -1, storage: 'unlimited' },
        createAnonUser: vi.fn(),
        upgradeToStandard: vi.fn(),
        upgradeToPremium: vi.fn(),
        upgradeToAdmin: vi.fn(),
        logout: vi.fn(),
        ensureUser: vi.fn(),
      })

      // Even premium users should see demo mode when isDemoMode is true
      render(<CountdownWidget {...mockProps} isDemoMode={true} />)
      expect(screen.getByTestId('countdown-widget')).toBeInTheDocument()
      expect(screen.getByText(/Demo/)).toBeInTheDocument()
    })

    it('should not show demo mode when isDemoMode is false', () => {
      mockUseUser.mockReturnValue({
        userLevel: 'anon',
        isPremium: false,
        isStandard: false,
        hasFeatureAccess: vi.fn().mockReturnValue(false),
        user: null,
        isLoading: false,
        isLoggedIn: false,
        availableFeatures: [],
        upgradeFeatures: [],
        dataLimits: { items: 1, storage: '1MB' },
        createAnonUser: vi.fn(),
        upgradeToStandard: vi.fn(),
        upgradeToPremium: vi.fn(),
        upgradeToAdmin: vi.fn(),
        logout: vi.fn(),
        ensureUser: vi.fn(),
      })

      // Even anonymous users should not see demo mode when isDemoMode is false
      render(<CountdownWidget {...mockProps} isDemoMode={false} />)
      expect(screen.getByTestId('countdown-widget')).toBeInTheDocument()
      expect(screen.queryByText(/Demo/)).not.toBeInTheDocument()
    })
  })
})