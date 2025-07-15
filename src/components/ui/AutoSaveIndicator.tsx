import { useState, useEffect } from 'react'
import { Check, AlertCircle, Clock } from 'lucide-react'

interface AutoSaveIndicatorProps {
  isSaving?: boolean
  lastSaved?: Date | null
  error?: string | null
  className?: string
}

export default function AutoSaveIndicator({
  isSaving = false,
  lastSaved = null,
  error = null,
  className = ''
}: AutoSaveIndicatorProps) {
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    if (isSaving || error) {
      setShowIndicator(true)
      const timer = setTimeout(() => setShowIndicator(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isSaving, error])

  if (!showIndicator && !lastSaved) return null

  return (
    <div className={`flex items-center gap-2 text-xs ${className}`}>
      {isSaving && (
        <>
          <Clock className="w-3 h-3 text-yellow-500 animate-pulse" />
          <span className="text-yellow-600">Saving...</span>
        </>
      )}

      {error && (
        <>
          <AlertCircle className="w-3 h-3 text-red-500" />
          <span className="text-red-600">Save failed</span>
        </>
      )}

      {!isSaving && !error && lastSaved && (
        <>
          <Check className="w-3 h-3 text-green-500" />
          <span className="text-green-600">
            Saved {lastSaved.toLocaleTimeString()}
          </span>
        </>
      )}
    </div>
  )
}