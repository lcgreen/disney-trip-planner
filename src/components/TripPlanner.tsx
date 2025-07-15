'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, Plus, Star, Trash2, Edit } from 'lucide-react'
import {
  Modal,
  Badge,
  StatusBadge,
  CategoryBadge,
  Select,
  ParkSelect
} from '@/components/ui'
import {
  getAllActivityTypes,
  getAllPriorities,
  getParkOptions,
  getActivityTypeOptions,
  getPriorityOptions,
  getActivityTypeById,
  getPriorityById,
  type ActivityType,
  type Priority
} from '@/config'

interface Activity {
  id: string
  time: string
  title: string
  location: string
  type: 'ride' | 'dining' | 'show' | 'character' | 'shopping' | 'break' | 'other'
  notes?: string
  priority: 'low' | 'medium' | 'high'
}

interface DayPlan {
  id: string
  date: string
  park: string
  activities: Activity[]
}

// Get configuration data
const activityTypes = getAllActivityTypes()
const priorities = getAllPriorities()
const parkOptions = getParkOptions()

export default function TripPlanner() {
  const [days, setDays] = useState<DayPlan[]>([])
  const [editingActivity, setEditingActivity] = useState<{dayId: string, activity: Activity} | null>(null)
  const [showAddDay, setShowAddDay] = useState(false)
  const [newDayForm, setNewDayForm] = useState({ date: '', park: '' })

  const addNewDay = () => {
    if (newDayForm.date && newDayForm.park) {
      const newDay: DayPlan = {
        id: Date.now().toString(),
        date: newDayForm.date,
        park: newDayForm.park,
        activities: []
      }
      setDays([...days, newDay])
      setNewDayForm({ date: '', park: '' })
      setShowAddDay(false)
    }
  }

  const addActivity = (dayId: string) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      time: '09:00',
      title: 'New Activity',
      location: '',
      type: 'ride',
      priority: 'medium',
      notes: ''
    }

    setDays(days.map(day =>
      day.id === dayId
        ? { ...day, activities: [...day.activities, newActivity] }
        : day
    ))

    setEditingActivity({ dayId, activity: newActivity })
  }

  const updateActivity = (dayId: string, activityId: string, updates: Partial<Activity>) => {
    setDays(days.map(day =>
      day.id === dayId
        ? {
            ...day,
            activities: day.activities.map(activity =>
              activity.id === activityId ? { ...activity, ...updates } : activity
            )
          }
        : day
    ))
  }

  const deleteActivity = (dayId: string, activityId: string) => {
    setDays(days.map(day =>
      day.id === dayId
        ? { ...day, activities: day.activities.filter(a => a.id !== activityId) }
        : day
    ))
  }

  const deleteDay = (dayId: string) => {
    setDays(days.filter(day => day.id !== dayId))
  }

  const getActivityTypeInfo = (type: string) => {
    return getActivityTypeById(type) || activityTypes[0]
  }

  const getPriorityInfo = (priority: Activity['priority']) => {
    return getPriorityById(priority) || priorities[0]
  }

  const getPriorityVariant = (priority: Activity['priority']) => {
    const priorityInfo = getPriorityInfo(priority)
    return priorityInfo.badgeVariant as any
  }

  const getActivityTypeVariant = (type: Activity['type']) => {
    switch (type) {
      case 'ride': return 'info'
      case 'dining': return 'success'
      case 'show': return 'disney'
      case 'character': return 'premium'
      case 'shopping': return 'warning'
      case 'break': return 'default'
      case 'other': return 'default'
      default: return 'default'
    }
  }

  const activityTypeOptions = getActivityTypeOptions()
  const prioritySelectOptions = getPriorityOptions()

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4 gradient-text">Disney Trip Planner</h2>
        <p className="text-gray-600 mb-6">
          Plan your perfect Disney days with detailed itineraries, dining reservations, and attraction priorities.
        </p>

        <button
          onClick={() => setShowAddDay(true)}
          className="btn-disney flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Day
        </button>
      </div>

      {/* Add Day Modal */}
      <Modal
        isOpen={showAddDay}
        onClose={() => setShowAddDay(false)}
        title="Add New Day"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={newDayForm.date}
              onChange={(e) => setNewDayForm({...newDayForm, date: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Park</label>
            <Select
              value={newDayForm.park}
              onValueChange={(value) => setNewDayForm({...newDayForm, park: value})}
              options={parkOptions}
              placeholder="Select a park"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={addNewDay} className="btn-disney flex-1">
            Add Day
          </button>
          <button
            onClick={() => setShowAddDay(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </Modal>

      {/* Days List */}
      {days.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-white rounded-xl shadow-lg"
        >
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No days planned yet</h3>
          <p className="text-gray-500 mb-6">Start by adding your first Disney day!</p>
          <button
            onClick={() => setShowAddDay(true)}
            className="btn-disney"
          >
            Add Your First Day
          </button>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {days.map((day, index) => (
            <motion.div
              key={day.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
              {/* Day Header */}
              <div className="bg-gradient-to-r from-disney-blue to-disney-purple p-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      Day {index + 1}: {new Date(day.date).toLocaleDateString('en-GB', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                    <p className="text-lg opacity-90 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      {day.park}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteDay(day.id)}
                    className="text-white hover:text-red-200 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Activities */}
              <div className="p-6">
                {day.activities.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No activities planned for this day</p>
                    <button
                      onClick={() => addActivity(day.id)}
                      className="btn-disney"
                    >
                      Add First Activity
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-6">
                      {day.activities
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((activity) => (
                        <div
                          key={activity.id}
                          className={`p-4 rounded-lg border-2 ${getPriorityVariant(activity.priority)} transition-all hover:shadow-md`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-mono text-sm font-semibold bg-white px-2 py-1 rounded">
                                  {activity.time}
                                </span>
                                <Badge
                                  variant={getActivityTypeVariant(activity.type)}
                                  size="sm"
                                >
                                  {getActivityTypeInfo(activity.type).label}
                                </Badge>
                                <Badge
                                  variant={getPriorityVariant(activity.priority)}
                                  size="sm"
                                >
                                  {activity.priority} priority
                                </Badge>
                              </div>
                              <h4 className="font-semibold text-lg">{activity.title}</h4>
                              {activity.location && (
                                <p className="text-gray-600 text-sm flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {activity.location}
                                </p>
                              )}
                              {activity.notes && (
                                <p className="text-gray-600 text-sm mt-2">{activity.notes}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingActivity({ dayId: day.id, activity })}
                                className="text-gray-500 hover:text-disney-blue transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteActivity(day.id, activity.id)}
                                className="text-gray-500 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => addActivity(day.id)}
                      className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-disney-blue hover:text-disney-blue transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add Activity
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Activity Modal */}
      <Modal
        isOpen={!!editingActivity}
        onClose={() => setEditingActivity(null)}
        title="Edit Activity"
        size="md"
      >
        {editingActivity && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
              <input
                type="time"
                value={editingActivity.activity.time}
                onChange={(e) => updateActivity(editingActivity.dayId, editingActivity.activity.id, { time: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={editingActivity.activity.title}
                onChange={(e) => updateActivity(editingActivity.dayId, editingActivity.activity.id, { title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={editingActivity.activity.location}
                onChange={(e) => updateActivity(editingActivity.dayId, editingActivity.activity.id, { location: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue"
                placeholder="e.g., Fantasyland, Main Street USA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <Select
                value={editingActivity.activity.type}
                onValueChange={(value) => updateActivity(editingActivity.dayId, editingActivity.activity.id, { type: value as Activity['type'] })}
                options={activityTypeOptions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <Select
                value={editingActivity.activity.priority}
                onValueChange={(value) => updateActivity(editingActivity.dayId, editingActivity.activity.id, { priority: value as Activity['priority'] })}
                options={prioritySelectOptions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={editingActivity.activity.notes || ''}
                onChange={(e) => updateActivity(editingActivity.dayId, editingActivity.activity.id, { notes: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue"
                rows={3}
                placeholder="Additional notes, dining reservations, etc."
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setEditingActivity(null)}
            className="btn-disney flex-1"
          >
            Save Changes
          </button>
          <button
            onClick={() => setEditingActivity(null)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  )
}