'use client'

import { useState } from 'react'
import { Calendar } from 'lucide-react'
import PluginPageWrapper from '@/components/common/PluginPageWrapper'
import TripPlanner from '@/components/TripPlanner'
import { PlannerData } from '@/types'
import { useReduxPlanner } from '@/hooks/useReduxPlanner'

export default function PlannerPage() {
  const [currentName, setCurrentName] = useState('')
  const [canSave, setCanSave] = useState(false)
  const [activePlan, setActivePlan] = useState<PlannerData | null>(null)

  // Get Redux actions
  const { loadPlannerData, setCurrentPlannerItem } = useReduxPlanner()

  const handleSave = (data: Partial<PlannerData>) => {
    // This will be handled by PluginPageWrapper
    console.log('Save handled by PluginPageWrapper:', data)
  }

  const handleLoad = (plan: PlannerData) => {
    // Load the planner data into Redux store
    loadPlannerData(plan)
    setCurrentPlannerItem(plan)

    // Also update local state for the page wrapper
    setActivePlan(plan)
    setCurrentName(plan.name)
  }

  const handleNew = () => {
    setCurrentName('')
    setActivePlan(null)
    setCanSave(false)
  }

  return (
    <PluginPageWrapper<PlannerData>
      title="Disney Trip Planner"
      description="Plan your perfect Disney days with our interactive itinerary builder"
      icon={Calendar}
      gradient="bg-gradient-to-r from-park-magic to-park-epcot"
      pluginId="planner"
      isPremium={true}
      showPreview={true}
      currentName={currentName}
      onNameChange={setCurrentName}
      onSave={handleSave}
      onLoad={handleLoad}
      onNew={handleNew}
      setCanSave={setCanSave}
      placeholder="Name this trip plan..."
      saveButtonText="Save Plan"
      loadButtonText="Load Plan"
      newButtonText="New Plan"
      saveModalTitle="Save Trip Plan"
      saveModalDescription="Save your current trip plan to access it later. Your plan will be stored locally in your browser."
    >
      <TripPlanner
        name={currentName}
        onNameChange={setCurrentName}
        onSave={handleSave}
        onLoad={handleLoad}
        onNew={handleNew}
        activePlan={activePlan}
        setCanSave={setCanSave}
      />
    </PluginPageWrapper>
  )
}