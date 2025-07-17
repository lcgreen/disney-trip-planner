import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { renderWithRedux } from './testUtils'
import { ParkSelection } from '@/components/countdown/ParkSelection'

describe('Hydration Test', () => {
  it('should render loading state initially and then show parks', async () => {
    const mockParks = [
      {
        id: 'disney-world',
        name: 'Walt Disney World',
        location: 'Florida',
        color: '#1E40AF',
        gradient: 'from-blue-600 to-blue-800',
        timezone: 'America/New_York',
        openingTime: '09:00',
        icon: '🏰',
        description: 'The most magical place on Earth',
        popularAttractions: ['Space Mountain', 'Pirates of the Caribbean']
      }
    ]

    const { rerender } = renderWithRedux(
      <ParkSelection
        disneyParks={[]}
        selectedPark={null}
        onParkSelect={() => {}}
        settings={{
          showMilliseconds: false,
          showTimezone: true,
          showTips: true,
          showAttractions: true,
          playSound: true,
          autoRefresh: true,
          digitStyle: 'modern' as const,
          layout: 'horizontal' as const,
          fontSize: 'medium' as const,
          backgroundEffect: 'gradient' as const
        }}
      />
    )

    // Should show loading state initially
    expect(screen.getByText('Loading parks...')).toBeInTheDocument()

    // Re-render with parks data (simulating client-side hydration)
    rerender(
      <ParkSelection
        disneyParks={mockParks}
        selectedPark={null}
        onParkSelect={() => {}}
        settings={{
          showMilliseconds: false,
          showTimezone: true,
          showTips: true,
          showAttractions: true,
          playSound: true,
          autoRefresh: true,
          digitStyle: 'modern' as const,
          layout: 'horizontal' as const,
          fontSize: 'medium' as const,
          backgroundEffect: 'gradient' as const
        }}
      />
    )

    // Should show parks after hydration
    expect(screen.getByText('Walt Disney World')).toBeInTheDocument()
    expect(screen.queryByText('Loading parks...')).not.toBeInTheDocument()
  })

  it('should handle client-side state correctly', () => {
    const mockParks = [
      {
        id: 'disney-world',
        name: 'Walt Disney World',
        location: 'Florida',
        color: '#1E40AF',
        gradient: 'from-blue-600 to-blue-800',
        timezone: 'America/New_York',
        openingTime: '09:00',
        icon: '🏰',
        description: 'The most magical place on Earth',
        popularAttractions: ['Space Mountain', 'Pirates of the Caribbean']
      }
    ]

    renderWithRedux(
      <ParkSelection
        disneyParks={mockParks}
        selectedPark={null}
        onParkSelect={() => {}}
        settings={{
          showMilliseconds: false,
          showTimezone: true,
          showTips: true,
          showAttractions: true,
          playSound: true,
          autoRefresh: true,
          digitStyle: 'modern' as const,
          layout: 'horizontal' as const,
          fontSize: 'medium' as const,
          backgroundEffect: 'gradient' as const
        }}
      />
    )

    // Should show parks immediately when data is available
    expect(screen.getByText('Walt Disney World')).toBeInTheDocument()
    expect(screen.queryByText('Loading parks...')).not.toBeInTheDocument()
  })
})