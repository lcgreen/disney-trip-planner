'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, MapPin, Plus, Star, Trash2, Edit, Save, FolderOpen, Download, Upload } from 'lucide-react'
import {
  Modal,
  Badge,
  StatusBadge,
  CategoryBadge,
  Select,
  ParkSelect,
  Button
} from '@/components/ui'
import {
  getAllActivityTypes,
  getAllPriorities,
  getParkOptions,
  getActivityTypeOptions,
  getPriorityOptions,
  getActivityTypeById,
  getPriorityById,
  getParkById
} from '@/config'
import {
  tripPlanStorage,
  storageUtils,
  type StoredTripPlan
} from '@/lib/storage'
import { WidgetConfigManager } from '@/lib/widgetConfig'

// Remove local Activity and DayPlan types, use storage types only

interface TripPlannerProps {
  createdItemId?: string | null
  widgetId?: string | null
  isEditMode?: boolean
  name?: string
  onNameChange?: (name: string) => void
  onSave?: (data: Partial<StoredTripPlan>) => void
  onLoad?: (plan: StoredTripPlan) => void
  onNew?: () => void
  savedPlans?: StoredTripPlan[]
  activePlan?: StoredTripPlan | null
  setCanSave?: (canSave: boolean) => void
}

export default function TripPlanner({
  createdItemId = null,
  widgetId = null,
  isEditMode = false,
  name = '',
  onNameChange,
  onSave,
  onLoad,
  onNew,
  savedPlans = [],
  activePlan = null,
  setCanSave
}: TripPlannerProps) {
  // Config data for UI
  const activityTypes = getAllActivityTypes();
  const priorities = getAllPriorities();
  const parkOptions = getParkOptions();

  // Use storage types for all state that interacts with parent/page
  const [days, setDays] = useState<StoredTripPlan['days']>([])
  const [editingActivity, setEditingActivity] = useState<{dayId: string, activity: StoredTripPlan['days'][number]['activities'][number]} | null>(null)
  const [editFormData, setEditFormData] = useState<StoredTripPlan['days'][number]['activities'][number] | null>(null)
  const [showAddDay, setShowAddDay] = useState(false)
  const [newDayForm, setNewDayForm] = useState({ date: '', park: '' })
  const [formErrors, setFormErrors] = useState({ date: '', park: '' })

  // Local storage state
  const [currentPlanName, setCurrentPlanName] = useState<string>('')
  const [activePlanId, setActivePlanId] = useState<string | null>(null)
  const [showSavePlan, setShowSavePlan] = useState(false)
  const [showLoadPlan, setShowLoadPlan] = useState(false)
  const [planToSave, setPlanToSave] = useState<string>('')

  // Load saved plans on component mount
  useEffect(() => {
    const storage = storageUtils.initializeTripPlanStorage()

    // Only load active plan if we're in edit mode
    // This prevents new plans from inheriting existing data
    if (isEditMode && storage.activePlanId) {
      const activePlan = storage.plans.find(plan => plan.id === storage.activePlanId)
      if (activePlan) {
        loadPlan(activePlan)
      }
    }
  }, [isEditMode])

  // Auto-save current plan when days change (if we have an active plan)
  useEffect(() => {
    if (activePlanId && currentPlanName && days.length > 0) {
      saveCurrentPlan(false) // Silent save without showing modal
    }
  }, [days, activePlanId, currentPlanName])

  // Auto-save current state for widgets (only when editing or when we have a valid plan)
  useEffect(() => {
    if ((isEditMode || createdItemId) && days.length > 0) {
      WidgetConfigManager.saveCurrentTripPlanState(days)
    }
  }, [days, isEditMode, createdItemId])

  // Load created item in edit mode
  useEffect(() => {
    if (isEditMode && createdItemId) {
      const tripPlan = WidgetConfigManager.getSelectedItemData('planner', createdItemId) as StoredTripPlan
      if (tripPlan) {
        setDays(tripPlan.days)
        setCurrentPlanName(tripPlan.name)
        setActivePlanId(tripPlan.id)
        setPlanToSave(tripPlan.name)
      }
    }
  }, [isEditMode, createdItemId])

  const addNewDay = () => {
    // Clear previous errors
    setFormErrors({ date: '', park: '' })

    // Validation
    const errors = { date: '', park: '' }
    if (!newDayForm.date) {
      errors.date = 'Please select a date'
    }
    if (!newDayForm.park) {
      errors.park = 'Please select a park'
    }

    // Check if date already exists
    const dateExists = days.some(day => day.date === newDayForm.date)
    if (dateExists) {
      errors.date = 'You already have a plan for this date'
    }

    if (errors.date || errors.park) {
      setFormErrors(errors)
      return
    }

    // Create new day
    const newDay: StoredTripPlan['days'][number] = {
      id: Date.now().toString(),
      date: newDayForm.date,
      park: newDayForm.park,
      activities: []
    }

    setDays([...days, newDay])
    setNewDayForm({ date: '', park: '' })
    setFormErrors({ date: '', park: '' })
    setShowAddDay(false)
  }

  const addActivity = (dayId: string) => {
    const newActivity: StoredTripPlan['days'][number]['activities'][number] = {
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
    setEditFormData({ ...newActivity })
  }

  const updateActivity = (dayId: string, activityId: string, updates: Partial<StoredTripPlan['days'][number]['activities'][number]>) => {
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

  const handleSaveActivityChanges = () => {
    if (editingActivity && editFormData) {
      updateActivity(editingActivity.dayId, editingActivity.activity.id, editFormData)
      setEditingActivity(null)
      setEditFormData(null)
    }
  }

  const handleCancelActivityEdit = () => {
    setEditingActivity(null)
    setEditFormData(null)
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

  const getPriorityInfo = (priority: StoredTripPlan['days'][number]['activities'][number]['priority']) => {
    return getPriorityById(priority) || priorities[0]
  }

  const getPriorityVariant = (priority: StoredTripPlan['days'][number]['activities'][number]['priority']) => {
    const priorityInfo = getPriorityInfo(priority)
    return priorityInfo.badgeVariant as any
  }

  // Storage functions
  const saveCurrentPlan = (showModal: boolean = true) => {
    if (!planToSave.trim() && showModal) {
      setShowSavePlan(true)
      return
    }

    const planName = showModal ? planToSave.trim() : currentPlanName
    if (!planName) return

    const planData: StoredTripPlan = {
      id: activePlanId || storageUtils.generateId(),
      name: planName,
      days: days.map(day => ({
        id: day.id,
        date: day.date,
        park: day.park,
        activities: day.activities.map(activity => ({
          id: activity.id,
          time: activity.time,
          title: activity.title,
          location: activity.location,
          type: activity.type,
          notes: activity.notes,
          priority: activity.priority
        }))
      })),
      createdAt: activePlanId ? savedPlans.find(p => p.id === activePlanId)?.createdAt || storageUtils.getCurrentTimestamp() : storageUtils.getCurrentTimestamp(),
      updatedAt: storageUtils.getCurrentTimestamp()
    }

    tripPlanStorage.update(storage => {
      const plans = storage?.plans || []
      const existingIndex = plans.findIndex(plan => plan.id === planData.id)

      if (existingIndex >= 0) {
        plans[existingIndex] = planData
      } else {
        plans.push(planData)
      }

      return {
        plans,
        activePlanId: planData.id
      }
    })

    // Update local state
    setActivePlanId(planData.id)
    setCurrentPlanName(planData.name)

    if (showModal) {
      setPlanToSave('')
      setShowSavePlan(false)

      // Check for pending widget links and auto-link if needed
      WidgetConfigManager.checkAndApplyPendingLinks(planData.id, 'planner')
    }
  }

  const loadPlan = (plan: StoredTripPlan) => {
    setDays(plan.days.map(day => ({
      id: day.id,
      date: day.date,
      park: day.park,
      activities: day.activities.map(activity => ({
        id: activity.id,
        time: activity.time,
        title: activity.title,
        location: activity.location,
        type: activity.type as StoredTripPlan['days'][number]['activities'][number]['type'],
        notes: activity.notes,
        priority: activity.priority as StoredTripPlan['days'][number]['activities'][number]['priority']
      }))
    })))

    setActivePlanId(plan.id)
    setCurrentPlanName(plan.name)
    setShowLoadPlan(false)

    // Update active plan in storage
    tripPlanStorage.update(storage => ({
      ...storage,
      plans: storage?.plans || [],
      activePlanId: plan.id
    }))
  }

  const deletePlan = (planId: string) => {
    tripPlanStorage.update(storage => {
      const plans = storage?.plans?.filter(plan => plan.id !== planId) || []
      const activePlanId = storage?.activePlanId === planId ? undefined : storage?.activePlanId

      return { plans, activePlanId }
    })

    if (activePlanId === planId) {
      setActivePlanId(null)
      setCurrentPlanName('')
      setDays([])
    }

    // Clean up widget configurations that reference this deleted item
    WidgetConfigManager.cleanupDeletedItemReferences(planId, 'planner')
  }

  const startNewPlan = () => {
    setDays([])
    setActivePlanId(null)
    setCurrentPlanName('')

    tripPlanStorage.update(storage => ({
      ...storage,
      plans: storage?.plans || [],
      activePlanId: undefined
    }))
  }

  const getActivityTypeVariant = (type: StoredTripPlan['days'][number]['activities'][number]['type']) => {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 gradient-text"
          >
            Disney Trip Planner
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-gray-600 mb-8"
          >
            Plan your perfect Disney days with detailed itineraries, dining reservations, and attraction priorities.
          </motion.p>



          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => setShowAddDay(true)}
            className="btn-disney flex items-center gap-2 transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Add New Day
          </motion.button>
        </div>

        {/* Add Day Modal */}
        <Modal
          isOpen={showAddDay}
          onClose={() => {
            setShowAddDay(false)
            setNewDayForm({ date: '', park: '' })
            setFormErrors({ date: '', park: '' })
          }}
          title="Add New Day"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={newDayForm.date}
                onChange={(e) => {
                  setNewDayForm({...newDayForm, date: e.target.value})
                  if (formErrors.date) {
                    setFormErrors({...formErrors, date: ''})
                  }
                }}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-disney-blue ${
                  formErrors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.date && (
                <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Park</label>
              <Select
                value={newDayForm.park}
                onValueChange={(value) => {
                  setNewDayForm({...newDayForm, park: value})
                  if (formErrors.park) {
                    setFormErrors({...formErrors, park: ''})
                  }
                }}
                options={parkOptions}
                placeholder="Select a park"
                className="w-full"
                error={formErrors.park}
              />
              {formErrors.park && (
                <p className="text-red-500 text-sm mt-1">{formErrors.park}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={addNewDay}
              className="btn-disney flex-1"
              disabled={!newDayForm.date || !newDayForm.park}
            >
              Add Day
            </button>
            <button
              onClick={() => {
                setShowAddDay(false)
                setNewDayForm({ date: '', park: '' })
                setFormErrors({ date: '', park: '' })
              }}
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
            transition={{ delay: 0.4 }}
            className="text-center py-16 bg-white rounded-2xl shadow-xl border border-gray-100"
          >
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl md:text-3xl font-semibold text-gray-600 mb-4">No days planned yet</h3>
            <p className="text-lg text-gray-500 mb-8">Start by adding your first Disney day!</p>
            <button
              onClick={() => setShowAddDay(true)}
              className="btn-disney transform hover:scale-105 transition-all duration-200"
            >
              Add Your First Day
            </button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            <AnimatePresence>
              {days.map((day, index) => (
                <motion.div
                  key={day.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100"
                >
                  {/* Day Header */}
                  <div className="bg-gradient-to-r from-disney-blue to-disney-purple p-6 md:p-8 text-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
                          Day {index + 1}: {new Date(day.date).toLocaleDateString('en-GB', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h3>
                        <p className="text-lg md:text-xl opacity-90 flex items-center gap-2">
                          <MapPin className="w-5 h-5 md:w-6 md:h-6" />
                          {getParkById(day.park)?.name || day.park}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteDay(day.id)}
                        className="text-white hover:text-red-200 transition-colors p-2 rounded-lg hover:bg-white/10"
                      >
                        <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
                      </button>
                    </div>
                  </div>

                  {/* Activities */}
                  <div className="p-6 md:p-8">
                    {day.activities.length === 0 ? (
                      <div className="text-center py-12">
                        <Clock className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg text-gray-500 mb-6">No activities planned for this day</p>
                        <button
                          onClick={() => addActivity(day.id)}
                          className="btn-disney transform hover:scale-105 transition-all duration-200"
                        >
                          Add First Activity
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4 mb-8">
                          {day.activities
                            .sort((a, b) => a.time.localeCompare(b.time))
                            .map((activity, activityIndex) => (
                            <motion.div
                              key={activity.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.5 + index * 0.1 + activityIndex * 0.05 }}
                              className={`p-4 md:p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg ${getPriorityVariant(activity.priority)}`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <span className="font-mono text-sm md:text-base font-semibold bg-white px-3 py-1 rounded-lg shadow-sm">
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
                                  <h4 className="font-semibold text-lg md:text-xl mb-2">{activity.title}</h4>
                                  {activity.location && (
                                    <p className="text-gray-600 text-sm md:text-base flex items-center gap-2 mb-2">
                                      <MapPin className="w-4 h-4" />
                                      {activity.location}
                                    </p>
                                  )}
                                  {activity.notes && (
                                    <p className="text-gray-600 text-sm md:text-base mt-2">{activity.notes}</p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingActivity({ dayId: day.id, activity })
                                      setEditFormData({ ...activity })
                                    }}
                                    className="text-gray-500 hover:text-disney-blue transition-colors p-2 rounded-lg hover:bg-blue-50"
                                  >
                                    <Edit className="w-4 h-4 md:w-5 md:h-5" />
                                  </button>
                                  <button
                                    onClick={() => deleteActivity(day.id, activity.id)}
                                    className="text-gray-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        <button
                          onClick={() => addActivity(day.id)}
                          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-disney-blue hover:text-disney-blue hover:bg-blue-50/50 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5" />
                          Add Activity
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Edit Activity Modal */}
        <Modal
          isOpen={!!editingActivity}
          onClose={handleCancelActivityEdit}
          title="Edit Activity"
          size="md"
        >
          {(() => {
            return editFormData && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={editFormData.time}
                    onChange={(e) => setEditFormData({ ...editFormData, time: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue"
                    placeholder="e.g., Fantasyland, Main Street USA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <Select
                    value={editFormData.type}
                    onValueChange={(value) => setEditFormData({ ...editFormData, type: value as StoredTripPlan['days'][number]['activities'][number]['type'] })}
                    options={activityTypeOptions}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <Select
                    value={editFormData.priority}
                    onValueChange={(value) => setEditFormData({ ...editFormData, priority: value as StoredTripPlan['days'][number]['activities'][number]['priority'] })}
                    options={prioritySelectOptions}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={editFormData.notes || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue"
                    rows={3}
                    placeholder="Additional notes, dining reservations, etc."
                  />
                </div>
              </div>
            )
          })()}

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSaveActivityChanges}
              className="btn-disney flex-1"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancelActivityEdit}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </Modal>


      </div>
    </div>
  )
}