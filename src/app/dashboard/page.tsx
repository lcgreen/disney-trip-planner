'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings } from 'lucide-react'
import { useReduxUser } from '@/hooks/useReduxUser'
import { useReduxWidgets } from '@/hooks/useReduxWidgets'
import { PluginRegistry } from '@/lib/pluginSystem'
import { hasLevelAccess } from '@/lib/userManagement'
import { type WidgetConfig } from '@/types'
import { CountdownWidget, TripPlannerWidget, BudgetWidget, PackingWidget, WidgetConfigManager as WidgetConfigManagerComponent } from '@/components/widgets'
import { Button, Badge } from '@/components/ui'
import demoDashboard from '@/config/demo-dashboard.json'
import { migrateWidgetData, ensureDemoDashboard } from '@/lib/widgetMigration'

interface WidgetOption {
  type: string
  name: string
  description: string
  icon: string
  color: string
  requiredLevel?: 'anon' | 'standard' | 'premium'
}

export default function DashboardPage() {
  const { userLevel, hasFeatureAccess } = useReduxUser()
  const {
    widgets,
    orderedWidgets,
    isLoading,
    error,
    addWidget: addWidgetAction,
    removeWidget: removeWidgetAction,
    reorderWidgets: reorderWidgetsAction,
    updateWidget: updateWidgetAction
  } = useReduxWidgets()
  const [showAddWidget, setShowAddWidget] = useState(false)
  const [showConfigManager, setShowConfigManager] = useState(false)

  // Initialize widget data on mount
  useEffect(() => {
    migrateWidgetData()
    ensureDemoDashboard()
  }, [])

  // Update demo dashboard when user level changes
  useEffect(() => {
    ensureDemoDashboard()
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

    addWidgetAction(newWidget)
    setShowAddWidget(false)
  }

  const removeWidget = (widgetId: string) => {
    // Only allow authenticated users to remove widgets
    if (userLevel === 'anon') return

    removeWidgetAction(widgetId)
  }

  const reorderWidgets = (fromIndex: number, toIndex: number) => {
    // Only allow authenticated users to reorder widgets
    if (userLevel === 'anon') return

    const newOrder = [...orderedWidgets.map(w => w.id)]
    const [movedItem] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, movedItem)

    reorderWidgetsAction(newOrder)
  }

  const handleWidthChange = (widgetId: string, newWidth: string) => {
    // Only allow authenticated users to change widget width
    if (userLevel === 'anon') return

    updateWidgetAction(widgetId, { width: newWidth })
  }

  const handleItemSelect = (widgetId: string, itemId: string | null) => {
    // Only allow authenticated users to select items
    if (userLevel === 'anon') return

    updateWidgetAction(widgetId, { selectedItemId: itemId || undefined })
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
              >
                {userLevel === 'premium' ? 'Premium' : userLevel === 'standard' ? 'Standard' : 'Anonymous'}
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowAddWidget(true)}
                disabled={userLevel === 'anon'}
                data-testid="add-widget-button"
              >
                Add Widget
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowConfigManager(true)}
                disabled={userLevel === 'anon'}
                data-testid="manage-widgets-button"
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Widgets
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading widgets...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading widgets: {error}</p>
            </div>
          )}

          {/* Widgets Grid */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="widgets-grid">
              {orderedWidgets.map((widget, index) => {
                const WidgetComponent = getWidgetComponent(widget.type)
                if (!WidgetComponent) return null

                return (
                  <motion.div
                    key={widget.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`col-span-1 ${widget.width === 'wide' ? 'md:col-span-2' : widget.width === 'tall' ? 'row-span-2' : ''}`}
                    data-testid={`widget-${widget.id}`}
                  >
                    <WidgetComponent
                      id={widget.id}
                      width={widget.width}
                      onRemove={() => removeWidget(widget.id)}
                      onSettings={() => setShowConfigManager(true)}
                      onWidthChange={(newWidth) => handleWidthChange(widget.id, newWidth)}
                      onItemSelect={(itemId) => handleItemSelect(widget.id, itemId)}
                      isDemoMode={userLevel === 'anon'}
                    />
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && orderedWidgets.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
              data-testid="empty-state"
            >
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">🎢</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No widgets yet!</h3>
                <p className="text-gray-600 mb-6">
                  {userLevel === 'anon'
                    ? "Add some widgets to start planning your magical Disney adventure!"
                    : "Add some widgets to start planning your magical Disney adventure! Your widgets will be saved automatically."
                  }
                </p>
                <Button
                  onClick={() => setShowAddWidget(true)}
                  disabled={userLevel === 'anon'}
                  data-testid="add-first-widget-button"
                >
                  Add Your First Widget
                </Button>
              </div>
            </motion.div>
          )}

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

          {/* Config Manager Modal */}
          {showConfigManager && (
            <WidgetConfigManagerComponent
              isOpen={showConfigManager}
              onClose={() => setShowConfigManager(false)}
              onConfigsChange={(configs) => {
                // This will be handled by Redux automatically
                console.log('Configs changed:', configs)
              }}
              currentConfigs={orderedWidgets}
              userLevel={userLevel}
            />
          )}
        </motion.div>
      </div>
    </div>
  )
}