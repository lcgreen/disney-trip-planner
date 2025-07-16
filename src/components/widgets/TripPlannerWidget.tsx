'use client'

import { useState, useEffect } from 'react'
import { Calendar, MapPin, Clock, Crown } from 'lucide-react'
import WidgetBase from './WidgetBase'
import { PluginRegistry, PluginStorage } from '@/lib/pluginSystem'
import { WidgetConfigManager } from '@/lib/widgetConfig'
import { useUser } from '@/hooks/useUser'
import demoDashboard from '@/config/demo-dashboard.json'
import '@/plugins' // Import all plugins to register them

interface TripPlannerWidgetProps {
  id: string
  width?: string
  onRemove: () => void
  onSettings?: () => void
  onWidthChange?: (width: string) => void
  onItemSelect?: (itemId: string | null) => void
  isDemoMode?: boolean
}

interface Activity {
  id: string
  time: string
  title: string
  location: string
  type: string
  priority: string
}

interface DayPlan {
  id: string
  date: string
  park: string
  activities: Activity[]
}

export default function TripPlannerWidget({
  id,
  width,
  onRemove,
  onSettings,
  onWidthChange,
  onItemSelect,
  isDemoMode = false
}: TripPlannerWidgetProps) {
  const { isPremium: userIsPremium } = useUser()
  const [selectedTripPlan, setSelectedTripPlan] = useState<any>(null)
  const [todaysActivities, setTodaysActivities] = useState<Activity[]>([])

  useEffect(() => {
    if (isDemoMode) {
      // Load demo data for anonymous users
      const demoWidget = demoDashboard.widgets.find((w: any) => w.id === id)
      if (demoWidget && demoWidget.selectedItemId) {
        const demoTripPlan = demoDashboard.data.tripPlans.find(
          (t: any) => t.id === demoWidget.selectedItemId
        )
        if (demoTripPlan) {
          setSelectedTripPlan(demoTripPlan)

          if (demoTripPlan.days) {
            // Find today's activities
            const today = new Date().toISOString().split('T')[0]
            const todaysDay = demoTripPlan.days.find((day: any) =>
              new Date(day.date).toISOString().split('T')[0] === today
            )

            if (todaysDay) {
              setTodaysActivities(todaysDay.activities)
            } else {
              // If no activities for today, show first day's activities
              const firstDay = demoTripPlan.days[0]
              if (firstDay) {
                setTodaysActivities(firstDay.activities)
              } else {
                setTodaysActivities([])
              }
            }
          } else {
            setTodaysActivities([])
          }
        }
      }
    } else {
      // Load selected trip plan data from plugin for authenticated users
      const plannerPlugin = PluginRegistry.getPlugin('planner')
      if (plannerPlugin) {
        // Get the widget configuration to see if a specific item is selected
        const widgetConfig = WidgetConfigManager.getConfig(id)
        const selectedItemId = widgetConfig?.selectedItemId

        let tripPlan
        if (selectedItemId) {
          // Load the specific selected trip plan
          tripPlan = plannerPlugin.getItem(selectedItemId)
        } else {
          // Load live/default data
          tripPlan = plannerPlugin.getWidgetData(id)
        }

        setSelectedTripPlan(tripPlan)

        if (tripPlan?.days) {
          // Find today's activities
          const today = new Date().toISOString().split('T')[0]
          const todaysDay = tripPlan.days.find((day: any) =>
            new Date(day.date).toISOString().split('T')[0] === today
          )

          if (todaysDay) {
            setTodaysActivities(todaysDay.activities)
          } else {
            // If no activities for today, show first day's activities
            const firstDay = tripPlan.days[0]
            if (firstDay) {
              setTodaysActivities(firstDay.activities)
            } else {
              setTodaysActivities([])
            }
          }
        } else {
          setTodaysActivities([])
        }
      }
    }
  }, [id, isDemoMode])

  // Watch for changes in widget configuration (skip in demo mode)
  useEffect(() => {
    if (isDemoMode) return // Don't watch for updates in demo mode

    const checkForUpdates = () => {
      const plannerPlugin = PluginRegistry.getPlugin('planner')
      if (plannerPlugin) {
        const widgetConfig = WidgetConfigManager.getConfig(id)
        const selectedItemId = widgetConfig?.selectedItemId

        let tripPlan
        if (selectedItemId) {
          tripPlan = plannerPlugin.getItem(selectedItemId)
        } else {
          tripPlan = plannerPlugin.getWidgetData(id)
        }

        setSelectedTripPlan(tripPlan)

        if (tripPlan?.days) {
          // Find today's activities
          const today = new Date().toISOString().split('T')[0]
          const todaysDay = tripPlan.days.find((day: any) =>
            new Date(day.date).toISOString().split('T')[0] === today
          )

          if (todaysDay) {
            setTodaysActivities(todaysDay.activities)
          } else {
            // If no activities for today, show first day's activities
            const firstDay = tripPlan.days[0]
            if (firstDay) {
              setTodaysActivities(firstDay.activities)
            } else {
              setTodaysActivities([])
            }
          }
        } else {
          setTodaysActivities([])
        }
      }
    }

    // Check immediately
    checkForUpdates()

    // Set up an interval to check for updates
    const interval = setInterval(checkForUpdates, 1000)
    return () => clearInterval(interval)
  }, [id, isDemoMode])

  const handleItemSelect = (itemId: string | null) => {
    // Only update configuration for authenticated users (not in demo mode)
    if (!isDemoMode) {
      WidgetConfigManager.updateConfig(id, { selectedItemId: itemId || undefined })
    }

    // Call the parent callback if provided
    if (onItemSelect) {
      onItemSelect(itemId)
    }
  }

  const isPremiumUser = () => {
    // In demo mode, show demo data regardless of premium status
    if (isDemoMode) {
      return true
    }
    // Otherwise, check actual user premium status
    return userIsPremium
  }

  const getActivitiesToShow = () => {
    // Determine max activities based on width
    const maxActivities = width === '1' ? 2 : width === '2' ? 3 : 6
    return todaysActivities.slice(0, maxActivities)
  }

  const renderTripPlanner = () => {
    if (!isPremiumUser()) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center relative">
          <div className="absolute top-2 right-2">
            <Crown className="w-6 h-6 text-yellow-500" />
          </div>
          <Calendar className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Premium Feature</h3>
          <p className="text-sm text-gray-500 mb-4">
            Upgrade to Premium to access trip planning
          </p>
          <button className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-lg hover:shadow-lg transition-all text-sm">
            Upgrade to Premium
          </button>
        </div>
      )
    }

    if (!selectedTripPlan || todaysActivities.length === 0) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center p-2">
          <Calendar className="w-10 h-10 text-gray-300 mb-3" />
          <h3 className="text-base font-medium text-gray-600 mb-1">No Trip Plan Selected</h3>
          <p className="text-xs text-gray-500 mb-3 max-w-[200px]">
            Create a new trip plan or select one from settings
          </p>
          <button
            onClick={() => window.location.href = `/planner/new?widgetId=${id}`}
            className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs font-medium"
          >
            Create New
          </button>
        </div>
      )
    }

    const activitiesToShow = getActivitiesToShow()
    const remainingActivities = todaysActivities.length - activitiesToShow.length

    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 mb-1 truncate">{selectedTripPlan.name}</h3>
          <p className="text-xs text-gray-500">
            {activitiesToShow.length} of {todaysActivities.length} activities today
          </p>
        </div>

        {/* Activities List */}
        <div className="flex-1 space-y-2">
          {activitiesToShow.map((activity, index) => (
            <div
              key={activity.id}
              className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="w-3 h-3 text-purple-600 flex-shrink-0" />
                    <span className="text-xs font-medium text-purple-700">{activity.time}</span>
                    {activity.priority === 'high' && (
                      <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                        Priority
                      </span>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-800 text-sm mb-1 truncate">{activity.title}</h4>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-500 truncate">{activity.location}</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activity.type === 'attraction' ? 'bg-blue-100 text-blue-700' :
                    activity.type === 'dining' ? 'bg-green-100 text-green-700' :
                    activity.type === 'show' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {activity.type}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {remainingActivities > 0 && (
            <div className="text-center py-2">
              <span className="text-xs text-gray-500">
                +{remainingActivities} more activities
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <WidgetBase
      id={id}
      title="Trip Planner"
      icon={Calendar}
      iconColor="bg-gradient-to-r from-purple-500 to-pink-500"
      widgetType="planner"
      size="medium"
      width={width}
      selectedItemId={selectedTripPlan?.id}
      onRemove={onRemove}
      onWidthChange={onWidthChange}
      onItemSelect={handleItemSelect}
      isDemoMode={isDemoMode}
    >
      {renderTripPlanner()}
    </WidgetBase>
  )
}