// Component-level integration test for dashboard widget update after edit
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CountdownWidget from './CountdownWidget';
import * as widgetConfigModule from '@/lib/widgetConfig';
import * as unifiedStorageModule from '@/lib/unifiedStorage';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock data
const mockCountdown = {
  id: 'countdown-1',
  name: 'My Disney Trip',
  tripDate: '2025-12-25T09:00:00.000Z',
  park: { id: 'mk', name: 'Magic Kingdom', gradient: 'from-red-500 to-yellow-500' },
  settings: {
    showMilliseconds: false,
    showTimezone: true,
    showTips: true,
    showAttractions: true,
    playSound: true,
    autoRefresh: true,
    digitStyle: 'modern',
    layout: 'horizontal',
    fontSize: 'medium',
    backgroundEffect: 'gradient',
  },
  theme: { primaryColor: 'blue', secondaryColor: 'purple' },
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const mockWidgetConfig = {
  id: 'widget-1',
  type: 'countdown' as const,
  size: 'medium' as const,
  order: 0,
  selectedItemId: 'countdown-1',
  settings: {},
};

// Helper to update the mock storage/config
let currentCountdown = { ...mockCountdown };
let currentConfig = { ...mockWidgetConfig };

beforeEach(() => {
  // Mock UnifiedStorage.getPluginItems
  vi.spyOn(unifiedStorageModule.UnifiedStorage, 'getPluginItems').mockImplementation((pluginId) => {
    if (pluginId === 'countdown') return [currentCountdown];
    return [];
  });
  // Mock WidgetConfigManager.getConfig
  vi.spyOn(widgetConfigModule.WidgetConfigManager, 'getConfig').mockImplementation((id) => {
    if (id === 'widget-1') return { ...currentConfig };
    return null;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('CountdownWidget integration', () => {
  it('should display updated countdown after editing and returning to dashboard', async () => {
    // Simulate editing the countdown (as if on the edit page)
    currentCountdown = {
      ...currentCountdown,
      name: 'Updated Disney Trip',
      tripDate: '2025-12-31T10:00:00.000Z',
      park: { id: 'ep', name: 'EPCOT', gradient: 'from-green-500 to-blue-500' },
    };
    currentConfig = { ...currentConfig, selectedItemId: currentCountdown.id };

    // Simulate navigating back to dashboard and rendering the widget
    render(
      <CountdownWidget
        id="widget-1"
        width="2"
        onRemove={() => {}}
        onSettings={() => {}}
        onWidthChange={() => {}}
        onItemSelect={() => {}}
        isDemoMode={false}
      />
    );

    // Assert the widget displays the updated values
    await waitFor(() => {
      expect(screen.getByText('Updated Disney Trip')).toBeInTheDocument();
      expect(screen.getByText(/EPCOT/)).toBeInTheDocument(); // Use regex to match EPCOT within the subtitle
    });
    // The date should be formatted, so check for the year
    expect(screen.getByText(/2025/)).toBeInTheDocument();
  });
});