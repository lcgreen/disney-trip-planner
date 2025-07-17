'use client'

import { Clock } from 'lucide-react'
import CountdownTimer from '@/components/CountdownTimer'
import PluginPageWrapper from '@/components/common/PluginPageWrapper'
import { CountdownData } from '@/types'

export default function CountdownPage() {
  const handleSave = (data: Partial<CountdownData>) => {
    // This will be handled by PluginPageWrapper
    console.log('Save handled by PluginPageWrapper:', data)
  }

  const handleLoad = (countdown: CountdownData) => {
    // The CountdownTimer component now handles this internally via Redux
    console.log('Load handled by CountdownTimer:', countdown)
  }

  const handleNew = () => {
    // The CountdownTimer component now handles this internally via Redux
    console.log('New countdown handled by CountdownTimer')
  }

  return (
    <PluginPageWrapper<CountdownData>
      title="Disney Countdown Timer"
      description="Count down the magical days until your Disney adventure begins!"
      icon={Clock}
      gradient="bg-gradient-to-r from-disney-blue to-disney-purple"
      pluginId="countdown"
      isPremium={false}
      onSave={handleSave}
      onLoad={handleLoad}
      onNew={handleNew}
      placeholder="Name this countdown..."
      saveButtonText="Save Countdown"
      loadButtonText="Load Countdown"
      newButtonText="New Countdown"
      saveModalTitle="Save Countdown"
      saveModalDescription="Save your current countdown to access it later. Your countdown will be stored locally in your browser."
    >
      <CountdownTimer />
    </PluginPageWrapper>
  )
}