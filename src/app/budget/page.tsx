'use client'

import { useState } from 'react'
import { DollarSign } from 'lucide-react'
import PluginPageWrapper from '@/components/common/PluginPageWrapper'
import BudgetTracker from '@/components/BudgetTracker'
import { BudgetData } from '@/types'
import { useReduxBudget } from '@/hooks/useReduxBudget'

export default function BudgetPage() {
  const [currentName, setCurrentName] = useState('')
  const [canSave, setCanSave] = useState(false)
  const [activeBudget, setActiveBudget] = useState<BudgetData | null>(null)

    // Get Redux actions
  const { loadBudget, setCurrentBudget } = useReduxBudget()

  const handleSave = (data: Partial<BudgetData>) => {
    // This will be handled by PluginPageWrapper
    console.log('Save handled by PluginPageWrapper:', data)
  }

  const handleLoad = (budget: BudgetData) => {
    // Load the budget data into Redux store
    loadBudget(budget)
    setCurrentBudget(budget)

    // Also update local state for the page wrapper
    setActiveBudget(budget)
    setCurrentName(budget.name)
  }

  const handleNew = () => {
    setCurrentName('')
    setActiveBudget(null)
    setCanSave(false)
  }

  return (
    <PluginPageWrapper<BudgetData>
      title="Disney Budget Tracker"
      description="Keep track of your Disney spending and stay within your magical budget"
      icon={DollarSign}
      gradient="bg-gradient-to-r from-disney-gold to-disney-orange"
      pluginId="budget"
      isPremium={true}
      showPreview={true}
      currentName={currentName}
      onNameChange={setCurrentName}
      onSave={handleSave}
      onLoad={handleLoad}
      onNew={handleNew}
      setCanSave={setCanSave}
      placeholder="Name this budget..."
      saveButtonText="Save Budget"
      loadButtonText="Load Budget"
      newButtonText="New Budget"
      saveModalTitle="Save Budget"
      saveModalDescription="Save your current budget to access it later. Your budget data will be stored locally in your browser."
    >
      <BudgetTracker
        name={currentName}
        onNameChange={setCurrentName}
        onSave={handleSave}
        onLoad={handleLoad}
        onNew={handleNew}
        activeBudget={activeBudget}
        setCanSave={setCanSave}
      />
    </PluginPageWrapper>
  )
}