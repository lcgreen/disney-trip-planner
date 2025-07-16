'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUser } from '@/hooks/useUser'
import { PluginRegistry } from '@/lib/pluginSystem'
import { hasLevelAccess } from '@/lib/userManagement'
import { WidgetConfigManager, type WidgetConfig } from '@/lib/widgetConfig'
import { CountdownWidget, TripPlannerWidget, BudgetWidget, PackingWidget } from '@/components/widgets'
import { Button, Badge } from '@/components/ui'

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

  // Load widgets on mount
  useEffect(() => {
    const configs = WidgetConfigManager.getConfigs()
    setWidgets(configs)
  }, [])

  const addWidget = (type: string) => {
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
    WidgetConfigManager.removeConfigSync(widgetId)
    const updatedWidgets = WidgetConfigManager.getConfigs()
    setWidgets(updatedWidgets)
  }

  const reorderWidgets = (fromIndex: number, toIndex: number) => {
    const newOrder = [...widgets.map(w => w.id)]
    const [movedItem] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, movedItem)

    WidgetConfigManager.reorderWidgetsSync(newOrder)
    const updatedWidgets = WidgetConfigManager.getConfigs()
    setWidgets(updatedWidgets)
  }

  const getWidgetOptions = (hasFeatureAccess: (feature: string) => boolean, userLevel: string) => {
    return PluginRegistry.getAllPlugins()
      .filter(plugin => {
        // Admin users only see admin features, not regular user widgets
        if (userLevel === 'admin') {
          return false // Admin users don't see regular widgets
        }

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
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              ✨ Disney Countdown Dashboard
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Welcome to your magical Disney planning hub! Add widgets to track your countdown, plan your trip, manage your budget, and pack your essentials.
            </p>
          </div>

          {/* User Level Badge */}
          <div className="flex justify-center">
            <Badge
              variant={userLevel === 'premium' ? 'success' : userLevel === 'standard' ? 'info' : 'warning'}
              size="lg"
            >
              {userLevel === 'premium' ? 'Premium User' : userLevel === 'standard' ? 'Standard User' : 'Anonymous User'}
            </Badge>
          </div>

          {/* Widgets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {widgets.map((widget, index) => {
              const WidgetComponent = getWidgetComponent(widget.type)
              if (!WidgetComponent) return null

              return (
                <motion.div
                  key={widget.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <WidgetComponent
                      id={widget.id}
                      width={widget.width}
                      onRemove={() => removeWidget(widget.id)}
                      onSettings={() => {}}
                      onWidthChange={() => {}}
                      onItemSelect={() => {}}
                      isDemoMode={userLevel === 'anon'}
                    />
                  </div>
                </motion.div>
              )
            })}

            {/* Add Widget Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: widgets.length * 0.1 }}
              className="relative"
            >
              <button
                onClick={() => setShowAddWidget(true)}
                className="w-full h-64 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex flex-col items-center justify-center text-gray-500 hover:text-gray-700"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">+</span>
                </div>
                <span className="font-medium">Add Widget</span>
                <span className="text-sm mt-1">Customize your dashboard</span>
              </button>
            </motion.div>
          </div>

          {/* Add Widget Modal */}
          {showAddWidget && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Add Widget</h2>
                  <button
                    onClick={() => setShowAddWidget(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {widgetOptions.map((option) => (
                    <button
                      key={option.type}
                      onClick={() => addWidget(option.type)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all text-left"
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
        </motion.div>
      </div>
    </div>
  )
}