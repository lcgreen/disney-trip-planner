'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Layout, Settings, Sparkles, GripVertical, Trash2, Clock, Calendar, DollarSign, Luggage, Crown, Star, Shield } from 'lucide-react'
import { clearInvalidCountdownData, validateAndCleanCountdownData, inspectLocalStorageData } from '@/lib/clearInvalidData'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DragOverlay } from '@dnd-kit/core'
import { PluginRegistry, type PluginWidget, PluginStorage } from '@/lib/pluginSystem'
import { useUser } from '@/hooks/useUser'
import { hasFeatureAccess, userManager, FEATURES, type FeatureAccess } from '@/lib/userManagement'
import '@/plugins' // Import all plugins to register them

// Get widget components from plugins
const getWidgetComponents = () => {
  const components: Record<string, React.ComponentType<any>> = {}
  const plugins = PluginRegistry.getAllPlugins()

  console.log('Available plugins:', plugins.map(p => p.config.widgetType))

  plugins.forEach(plugin => {
    const component = plugin.getWidgetComponent()
    console.log(`Plugin ${plugin.config.widgetType}:`, !!component)
    components[plugin.config.widgetType] = component
  })

  console.log('Final components:', Object.keys(components))
  return components
}

const getWidgetOptions = (hasFeatureAccess: (feature: string) => boolean, userLevel: string) => {
  return PluginRegistry.getAllPlugins()
    .filter(plugin => {
      // Admin users only see admin features, not regular user widgets
      if (userLevel === 'admin') {
        return false // Admin users don't see regular widgets
      }

      // Check if user has access to this plugin based on required level
      if (plugin.config.requiredLevel === 'premium') {
        return hasFeatureAccess('tripPlanner') // Use tripPlanner as proxy for premium access
      }
      if (plugin.config.requiredLevel === 'standard') {
        return hasFeatureAccess('saveData') // Use saveData as proxy for standard access
      }
      return true // anon level is always accessible
    })
    .map(plugin => ({
      type: plugin.config.widgetType,
      name: plugin.config.name,
      description: plugin.config.description,
      icon: plugin.config.icon,
      color: plugin.config.color,
      isPremium: plugin.config.requiredLevel === 'premium',
      requiredLevel: plugin.config.requiredLevel
    }))
}

// Helper function to get icon component
const getIconComponent = (iconName: string) => {
  const icons: Record<string, React.ComponentType<any>> = {
    Clock,
    Calendar,
    DollarSign,
    Luggage
  }
  return icons[iconName] || Clock
}

// Sortable Widget Wrapper Component
function SortableWidget({
  widget,
  onRemove,
  onSettings,
  onWidthChange,
  onItemSelect
}: {
  widget: PluginWidget
  onRemove: (id: string) => void
  onSettings: (id: string) => void
  onWidthChange: (id: string, width: string) => void
  onItemSelect: (id: string, itemId: string | null) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Helper function to get grid classes based on widget width
  const getGridClasses = (width?: string) => {
    if (width) {
      const widthOptions = [
        { value: '1', class: 'col-span-1' },
        { value: '2', class: 'col-span-1 md:col-span-2' },
        { value: '3', class: 'col-span-1 md:col-span-2 xl:col-span-3' },
        { value: '4', class: 'col-span-1 md:col-span-2 xl:col-span-4' }
      ]
      return widthOptions.find(w => w.value === width)?.class || 'col-span-1'
    }
    return 'col-span-1'
  }

  const widgetComponents = getWidgetComponents()
  const WidgetComponent = widgetComponents[widget.type]

  // Debug logging
  console.log('Widget type:', widget.type)
  console.log('Available widget components:', Object.keys(widgetComponents))
  console.log('WidgetComponent found:', !!WidgetComponent)

  // Handle missing widget component
  if (!WidgetComponent) {
    console.error(`Widget component not found for type: ${widget.type}`)
    return (
      <motion.div
        ref={setNodeRef}
        style={style}
        className={`${getGridClasses(widget.width)} relative group ${isDragging ? 'opacity-30' : ''}`}
      >
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">
            Widget component not found: {widget.type}
          </p>
          <button
            onClick={() => onRemove(widget.id)}
            className="mt-2 text-xs text-red-500 hover:text-red-700"
          >
            Remove Widget
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`${getGridClasses(widget.width)} relative group ${isDragging ? 'opacity-30' : ''}`}
    >
      <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          {...attributes}
          {...listeners}
          className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:bg-white hover:shadow-lg cursor-grab active:cursor-grabbing transition-all duration-200"
        >
          <GripVertical className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <WidgetComponent
        id={widget.id}
        width={widget.width}
        onRemove={() => onRemove(widget.id)}
        onSettings={() => onSettings(widget.id)}
        onWidthChange={(width: string) => onWidthChange(widget.id, width)}
        onItemSelect={(itemId: string | null) => onItemSelect(widget.id, itemId)}
      />
    </motion.div>
  )
}

export default function DashboardPage() {
  const { userLevel, hasFeatureAccess: checkFeatureAccess } = useUser()
  const [widgets, setWidgets] = useState<PluginWidget[]>([])
  const [isAddingWidget, setIsAddingWidget] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

    useEffect(() => {
    // Debug plugin registration
    console.log('Dashboard loading - checking plugins...')
    const plugins = PluginRegistry.getAllPlugins()
    console.log('Registered plugins:', plugins.map(p => ({ id: p.config.id, widgetType: p.config.widgetType })))

    // Load widget configs from storage
    const savedWidgets = PluginStorage.getData<PluginWidget[]>('disney-widget-configs', [])
    console.log('Saved widgets:', savedWidgets)

    // Filter out invalid widgets (widgets with types that don't exist)
    const validWidgetTypes = plugins.map(p => p.config.widgetType)
    const validWidgets = savedWidgets.filter(widget => {
      const isValid = validWidgetTypes.includes(widget.type)
      if (!isValid) {
        console.warn(`Removing invalid widget with type: ${widget.type}`)
      }
      return isValid
    })

    if (validWidgets.length !== savedWidgets.length) {
      console.log(`Filtered out ${savedWidgets.length - validWidgets.length} invalid widgets`)
      // Save the filtered widgets back to storage
      PluginStorage.saveData('disney-widget-configs', validWidgets).catch(console.error)
    }

    setWidgets(validWidgets)
  }, [])

  const addWidget = (type: string) => {
    const plugin = PluginRegistry.getAllPlugins().find(p => p.config.widgetType === type)
    if (!plugin) return

    const newWidget = plugin.createWidget(`${type}-${Date.now()}`)
    newWidget.order = widgets.length

    const updatedWidgets = [...widgets, newWidget]
    setWidgets(updatedWidgets)
    PluginStorage.saveData('disney-widget-configs', updatedWidgets).catch(console.error)
    setIsAddingWidget(false)
  }

  const removeWidget = (id: string) => {
    const updatedWidgets = widgets.filter(w => w.id !== id)
    const reordered = updatedWidgets.map((widget, index) => ({
      ...widget,
      order: index
    }))
    setWidgets(reordered)
    PluginStorage.saveData('disney-widget-configs', reordered).catch(console.error)
  }

  const handleWidthChange = (id: string, width: string) => {
    const updatedWidgets = widgets.map(w => w.id === id ? { ...w, width } : w)
    setWidgets(updatedWidgets)
    PluginStorage.saveData('disney-widget-configs', updatedWidgets).catch(console.error)
  }

  const handleItemSelect = (id: string, itemId: string | null) => {
    const updatedWidgets = widgets.map(w => w.id === id ? { ...w, selectedItemId: itemId || undefined } : w)
    setWidgets(updatedWidgets)
    PluginStorage.saveData('disney-widget-configs', updatedWidgets).catch(console.error)
  }

  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (active.id !== over?.id) {
      const oldIndex = widgets.findIndex(w => w.id === active.id)
      const newIndex = widgets.findIndex(w => w.id === over?.id)

      const newOrder = arrayMove(widgets, oldIndex, newIndex)
      const reorderedWidgets = newOrder.map((widget, index) => ({
        ...widget,
        order: index
      }))

      setWidgets(reorderedWidgets)
      PluginStorage.saveData('disney-widget-configs', reorderedWidgets).catch(console.error)
    }
  }

  const widgetOptions = getWidgetOptions(checkFeatureAccess, userLevel)
  const widgetComponents = getWidgetComponents()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text flex items-center space-x-3">
                <Layout className="w-8 h-8 text-disney-blue" />
                <span>My Dashboard</span>
                {userLevel === 'anon' && (
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-normal">
                    Demo Mode
                  </span>
                )}
              </h1>
              <p className="text-gray-600 mt-2">
                {userLevel === 'anon'
                  ? 'Your personalized Disney planning command center (Demo Mode)'
                  : 'Your personalized Disney planning command center'
                }
              </p>
              {userLevel === 'anon' && (
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-blue-600 font-medium">Changes won&apos;t save in demo mode</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {process.env.NODE_ENV === 'development' && (
                <div className="relative group">
                  <button
                    className="bg-gray-500 text-white px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-600 transition-all duration-200 text-sm"
                    title="Debug menu"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Debug</span>
                  </button>
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="text-xs font-semibold text-gray-600 mb-2 px-2">Debug Tools</div>
                    <button
                      onClick={() => {
                        inspectLocalStorageData()
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 rounded text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      🔍 Inspect Data
                    </button>
                    <button
                      onClick={() => {
                        clearInvalidCountdownData()
                        validateAndCleanCountdownData()
                        window.location.reload()
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 rounded text-red-600 hover:text-red-700 transition-colors"
                    >
                      🗑️ Clear Invalid Data
                    </button>
                  </div>
                </div>
              )}
              {userLevel !== 'admin' && (
                <button
                  onClick={() => setIsAddingWidget(true)}
                  className="bg-gradient-to-r from-disney-blue to-disney-purple text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>{userLevel === 'anon' ? 'Try Widget' : 'Add Widget'}</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Admin Dashboard */}
        {userLevel === 'admin' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-red-800">Admin Dashboard</h2>
              </div>
              <p className="text-red-700 mb-4">
                Welcome to the admin dashboard. Here you can manage the application and access debug tools.
              </p>
            </div>

            {/* Admin Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(FEATURES)
                .filter((feature: FeatureAccess) => feature.level === 'admin')
                .map((feature: FeatureAccess) => (
                  <motion.div
                    key={feature.feature}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-800 capitalize">
                        {feature.feature.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                    <button className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm">
                      Access {feature.feature.replace(/([A-Z])/g, ' $1').trim()}
                    </button>
                  </motion.div>
                ))}
            </div>

            {/* Debug Tools Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Debug Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    inspectLocalStorageData()
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  🔍 Inspect Local Storage Data
                </button>
                <button
                  onClick={() => {
                    clearInvalidCountdownData()
                    validateAndCleanCountdownData()
                    window.location.reload()
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  🗑️ Clear Invalid Data
                </button>
                <button
                  onClick={() => {
                    console.log('User Manager:', userManager)
                    console.log('Current User:', userManager.getCurrentUser())
                    console.log('Available Features:', userManager.getAvailableFeatures())
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  👤 Debug User Management
                </button>
                <button
                  onClick={() => {
                    console.log('Plugin Registry:', PluginRegistry.getAllPlugins())
                    console.log('Widget Components:', getWidgetComponents())
                  }}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm"
                >
                  🔌 Debug Plugin System
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Regular User Dashboard */
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-min"
            >
              <SortableContext
                items={widgets.sort((a, b) => a.order - b.order).map(w => w.id)}
                strategy={verticalListSortingStrategy}
              >
                {widgets
                  .sort((a, b) => a.order - b.order)
                  .map((widget, index) => (
                    <SortableWidget
                      key={widget.id}
                      widget={widget}
                      onRemove={removeWidget}
                      onSettings={(id) => {
                        // Widget settings functionality
                        console.log('Settings for', widget.type)
                      }}
                      onWidthChange={handleWidthChange}
                      onItemSelect={handleItemSelect}
                    />
                  ))}
              </SortableContext>
            </motion.div>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeId ? (
                <div className="transform rotate-3 scale-105 shadow-2xl">
                  {(() => {
                    const activeWidget = widgets.find(w => w.id === activeId)
                    if (!activeWidget) return null

                    const WidgetComponent = widgetComponents[activeWidget.type]
                    return (
                      <WidgetComponent
                        id={activeWidget.id}
                        width={activeWidget.width}
                        onRemove={() => {}}
                        onSettings={() => {}}
                        onWidthChange={() => {}}
                        onItemSelect={() => {}}
                      />
                    )
                  })()}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        {/* Empty State - Only show for non-admin users */}
        {userLevel !== 'admin' && widgets.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full flex flex-col items-center justify-center py-16 text-center"
          >
            {userLevel === 'anon' ? (
              // Anonymous user empty state
              <>
                <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Welcome to Disney Trip Planner!
                </h3>
                <p className="text-gray-500 mb-4 max-w-md">
                  Create a free account to save your dashboard layout and access all features
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => setIsAddingWidget(true)}
                    className="bg-gradient-to-r from-disney-blue to-disney-purple text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:shadow-lg transition-all duration-200"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Try Widgets (Demo Mode)</span>
                  </button>
                  <div className="text-sm text-gray-400">
                    <p>• Widgets won&apos;t save in demo mode</p>
                    <p>• Create an account to unlock full features</p>
                  </div>
                </div>
              </>
            ) : (
              // Standard/Premium user empty state
              <>
                <Sparkles className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Welcome to your Dashboard!
                </h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  Add widgets to create your personalized Disney planning experience
                </p>
                <button
                  onClick={() => setIsAddingWidget(true)}
                  className="bg-gradient-to-r from-disney-blue to-disney-purple text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Your First Widget</span>
                </button>
              </>
            )}
          </motion.div>
        )}

        {/* Add Widget Modal - Only show for non-admin users */}
        {userLevel !== 'admin' && isAddingWidget && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 max-w-2xl w-full shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-disney-blue to-disney-purple p-2 rounded-lg">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Add Widget</h3>
                                        <p className="text-sm text-gray-600">
                      {userLevel === 'anon'
                        ? 'Try widgets in demo mode (changes won&apos;t save)'
                        : 'Choose a widget to add to your dashboard'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddingWidget(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl hover:bg-gray-100 p-1 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Demo Mode Banner for Anonymous Users */}
              {userLevel === 'anon' && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-blue-800">Demo Mode</span>
                  </div>
                                    <p className="text-sm text-blue-700">
                    You&apos;re in demo mode. Widgets will work but won&apos;t save your data.
                    <button className="ml-2 text-blue-600 hover:text-blue-800 underline font-medium">
                      Create free account
                    </button>
                    to unlock full features.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {widgetOptions.map((option) => {
                  const IconComponent = getIconComponent(option.icon)
                  return (
                    <motion.button
                      key={option.type}
                      onClick={() => addWidget(option.type)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative group p-6 text-left border-2 border-gray-200 rounded-xl hover:border-disney-blue hover:shadow-lg transition-all duration-200 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50`}
                    >
                      {/* Premium Badge */}
                      {option.isPremium && (
                        <div className="absolute top-3 right-3 flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          <Crown className="w-3 h-3" />
                          <span>Premium</span>
                        </div>
                      )}

                      {/* Icon */}
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${option.color} bg-gradient-to-r`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>

                      {/* Content */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-bold text-gray-800">
                            {option.name}
                          </h4>
                          {option.isPremium && (
                            <Star className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>

                        <p className="text-sm text-gray-600 leading-relaxed">
                          {option.description}
                        </p>

                        {/* Enhanced descriptions */}
                        <div className="text-xs text-gray-500 space-y-1">
                          {option.type === 'countdown' && (
                            <p>• Track days until your magical Disney adventure</p>
                          )}
                          {option.type === 'planner' && (
                            <p>• Plan your daily itinerary with park schedules</p>
                          )}
                          {option.type === 'budget' && (
                            <p>• Monitor expenses and stay within your budget</p>
                          )}
                          {option.type === 'packing' && (
                            <p>• Create comprehensive packing checklists</p>
                          )}
                        </div>
                      </div>

                      {/* Hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-disney-blue/5 to-disney-purple/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </motion.button>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Widgets can be resized, reordered, and customized to fit your planning needs
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}