'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { PluginRegistry } from '@/lib/pluginSystem'
import { hasLevelAccess } from '@/lib/userManagement'
import { WidgetConfigManager } from '@/lib/widgetConfig'
import { type WidgetConfig } from '@/types'
import { CountdownWidget, TripPlannerWidget, BudgetWidget, PackingWidget, WidgetConfigManager as WidgetConfigManagerComponent } from '@/components/widgets'
import { Button, Badge } from '@/components/ui'
import demoDashboard from '@/config/demo-dashboard.json'

interface WidgetOption {
  type: string
  name: string
  description: string
  icon: string
  color: string
  requiredLevel?: 'anon' | 'standard' | 'premium'
}

export default function DashboardPage() {
  const { userLevel, hasFeatureAccess } = useUser()
  const [widgets, setWidgets] = useState<WidgetConfig[]>([])
  const [showAddWidget, setShowAddWidget] = useState(false)
  const [showConfigManager, setShowConfigManager] = useState(false)

  // Load widgets on mount and when user level changes
  useEffect(() => {
    // Check if we're in test mode (process.env.NODE_ENV === 'test')
    const isTestMode = process.env.NODE_ENV === 'test'

    if (userLevel === 'anon' && !isTestMode) {
      // Load demo dashboard for anonymous users (but not in test mode)
      setWidgets(demoDashboard.widgets as WidgetConfig[])
    } else {
      // Load saved configurations for authenticated users or test mode
      const configs = WidgetConfigManager.getConfigs()
      setWidgets(configs)
    }
  }, [userLevel])

  // Refresh widgets when the page becomes visible or when storage changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && userLevel !== 'anon') {
        // Reload widget configurations when page becomes visible
        const configs = WidgetConfigManager.getConfigs()
        setWidgets(configs)
      }
    }

    const handleStorageChange = (e: StorageEvent) => {
      // Refresh when widget configs or countdown data changes
      if (e.key === 'disney-widget-configs' || e.key === 'disney-countdowns' || e.key === 'disney-auto-save-data') {
        if (userLevel !== 'anon') {
          const configs = WidgetConfigManager.getConfigs()
          setWidgets(configs)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [userLevel])

  const addWidget = (type: string) => {
    // Only allow authenticated users to add widgets
    if (userLevel === 'anon') return

    const newWidget: WidgetConfig = {
      id: `${type}-${Date.now()}`,
      type: type as 'countdown' | 'planner' | 'budget' | 'packing',
      size: 'medium',
      order: widgets.length,
      width: undefined,
      selectedItemId: undefined,
      settings: {}
    }

    WidgetConfigManager.addConfigSync(newWidget)
    const updatedWidgets = WidgetConfigManager.getConfigs()
    setWidgets(updatedWidgets)
    setShowAddWidget(false)
  }

  const removeWidget = (widgetId: string) => {
    // Only allow authenticated users to remove widgets
    if (userLevel === 'anon') return

    WidgetConfigManager.removeConfigSync(widgetId)
    const updatedWidgets = WidgetConfigManager.getConfigs()
    setWidgets(updatedWidgets)
  }

  const reorderWidgets = (fromIndex: number, toIndex: number) => {
    // Only allow authenticated users to reorder widgets
    if (userLevel === 'anon') return

    const newOrder = [...widgets.map(w => w.id)]
    const [movedItem] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, movedItem)

    WidgetConfigManager.reorderWidgetsSync(newOrder)
    const updatedWidgets = WidgetConfigManager.getConfigs()
    setWidgets(updatedWidgets)
  }

  const handleWidthChange = (widgetId: string, newWidth: string) => {
    // Only allow authenticated users to change widget width
    if (userLevel === 'anon') return

    WidgetConfigManager.updateConfigSync(widgetId, { width: newWidth })
    const updatedWidgets = WidgetConfigManager.getConfigs()
    setWidgets(updatedWidgets)
  }

  const handleItemSelect = (widgetId: string, itemId: string | null) => {
    // Only allow authenticated users to select items
    if (userLevel === 'anon') return

    WidgetConfigManager.updateConfigSync(widgetId, { selectedItemId: itemId || undefined })
    const updatedWidgets = WidgetConfigManager.getConfigs()
    setWidgets(updatedWidgets)
  }

  const getWidgetOptions = (hasFeatureAccess: (feature: string) => boolean, userLevel: string) => {
    return PluginRegistry.getAllPlugins()
      .filter(plugin => {
        // Anonymous users can see all widgets on dashboard (they're shown as demo)
        if (userLevel === 'anon') {
          return true
        }

        // Check if user has access to this plugin based on required level
        if (plugin.config.requiredLevel) {
          return hasLevelAccess(plugin.config.requiredLevel)
        }
        return true // No required level means accessible to all
      })
      .map(plugin => ({
        type: plugin.config.widgetType,
        name: plugin.config.name,
        description: plugin.config.description,
        icon: plugin.config.icon,
        color: plugin.config.color,
        requiredLevel: plugin.config.requiredLevel
      }))
  }

  const widgetOptions = getWidgetOptions(hasFeatureAccess, userLevel)

  // Get widget component based on type
  const getWidgetComponent = (type: string) => {
    switch (type) {
      case 'countdown':
        return CountdownWidget
      case 'planner':
        return TripPlannerWidget
      case 'budget':
        return BudgetWidget
      case 'packing':
        return PackingWidget
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center" data-testid="dashboard-header">
            <h1 className="text-4xl font-bold text-gray-800 mb-4" data-testid="dashboard-title">
              ✨ Disney Countdown Dashboard
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto" data-testid="dashboard-description">
              Welcome to your magical Disney planning hub! Add widgets to track your countdown, plan your trip, manage your budget, and pack your essentials.
            </p>
          </div>

          {/* User Level Badge and Actions */}
          <div className="flex justify-center items-center space-x-4" data-testid="dashboard-actions">
            <div className="flex space-x-2" data-testid="user-badges">
              <Badge
                variant={userLevel === 'premium' ? 'success' : userLevel === 'standard' ? 'info' : 'warning'}
                size="lg"
                data-testid="user-level-badge"
              >
                {userLevel === 'premium' ? 'Premium User' : userLevel === 'standard' ? 'Standard User' : 'Anonymous User'}
              </Badge>
              {userLevel === 'anon' && (
                <Badge variant="warning" size="lg" data-testid="demo-mode-badge">
                  Demo Mode
                </Badge>
              )}
            </div>

            {/* Widget Configuration Button - Only show for authenticated users */}
            {userLevel !== 'anon' && (
              <Button
                onClick={() => setShowConfigManager(true)}
                variant="secondary"
                size="sm"
                className="flex items-center space-x-2"
                data-testid="configure-widgets-button"
              >
                <Settings className="w-4 h-4" />
                Configure Widgets
              </Button>
            )}
          </div>

          {/* Widgets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="widgets-grid">
            {widgets
              .filter(widget => !widget.settings?.hidden) // Hide widgets marked as hidden
              .map((widget, index) => {
                const WidgetComponent = getWidgetComponent(widget.type)
                if (!WidgetComponent) return null

                return (
                  <motion.div
                    key={widget.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                    data-testid={`widget-${widget.type}-${widget.id}`}
                  >
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                      <WidgetComponent
                        id={widget.id}
                        width={widget.width}
                        onRemove={() => removeWidget(widget.id)}
                        onSettings={() => {}}
                        onWidthChange={(newWidth) => handleWidthChange(widget.id, newWidth)}
                        onItemSelect={(itemId) => handleItemSelect(widget.id, itemId)}
                        isDemoMode={userLevel === 'anon' && process.env.NODE_ENV !== 'test'}
                      />
                    </div>
                  </motion.div>
                )
              })}

            {/* Add Widget Button - Only show for authenticated users */}
            {userLevel !== 'anon' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: widgets.length * 0.1 }}
                className="relative"
                data-testid="add-widget-button-container"
              >
                <button
                  onClick={() => setShowAddWidget(true)}
                  className="w-full h-64 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex flex-col items-center justify-center text-gray-500 hover:text-gray-700"
                  data-testid="add-widget-button"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">+</span>
                  </div>
                  <span className="font-medium">Add Widget</span>
                  <span className="text-sm mt-1">Customize your dashboard</span>
                </button>
              </motion.div>
            )}
          </div>

          {/* Add Widget Modal */}
          {showAddWidget && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" data-testid="add-widget-modal">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                data-testid="add-widget-modal-content"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800" data-testid="add-widget-modal-title">Add Widget</h2>
                  <button
                    onClick={() => setShowAddWidget(false)}
                    className="text-gray-400 hover:text-gray-600"
                    data-testid="add-widget-modal-close"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="widget-options-grid">
                  {widgetOptions.map((option) => (
                    <button
                      key={option.type}
                      onClick={() => addWidget(option.type)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all text-left"
                      data-testid={`widget-option-${option.type}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${option.color} flex items-center justify-center`}>
                          <span className="text-white text-lg">{option.icon}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-800">{option.name}</h3>
                            {option.requiredLevel === 'premium' && (
                              <Badge variant="warning" size="sm">Premium</Badge>
                            )}
                            {option.requiredLevel === 'standard' && (
                              <Badge variant="info" size="sm">Standard</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Widget Configuration Manager */}
          <WidgetConfigManagerComponent
            isOpen={showConfigManager}
            onClose={() => setShowConfigManager(false)}
            onConfigsChange={setWidgets}
            currentConfigs={widgets}
            userLevel={userLevel}
          />
        </motion.div>
      </div>
    </div>
  )
}