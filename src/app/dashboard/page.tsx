'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Layout, Settings, Sparkles, GripVertical } from 'lucide-react'
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
import CountdownWidget from '@/components/widgets/CountdownWidget'
import TripPlannerWidget from '@/components/widgets/TripPlannerWidget'
import BudgetWidget from '@/components/widgets/BudgetWidget'
import PackingWidget from '@/components/widgets/PackingWidget'
import { WidgetConfigManager, WidgetConfig } from '@/lib/widgetConfig'

const widgetComponents = {
  countdown: CountdownWidget,
  planner: TripPlannerWidget,
  budget: BudgetWidget,
  packing: PackingWidget,
}

const widgetOptions = [
  { type: 'countdown' as const, name: 'Disney Countdown', description: 'Track days until your trip' },
  { type: 'planner' as const, name: 'Today\'s Plan', description: 'View your daily itinerary' },
  { type: 'budget' as const, name: 'Budget Tracker', description: 'Monitor your spending' },
  { type: 'packing' as const, name: 'Packing List', description: 'Track packing progress' },
]

// Sortable Widget Wrapper Component
function SortableWidget({
  widget,
  onRemove,
  onSettings,
  onWidthChange,
  onItemSelect
}: {
  widget: WidgetConfig
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

  const WidgetComponent = widgetComponents[widget.type]

  // Helper function to get grid classes based on widget size and width
  const getGridClasses = (size: string, width?: string) => {
    if (width) {
      const widthOptions = [
        { value: '1', class: 'col-span-1' },
        { value: '2', class: 'col-span-1 md:col-span-2' },
        { value: '3', class: 'col-span-1 md:col-span-2 xl:col-span-3' },
        { value: '4', class: 'col-span-1 md:col-span-2 xl:col-span-4' }
      ]
      return widthOptions.find(w => w.value === width)?.class || 'col-span-1'
    }

    switch (size) {
      case 'large':
        return 'col-span-1 lg:col-span-2'
      case 'wide':
        return 'col-span-1 sm:col-span-2'
      case 'full':
        return 'col-span-1 sm:col-span-2 xl:col-span-3'
      case 'small':
      case 'medium':
      case 'tall':
      default:
        return 'col-span-1'
    }
  }

            return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`${getGridClasses(widget.size, widget.width)} relative group ${isDragging ? 'opacity-30' : ''}`}
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
                    onWidthChange={(width) => onWidthChange(widget.id, width)}
                    onItemSelect={(itemId) => onItemSelect(widget.id, itemId)}
                  />
    </motion.div>
  )
}

export default function DashboardPage() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([])
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
    // Load widget configs
    const configs = WidgetConfigManager.getConfigs()
    setWidgets(configs)
  }, [])

  const addWidget = (type: WidgetConfig['type']) => {
    const newConfig: WidgetConfig = {
      id: `${type}-${Date.now()}`,
      type,
      size: 'medium',
      order: widgets.length, // Set order to be at the end
      selectedItemId: undefined, // No item selected by default
      settings: {}
    }

    WidgetConfigManager.addConfig(newConfig)
    setWidgets(prev => [...prev, newConfig])
    setIsAddingWidget(false)
  }

  const removeWidget = (id: string) => {
    WidgetConfigManager.removeConfig(id)
    setWidgets(prev => prev.filter(w => w.id !== id))
  }



  const handleWidthChange = (id: string, width: string) => {
    WidgetConfigManager.updateConfig(id, { width })
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, width } : w))
  }

  const handleItemSelect = (id: string, itemId: string | null) => {
    WidgetConfigManager.updateConfig(id, { selectedItemId: itemId || undefined })
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, selectedItemId: itemId || undefined } : w))
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
      WidgetConfigManager.reorderWidgets(reorderedWidgets.map(w => w.id))
    }
  }

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
              </h1>
              <p className="text-gray-600 mt-2">
                Your personalized Disney planning command center
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsAddingWidget(true)}
                className="bg-gradient-to-r from-disney-blue to-disney-purple text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:shadow-lg transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Add Widget</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Widgets Grid */}
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

        {/* Empty State */}
        {widgets.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full flex flex-col items-center justify-center py-16 text-center"
          >
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
          </motion.div>
        )}

        {/* Add Widget Modal */}
        {isAddingWidget && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Add Widget</h3>
                <button
                  onClick={() => setIsAddingWidget(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                {widgetOptions.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => addWidget(option.type)}
                    className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-disney-blue hover:bg-disney-blue/5 transition-all duration-200"
                  >
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {option.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {option.description}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}