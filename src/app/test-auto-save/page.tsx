'use client'

import { useState } from 'react'
import CountdownTimer from '@/components/CountdownTimer'

export default function TestAutoSavePage() {
  const [savedCountdowns, setSavedCountdowns] = useState<any[]>([])

  const handleSave = (data: any) => {
    console.log('[Test] Save triggered:', data)
    setSavedCountdowns(prev => [...prev, data])
  }

  const handleNew = () => {
    console.log('[Test] New countdown triggered')
  }

  const handleLoad = (countdown: any) => {
    console.log('[Test] Load countdown:', countdown)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Auto-Save Test Page</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Countdown Timer</h2>
          <CountdownTimer
            widgetId="test-widget-123"
            isEditMode={true}
            name="Test Countdown"
            onSave={handleSave}
            onNew={handleNew}
            onLoad={handleLoad}
            savedCountdowns={savedCountdowns}
          />
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Saved Countdowns</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(savedCountdowns, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}