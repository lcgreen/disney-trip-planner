import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DashboardPage from './page';
import * as widgetConfigModule from '@/lib/widgetConfig';
import * as unifiedStorageModule from '@/lib/unifiedStorage';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { WidgetConfig } from '@/types';

// Mock data for countdown
const mockCountdown = {
  id: 'countdown-1',
  name: 'My Disney Trip',
  tripDate: '2025-12-31T10:00:00.000Z',
  park: { id: 'ep', name: 'EPCOT', gradient: 'from-green-500 to-blue-500' },
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

const updatedCountdown = {
  ...mockCountdown,
  name: 'Updated Disney Trip',
  tripDate: '2026-01-15T09:00:00.000Z',
  park: { id: 'mk', name: 'Magic Kingdom', gradient: 'from-pink-500 to-yellow-500' },
};

const mockWidgetConfig: WidgetConfig = {
  id: 'widget-1',
  type: 'countdown',
  size: 'medium',
  order: 0,
  selectedItemId: 'countdown-1',
  settings: {},
};

describe('DashboardWidgetIntegration', () => {
  beforeEach(() => {
    // Mock WidgetConfigManager static methods
    vi.spyOn(widgetConfigModule.WidgetConfigManager, 'getConfigs').mockReturnValue([mockWidgetConfig]);
    vi.spyOn(widgetConfigModule.WidgetConfigManager, 'getConfig').mockReturnValue(mockWidgetConfig);
    vi.spyOn(widgetConfigModule.WidgetConfigManager, 'getSelectedItemData').mockReturnValue(mockCountdown as any);
    // Mock UnifiedStorage static methods
    vi.spyOn(unifiedStorageModule.UnifiedStorage, 'getPluginItems').mockReturnValue([mockCountdown as any]);
    vi.spyOn(unifiedStorageModule.UnifiedStorage, 'savePluginItems').mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should display updated park and date after editing and returning to dashboard', async () => {
    const { unmount } = render(<DashboardPage />);

    // Simulate editing the countdown (change park and date)
    (widgetConfigModule.WidgetConfigManager.getConfigs as any).mockReturnValue([mockWidgetConfig]);
    (widgetConfigModule.WidgetConfigManager.getSelectedItemData as any).mockReturnValue(updatedCountdown as any);
    (unifiedStorageModule.UnifiedStorage.getPluginItems as any).mockReturnValue([updatedCountdown as any]);

    // Unmount and re-mount to simulate navigation back to dashboard
    unmount();
    render(<DashboardPage />);

    // Debug: print the rendered HTML
    // eslint-disable-next-line no-console
    // @ts-ignore
    console.log(document.body.innerHTML);

    // Assert the widget displays the updated park and date
    await waitFor(() => {
      expect(screen.getByText(/Updated Disney Trip/)).toBeInTheDocument();
      expect(screen.getByText(/Magic Kingdom/)).toBeInTheDocument();
      expect(screen.getByText(/2026/)).toBeInTheDocument();
    });
  });
});