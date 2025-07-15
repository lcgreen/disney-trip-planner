'use client'

import { useState, useEffect } from 'react'
import { Calendar, MapPin, Clock, Crown } from 'lucide-react'
import WidgetBase, { type WidgetSize } from './WidgetBase'
import { WidgetConfigManager, type SavedTripPlan } from '@/lib/widgetConfig'

interface TripPlannerWidgetProps {
  id: string
  onRemove: () => void
  onSettings?: () => void
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

export default function TripPlannerWidget({ id, onRemove, onSettings }: TripPlannerWidgetProps) {
  const [config, setConfig] = useState<{ size: WidgetSize; selectedItemId?: string } | null>(null)
  const [selectedTripPlan, setSelectedTripPlan] = useState<SavedTripPlan | null>(null)
  const [todaysActivities, setTodaysActivities] = useState<Activity[]>([])

  useEffect(() => {
    // Load widget config
    const widgetConfig = WidgetConfigManager.getConfig(id)
    if (widgetConfig) {
      setConfig({ size: widgetConfig.size, selectedItemId: widgetConfig.selectedItemId })
    } else {
      // Default config
      const defaultConfig = { size: 'medium' as WidgetSize, selectedItemId: undefined }
      setConfig(defaultConfig)
      WidgetConfigManager.addConfig({
        id,
        type: 'planner',
        size: 'medium',
        selectedItemId: undefined,
        settings: {}
      })
    }
  }, [id])

  useEffect(() => {
    // Load selected trip plan data
    if (config?.selectedItemId) {
      const tripPlan = WidgetConfigManager.getSelectedItemData('planner', config.selectedItemId) as SavedTripPlan
      if (tripPlan) {
        setSelectedTripPlan(tripPlan)

        // Find today's activities
        const today = new Date().toISOString().split('T')[0]
        const todaysDay = tripPlan.days.find(day =>
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
        // Selected item not found, fall back to live app state
        const currentState = WidgetConfigManager.getCurrentTripPlanState()
        if (currentState?.days && currentState.days.length > 0) {
          const livePlan: SavedTripPlan = {
            id: 'live',
            name: 'Current Trip Plan',
            days: currentState.days,
            createdAt: new Date().toISOString(),
            updatedAt: currentState.updatedAt || new Date().toISOString()
          }
          setSelectedTripPlan(livePlan)

          const today = new Date().toISOString().split('T')[0]
          const todaysDay = livePlan.days.find(day =>
            new Date(day.date).toISOString().split('T')[0] === today
          )

          if (todaysDay) {
            setTodaysActivities(todaysDay.activities)
          } else {
            const firstDay = livePlan.days[0]
            if (firstDay) {
              setTodaysActivities(firstDay.activities)
            } else {
              setTodaysActivities([])
            }
          }
        } else {
          setSelectedTripPlan(null)
          setTodaysActivities([])
        }
      }
    } else {
      // No item selected, use live app state as default
      const currentState = WidgetConfigManager.getCurrentTripPlanState()
      if (currentState?.days && currentState.days.length > 0) {
        const livePlan: SavedTripPlan = {
          id: 'live',
          name: 'Current Trip Plan',
          days: currentState.days,
          createdAt: new Date().toISOString(),
          updatedAt: currentState.updatedAt || new Date().toISOString()
        }
        setSelectedTripPlan(livePlan)

        const today = new Date().toISOString().split('T')[0]
        const todaysDay = livePlan.days.find(day =>
          new Date(day.date).toISOString().split('T')[0] === today
        )

        if (todaysDay) {
          setTodaysActivities(todaysDay.activities)
        } else {
          const firstDay = livePlan.days[0]
          if (firstDay) {
            setTodaysActivities(firstDay.activities)
          } else {
            setTodaysActivities([])
          }
        }
      } else {
        // Fallback to saved plans if no live state
        const tripPlans = WidgetConfigManager.getAvailableTripPlans()
        if (tripPlans.length > 0) {
          const defaultPlan = tripPlans[0]
          setSelectedTripPlan(defaultPlan)

          const today = new Date().toISOString().split('T')[0]
          const todaysDay = defaultPlan.days.find(day =>
            new Date(day.date).toISOString().split('T')[0] === today
          )

          if (todaysDay) {
            setTodaysActivities(todaysDay.activities)
          } else {
            const firstDay = defaultPlan.days[0]
            if (firstDay) {
              setTodaysActivities(firstDay.activities)
            } else {
              setTodaysActivities([])
            }
          }
        } else {
          setSelectedTripPlan(null)
          setTodaysActivities([])
        }
      }
    }
  }, [config])

  // Add polling to check for updates from main app
  useEffect(() => {
    if (!config?.selectedItemId) {
      // Only poll for live updates when using default (no specific item selected)
      const pollInterval = setInterval(() => {
        const currentState = WidgetConfigManager.getCurrentTripPlanState()
        if (currentState?.days && currentState.days.length > 0) {
          const livePlan: SavedTripPlan = {
            id: 'live',
            name: 'Current Trip Plan',
            days: currentState.days,
            createdAt: new Date().toISOString(),
            updatedAt: currentState.updatedAt || new Date().toISOString()
          }
          setSelectedTripPlan(livePlan)

          const today = new Date().toISOString().split('T')[0]
          const todaysDay = livePlan.days.find(day =>
            new Date(day.date).toISOString().split('T')[0] === today
          )

          if (todaysDay) {
            setTodaysActivities(todaysDay.activities)
          } else {
            const firstDay = livePlan.days[0]
            if (firstDay) {
              setTodaysActivities(firstDay.activities)
            } else {
              setTodaysActivities([])
            }
          }
        }
      }, 2000) // Check every 2 seconds

      return () => clearInterval(pollInterval)
    }
  }, [config?.selectedItemId])

  const handleSizeChange = (newSize: WidgetSize) => {
    WidgetConfigManager.updateConfig(id, { size: newSize })
    setConfig(prev => prev ? { ...prev, size: newSize } : { size: newSize })
  }

  const handleItemSelect = (itemId: string | null) => {
    WidgetConfigManager.updateConfig(id, { selectedItemId: itemId || undefined })
    setConfig(prev => prev ? { ...prev, selectedItemId: itemId || undefined } : { size: 'medium', selectedItemId: itemId || undefined })
  }

  if (!config) {
    return <div>Loading...</div>
  }

  const { size } = config

  const isPremiumUser = () => {
    // This would check actual subscription status
    return true
  }

  const getActivitiesToShow = () => {
    const maxActivities = size === 'small' ? 2 : size === 'medium' ? 3 : 6
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
        <div className="h-full flex flex-col items-center justify-center text-center">
          <Calendar className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Trip Plan</h3>
          <p className="text-sm text-gray-500 mb-4">
            {config.selectedItemId
              ? 'Selected trip plan not found'
              : 'Create a trip plan or select a saved one'}
          </p>
          <button
            onClick={() => window.location.href = '/planner'}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            {config.selectedItemId ? 'Go to Planner' : 'Create Trip Plan'}
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
          <h3 className="font-semibold text-gray-800 text-sm truncate mb-1">
            {selectedTripPlan.name}
          </h3>
                     <p className="text-xs text-gray-500">
             Today&apos;s Activities
           </p>
        </div>

        {/* Activities list */}
        <div className="flex-1 space-y-2 overflow-hidden">
          {activitiesToShow.map((activity) => (
            <div
              key={activity.id}
              className="p-2 bg-purple-50 border border-purple-100 rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="w-3 h-3 text-purple-600" />
                    <span className="text-xs font-medium text-purple-700">
                      {activity.time}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {activity.title}
                  </p>
                  {size !== 'small' && (
                    <div className="flex items-center space-x-1 mt-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 truncate">
                        {activity.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {remainingActivities > 0 && (
            <div className="text-center py-2">
              <span className="text-xs text-gray-500">
                +{remainingActivities} more activit{remainingActivities !== 1 ? 'ies' : 'y'}
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
      iconColor="bg-gradient-to-r from-purple-600 to-indigo-600"
      widgetType="planner"
      size={size}
      selectedItemId={config.selectedItemId}
      isPremium={true}
      onRemove={onRemove}
      onSizeChange={handleSizeChange}
      onItemSelect={handleItemSelect}
    >
      {renderTripPlanner()}
    </WidgetBase>
  )
}