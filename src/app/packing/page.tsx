'use client'

import { useState } from 'react'
import { Package } from 'lucide-react'
import PluginPageWrapper from '@/components/common/PluginPageWrapper'
import PackingChecklist from '@/components/PackingChecklist'
import { PackingData } from '@/types'
import { useReduxPacking } from '@/hooks/useReduxPacking'

export default function PackingPage() {
  const [currentName, setCurrentName] = useState('')
  const [canSave, setCanSave] = useState(false)
  const [activeList, setActiveList] = useState<PackingData | null>(null)

  // Get Redux actions
  const { loadPackingData, setCurrentPackingItem } = useReduxPacking()

  const handleSave = (data: Partial<PackingData>) => {
    // This will be handled by PluginPageWrapper
    console.log('Save handled by PluginPageWrapper:', data)
  }

  const handleLoad = (list: PackingData) => {
    // Load the packing data into Redux store
    loadPackingData(list)
    setCurrentPackingItem(list)

    // Also update local state for the page wrapper
    setActiveList(list)
    setCurrentName(list.name)
  }

  const handleNew = () => {
    setCurrentName('')
    setActiveList(null)
    setCanSave(false)
  }

  return (
    <PluginPageWrapper<PackingData>
      title="Disney Packing Checklist"
      description="Never forget to pack the essentials for your magical Disney adventure"
      icon={Package}
      gradient="bg-gradient-to-r from-green-500 to-emerald-500"
      pluginId="packing"
      isPremium={true}
      showPreview={true}
      currentName={currentName}
      onNameChange={setCurrentName}
      onSave={handleSave}
      onLoad={handleLoad}
      onNew={handleNew}
      setCanSave={setCanSave}
      placeholder="Name this packing list..."
      saveButtonText="Save List"
      loadButtonText="Load List"
      newButtonText="New List"
      saveModalTitle="Save Packing List"
      saveModalDescription="Save your current packing list to access it later. Your list will be stored locally in your browser."
    >
      <PackingChecklist
        name={currentName}
        onNameChange={setCurrentName}
        setCanSave={setCanSave}
      />
    </PluginPageWrapper>
  )
}