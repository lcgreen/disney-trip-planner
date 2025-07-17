import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import CountdownTimer from '@/components/CountdownTimer'
import { AutoSaveService } from '@/lib/autoSaveService'
import { userManager, UserLevel } from '@/lib/userManagement'
import { UnifiedStorage } from '@/lib/unifiedStorage'

// Mock the auto-save service
vi.mock('@/lib/autoSaveService', () => ({
  AutoSaveService: {
    saveCountdownData: vi.fn()
  }
}))

// Mock the unified storage
vi.mock('@/lib/unifiedStorage', () => ({
  UnifiedStorage: {
    getPluginItems: vi.fn(),
    savePluginItems: vi.fn()
  }
}))

// Mock the user management
vi.mock('@/lib/userManagement', () => ({
  UserLevel: {
    ANON: 'anon',
    STANDARD: 'standard',
    PREMIUM: 'premium',
    ADMIN: 'admin'
  },
  userManager: {
    getCurrentUser: vi.fn(),
    hasFeatureAccess: vi.fn()
  }
}))

describe('Premium User Auto-Save', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock premium user
    const mockPremiumUser = {
      id: 'premium-user-1',
      email: 'premium@example.com',
      name: 'Premium User',
      level: UserLevel.PREMIUM,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z'
    }

    vi.mocked(userManager.getCurrentUser).mockReturnValue(mockPremiumUser)
    vi.mocked(userManager.hasFeatureAccess).mockImplementation((feature) => {
      // Premium users should have access to saveData
      if (feature === 'saveData') return true
      return false
    })

    // Mock unified storage
    vi.mocked(UnifiedStorage.getPluginItems).mockReturnValue([])
    vi.mocked(UnifiedStorage.savePluginItems).mockResolvedValue()
  })

  it('should auto-save countdown data for premium users', async () => {
    const mockSaveCountdownData = vi.mocked(AutoSaveService.saveCountdownData)

    render(
      <CountdownTimer
        widgetId="test-widget-1"
        isEditMode={true}
        name="Test Countdown"
        onNameChange={() => {}}
        onSave={() => {}}
        onLoad={() => {}}
        onNew={() => {}}
        savedCountdowns={[]}
        activeCountdown={null}
        setCanSave={() => {}}
      />
    )

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Disney Countdown Timer')).toBeInTheDocument()
    })

    // Find and change the date input
    const dateInput = screen.getByLabelText('Select your Disney trip date and time')
    fireEvent.change(dateInput, { target: { value: '2025-12-25T10:00' } })

    // Wait for auto-save to be called (with longer timeout for debouncing)
    await waitFor(() => {
      expect(mockSaveCountdownData).toHaveBeenCalled()
    }, { timeout: 5000 })

    // Verify the auto-save was called with the correct data
    expect(mockSaveCountdownData).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Countdown',
        tripDate: expect.stringContaining('2025-12-25')
      }),
      'test-widget-1'
    )
  })

  it('should save to localStorage for premium users', async () => {
    const mockSavePluginItems = vi.mocked(UnifiedStorage.savePluginItems)

    render(
      <CountdownTimer
        widgetId="test-widget-1"
        isEditMode={true}
        name="Test Countdown"
        onNameChange={() => {}}
        onSave={() => {}}
        onLoad={() => {}}
        onNew={() => {}}
        savedCountdowns={[]}
        activeCountdown={null}
        setCanSave={() => {}}
      />
    )

    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Disney Countdown Timer')).toBeInTheDocument()
    })

    // Find and change the date input
    const dateInput = screen.getByLabelText('Select your Disney trip date and time')
    fireEvent.change(dateInput, { target: { value: '2025-12-25T10:00' } })

    // Wait for unified storage to be called (with longer timeout for debouncing)
    await waitFor(() => {
      expect(mockSavePluginItems).toHaveBeenCalledWith('countdown', expect.any(Array))
    }, { timeout: 5000 })

    // Verify the data was saved to localStorage (not just memory)
    expect(mockSavePluginItems).toHaveBeenCalledWith(
      'countdown',
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Test Countdown',
          tripDate: expect.stringContaining('2025-12-25')
        })
      ])
    )
  })
})