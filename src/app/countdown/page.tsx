'use client'

import { useState } from 'react'
import { Clock } from 'lucide-react'
import CountdownTimer from '@/components/CountdownTimer'
import PluginPageWrapper from '@/components/common/PluginPageWrapper'
import { CountdownData } from '@/types'

export default function CountdownPage() {
  const [currentName, setCurrentName] = useState('')
  const [canSave, setCanSave] = useState(false)
  const [activeCountdown, setActiveCountdown] = useState<CountdownData | null>(null)

  const handleSave = (data: Partial<CountdownData>) => {
    // This will be handled by PluginPageWrapper
    console.log('Save handled by PluginPageWrapper:', data)
  }

  const handleLoad = (countdown: CountdownData) => {
    setActiveCountdown(countdown)
    setCurrentName(countdown.name)
  }

  const handleNew = () => {
    setCurrentName('')
    setActiveCountdown(null)
    setCanSave(false)
  }

  return (
    <PluginPageWrapper<CountdownData>
      title="Disney Countdown Timer"
      description="Count down the magical days until your Disney adventure begins!"
      icon={Clock}
      gradient="bg-gradient-to-r from-disney-blue to-disney-purple"
      pluginId="countdown"
      isPremium={false}
      currentName={currentName}
      onNameChange={setCurrentName}
      onSave={handleSave}
      onLoad={handleLoad}
      onNew={handleNew}
      setCanSave={setCanSave}
      placeholder="Name this countdown..."
      saveButtonText="Save Countdown"
      loadButtonText="Load Countdown"
      newButtonText="New Countdown"
      saveModalTitle="Save Countdown"
      saveModalDescription="Save your current countdown to access it later. Your countdown will be stored locally in your browser."
    >
      <CountdownTimer
        name={currentName}
        onNameChange={setCurrentName}
        onSave={handleSave}
        onLoad={handleLoad}
        onNew={handleNew}
        activeCountdown={activeCountdown}
        setCanSave={setCanSave}
      />
    </PluginPageWrapper>
  )
}