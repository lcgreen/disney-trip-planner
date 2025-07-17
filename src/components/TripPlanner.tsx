'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, MapPin, Plus, Star, Trash2, Edit, Save, FolderOpen, Download, Upload } from 'lucide-react'
import {
  Modal,
  Badge,
  StatusBadge,
  CategoryBadge,
  Select,
  ParkSelect,
  Button,
  AutoSaveIndicator
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
import { WidgetConfigManager } from '@/lib/widgetConfig'
import { usePlannerAutoSave } from '@/hooks/useReduxAutoSave'
import { useReduxUser } from '@/hooks/useReduxUser'
import { useEditableName } from '@/hooks/useEditableName'
import { PlannerData } from '@/types'
import { useReduxPlanner } from '@/hooks/useReduxPlanner'

interface TripPlannerProps {
  createdItemId?: string | null
  widgetId?: string | null
  isEditMode?: boolean
  name?: string
  onNameChange?: (name: string) => void
  onSave?: (data: Partial<PlannerData>) => void
  onLoad?: (plan: PlannerData) => void
  onNew?: () => void
  savedPlans?: PlannerData[]
  activePlan?: PlannerData | null
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
  const { userLevel, upgradeToPremium } = useReduxUser()

  // Editable name functionality
  const {
    isEditingName,
    editedName,
    handleNameEdit,
    handleNameChange,
    handleNameBlur,
    handleNameKeyDown
  } = useEditableName({ name, onNameChange })

  // Get Redux planner state and actions
  const {
    days,
    currentName,
    showAddDay,
    showAddPlan,
    editingPlan,
    newDay,
    newPlan,
    selectedDayId,
    formErrors,
    stats,
    setCurrentName,
    setShowAddDay,
    setShowAddPlan,
    setEditingPlan,
    setNewDay,
    setNewPlan,
    setSelectedDayId,
    setFormErrors,
    addNewDay,
    deleteDay,
    addPlan,
    updatePlan,
    deletePlan,
    loadPlannerData
  } = useReduxPlanner()

  // Update currentName when name prop changes
  useEffect(() => {
    setCurrentName(name)
  }, [name, setCurrentName])

  // Load initial data
  useEffect(() => {
    console.log('[TripPlanner] Loading from activePlan:', { isEditMode, activePlan })
    if (isEditMode && activePlan) {
      console.log('[TripPlanner] Setting days from activePlan:', activePlan.days)
      loadPlannerData(activePlan)
    }
  }, [isEditMode, activePlan, loadPlannerData])

  // Load created item in edit mode
  useEffect(() => {
    console.log('[TripPlanner] Loading from createdItemId:', { isEditMode, createdItemId })
    if (isEditMode && createdItemId) {
      const tripPlan = WidgetConfigManager.getSelectedItemData('planner', createdItemId) as PlannerData
      console.log('[TripPlanner] Found trip plan from WidgetConfigManager:', tripPlan)
      if (tripPlan) {
        console.log('[TripPlanner] Setting days from WidgetConfigManager:', tripPlan.days)
        loadPlannerData(tripPlan)
        onNameChange?.(tripPlan.name)
      }
    }
  }, [isEditMode, createdItemId, onNameChange, loadPlannerData])

  // Update parent when data changes
  useEffect(() => {
    if (onSave) {
      onSave({
        days
      })
    }
    const hasPlans = days.some(day => day.plans.length > 0)
    setCanSave?.(hasPlans && currentName.trim().length > 0)
  }, [days, currentName, onSave, setCanSave])

  // Auto-save functionality for widget editing
  const autoSaveData = widgetId && isEditMode ? {
    id: createdItemId || activePlan?.id || Date.now().toString(),
    name: currentName || 'New Trip Plan',
    days,
    createdAt: activePlan?.createdAt || new Date().toISOString()
  } : null

  // Debug logging for auto-save data
  useEffect(() => {
    if (widgetId && isEditMode) {
      console.log('[AutoSave Data] Current auto-save data:', autoSaveData)
    }
  }, [autoSaveData, widgetId, isEditMode])

  const { forceSave, isSaving, lastSaved, error } = usePlannerAutoSave(
    autoSaveData,
    {
      enabled: !!autoSaveData,
      delay: 1000, // 1 second delay
      widgetId: widgetId || undefined,
      onSave: () => {
        console.log('[AutoSave] Successfully auto-saved trip plan changes')
      },
      onError: (error: Error) => {
        console.error('[AutoSave] Auto-save failed:', error)
      }
    }
  )

  // Debug logging for auto-save conditions
  useEffect(() => {
    console.log('[AutoSave Debug] Conditions:', {
      widgetId,
      isEditMode,
      hasActivePlan: !!activePlan,
      hasAutoSaveData: !!autoSaveData,
      autoSaveEnabled: !!autoSaveData,
      autoSaveData: autoSaveData,
      daysLength: days.length,
      currentName
    })
  }, [widgetId, isEditMode, activePlan, autoSaveData, days.length, currentName])

  const parkOptions = getParkOptions()
  const activityTypeOptions = getActivityTypeOptions()
  const priorityOptions = getPriorityOptions()

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
            className="text-lg md:text-xl text-gray-600 mb-4"
          >
            Plan your magical Disney adventure day by day with our comprehensive trip planner!
          </motion.p>

          {/* Editable name for widget editing */}
          {widgetId && isEditMode && (
            <div className="flex justify-center mb-4">
              {isEditingName ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={handleNameChange}
                  onBlur={handleNameBlur}
                  onKeyDown={handleNameKeyDown}
                  placeholder="Enter trip plan name..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue focus:border-disney-blue text-center text-lg font-medium"
                  style={{ minWidth: '300px' }}
                  autoFocus
                />
              ) : (
                <button
                  onClick={handleNameEdit}
                  className="px-4 py-2 text-center text-lg font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  style={{ minWidth: '300px' }}
                >
                  {name || 'Click to enter trip plan name...'}
                </button>
              )}
            </div>
          )}

          {/* Auto-save indicator for widget editing */}
          {widgetId && isEditMode && (
            <div className="flex justify-center mb-4 gap-4">
              <AutoSaveIndicator
                isSaving={isSaving}
                lastSaved={lastSaved}
                error={error}
                className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm"
              />
              <button
                onClick={() => {
                  console.log('[Manual Test] Force saving trip plan data:', autoSaveData)
                  forceSave()
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Test Save
              </button>
              {userLevel === 'anon' && (
                <button
                  onClick={() => {
                    console.log('[Debug] Upgrading user to premium')
                    upgradeToPremium()
                  }}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                  Upgrade to Premium
                </button>
              )}
              <div className="text-xs text-gray-500">
                User Level: {userLevel}
              </div>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Days</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalDays}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Plans</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalPlans}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Parks</p>
                <p className="text-2xl font-bold text-gray-800">{stats.parksCount}</p>
              </div>
              <MapPin className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          <button
            onClick={() => setShowAddDay(true)}
            className="btn-disney flex items-center gap-2 transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Add Day
          </button>
        </motion.div>

        {/* Trip Days */}
        <div className="space-y-6">
          <AnimatePresence>
            {days.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl md:text-2xl font-semibold text-gray-600 mb-4">No days planned yet</h3>
                <p className="text-lg text-gray-500 mb-8">Start planning your magical Disney adventure!</p>
                <button
                  onClick={() => setShowAddDay(true)}
                  className="btn-disney transform hover:scale-105 transition-all duration-200"
                >
                  Add Your First Day
                </button>
              </motion.div>
            ) : (
              days.map((day, index) => (
                <motion.div
                  key={day.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl md:text-2xl font-semibold">
                          {new Date(day.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h3>
                        <p className="text-blue-100 mt-2">
                          {day.plans.length} plan{day.plans.length !== 1 ? 's' : ''} scheduled
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedDayId(day.id)
                            setShowAddPlan(true)
                          }}
                          className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Plan
                        </button>
                        <button
                          onClick={() => deleteDay(day.id)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-white p-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {day.plans.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No plans for this day yet</p>
                        <button
                          onClick={() => {
                            setSelectedDayId(day.id)
                            setShowAddPlan(true)
                          }}
                          className="btn-disney"
                        >
                          Add First Plan
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {day.plans
                          .sort((a, b) => a.time.localeCompare(b.time))
                          .map((plan, planIndex) => (
                            <motion.div
                              key={plan.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: planIndex * 0.05 }}
                              className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex-shrink-0">
                                <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
                                  <span className="text-white font-semibold text-sm">
                                    {plan.time}
                                  </span>
                                </div>
                              </div>

                              <div className="flex-1">
                                <h4 className="font-semibold text-lg text-gray-800">{plan.activity}</h4>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="secondary" size="sm">
                                    {getParkById(plan.park)?.name || plan.park}
                                  </Badge>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setEditingPlan(plan)}
                                  className="text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deletePlan(plan.id)}
                                  className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Add Day Modal */}
        <Modal
          isOpen={showAddDay}
          onClose={() => {
            setShowAddDay(false)
            setNewDay({ date: '', park: 'magic-kingdom' })
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
                value={newDay.date}
                onChange={(e) => setNewDay({...newDay, date: e.target.value})}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-disney-blue ${
                  formErrors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.date && (
                <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={addNewDay} className="btn-disney flex-1">
              Add Day
            </button>
            <button
              onClick={() => {
                setShowAddDay(false)
                setNewDay({ date: '', park: 'magic-kingdom' })
                setFormErrors({ date: '', park: '' })
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </Modal>

        {/* Add Plan Modal */}
        <Modal
          isOpen={showAddPlan}
          onClose={() => {
            setShowAddPlan(false)
            setNewPlan({ time: '', activity: '', park: 'magic-kingdom' })
            setSelectedDayId(null)
          }}
          title="Add New Plan"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
              <input
                type="time"
                value={newPlan.time}
                onChange={(e) => setNewPlan({...newPlan, time: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Activity</label>
              <input
                type="text"
                value={newPlan.activity}
                onChange={(e) => setNewPlan({...newPlan, activity: e.target.value})}
                placeholder="e.g., Ride Space Mountain, Character Meet & Greet"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Park</label>
              <ParkSelect
                value={newPlan.park}
                onValueChange={(value) => setNewPlan({...newPlan, park: value})}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={addPlan} className="btn-disney flex-1">
              Add Plan
            </button>
            <button
              onClick={() => {
                setShowAddPlan(false)
                setNewPlan({ time: '', activity: '', park: 'magic-kingdom' })
                setSelectedDayId(null)
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </Modal>

        {/* Edit Plan Modal */}
        <Modal
          isOpen={!!editingPlan}
          onClose={() => setEditingPlan(null)}
          title="Edit Plan"
          size="md"
        >
          {editingPlan && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="time"
                  value={editingPlan.time}
                  onChange={(e) => setEditingPlan({...editingPlan, time: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activity</label>
                <input
                  type="text"
                  value={editingPlan.activity}
                  onChange={(e) => setEditingPlan({...editingPlan, activity: e.target.value})}
                  placeholder="e.g., Ride Space Mountain, Character Meet & Greet"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-disney-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Park</label>
                <ParkSelect
                  value={editingPlan.park}
                  onValueChange={(value) => setEditingPlan({...editingPlan, park: value})}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                if (editingPlan) {
                  updatePlan(editingPlan.id, editingPlan)
                  setEditingPlan(null)
                }
              }}
              className="btn-disney flex-1"
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditingPlan(null)}
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